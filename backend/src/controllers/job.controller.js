const aiService = require("../services/ai.services");

async function retrieveAgenticJobs(req, res) {
  try {
    const { jobRole } = req.body;
    
    if (!jobRole || jobRole.trim() === "") {
      return res.status(400).json({
        status: "Failed",
        message: "jobRole parameter is required."
      });
    }

    const result = await aiService.retrieveJobsAgentically({ jobRole });
    
    res.status(200).json({
      status: "Successful",
      response: result
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Agentic job search failed.",
      error: error.message
    });
  }
}

module.exports = {
  retrieveAgenticJobs
};
