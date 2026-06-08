const axios = require("axios");

async function fetchJobPostings(jobRole) {
  const jobs = [];
  let linkedinFailed = false;
  let unstopFailed = false;

  // 1. Try to fetch from LinkedIn public guest jobs endpoint
  try {
    const encodedRole = encodeURIComponent(jobRole);
    const linkedinUrl = `https://www.linkedin.com/jobs/search?keywords=${encodedRole}`;
    
    const response = await axios.get(linkedinUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      timeout: 5000
    });

    const html = response.data;
    // Simple regex parsing of LinkedIn guest jobs list items
    const jobRegex = /<h3 class="base-search-card__title">([\s\S]*?)<\/h3>/g;
    const companyRegex = /<h4 class="base-search-card__subtitle">([\s\S]*?)<\/h4>/g;
    const linkRegex = /<a class="base-card__full-link[^"]*" href="([^"]*)"/g;
    const locationRegex = /<span class="job-search-card__location">([\s\S]*?)<\/span>/g;

    let match;
    const titles = [];
    const companies = [];
    const links = [];
    const locations = [];

    while ((match = jobRegex.exec(html)) !== null) {
      titles.push(match[1].trim());
    }
    while ((match = companyRegex.exec(html)) !== null) {
      companies.push(match[1].replace(/<[^>]*>/g, "").trim());
    }
    while ((match = linkRegex.exec(html)) !== null) {
      links.push(match[1].trim());
    }
    while ((match = locationRegex.exec(html)) !== null) {
      locations.push(match[1].trim());
    }

    for (let i = 0; i < Math.min(titles.length, 5); i++) {
      jobs.push({
        title: titles[i],
        company: companies[i] || "LinkedIn Recruiter",
        location: locations[i] || "Remote / India",
        link: links[i] || "https://www.linkedin.com/jobs",
        platform: "LinkedIn"
      });
    }
  } catch (err) {
    console.error("LinkedIn Guest Scraper failed:", err.message);
    linkedinFailed = true;
  }

  // 2. Try to fetch from Unstop search
  try {
    const encodedRole = encodeURIComponent(jobRole);
    // Unstop opportunity API endpoint search
    const unstopUrl = `https://unstop.com/api/public/opportunity/search-result?opportunity=jobs&search=${encodedRole}`;
    const response = await axios.get(unstopUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      timeout: 5000
    });

    if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
      const listings = response.data.data.data;
      for (let i = 0; i < Math.min(listings.length, 5); i++) {
        const item = listings[i];
        
        let loc = "Online";
        if (item.locations && item.locations.length > 0) {
          const l = item.locations[0];
          loc = l.city ? `${l.city}, ${l.country || "India"}` : (item.region || "Online");
        } else if (item.region) {
          loc = item.region;
        }

        jobs.push({
          title: item.title,
          company: item.organisation?.name || "Unstop Partner",
          location: loc,
          link: item.seo_url || item.short_url || `https://unstop.com/o/${item.short_id || item.id}`,
          platform: "Unstop"
        });
      }
    }
  } catch (err) {
    console.error("Unstop Opportunity fetch failed:", err.message);
    unstopFailed = true;
  }

  // If both APIs failed due to connectivity, throw an error
  if (linkedinFailed && unstopFailed) {
    throw new Error("Job search failed due to network connectivity issues.");
  }

  return jobs;
}

module.exports = {
  fetchJobPostings
};
