const assert = require('assert');
// Temporarily set a dummy Groq key before importing aiClient
process.env.GROQ_API_KEY = 'gsk_dummy_key_for_testing';

const aiClient = require('./aiClient');

async function testGroqRouting() {
  console.log("Testing Groq Routing Configuration...");
  
  // 1. Verify Groq detection
  assert.strictEqual(aiClient.isGroqEnabled(), true, "isGroqEnabled should return true when GROQ_API_KEY is present");
  console.log("✓ isGroqEnabled() returns true successfully.");

  // 2. Test chatCompletion call routing
  try {
    console.log("Calling chatCompletion...");
    await aiClient.chatCompletion({
      messages: [{ role: "user", content: "Hello" }],
      systemInstruction: "You are a test assistant."
    });
  } catch (error) {
    // We expect a 401 unauthorized because of our dummy key, but it must be from Groq
    const status = error.status || (error.response && error.response.status);
    console.log(`Received error code: ${status}`);
    const isGroqEndpoint = error.config && error.config.url && error.config.url.includes("api.groq.com");
    assert.strictEqual(isGroqEndpoint, true, "Request should have been directed to Groq completions endpoint");
    console.log("✓ chatCompletion successfully routed to Groq API endpoint.");
  }

  // 3. Test transcribeAudio call routing
  try {
    console.log("Calling transcribeAudio...");
    const dummyBuffer = Buffer.from("dummy audio content");
    await aiClient.transcribeAudio(dummyBuffer, "audio/webm");
  } catch (error) {
    const isGroqEndpoint = error.config && error.config.url && error.config.url.includes("api.groq.com");
    assert.strictEqual(isGroqEndpoint, true, "Request should have been directed to Groq transcribe endpoint");
    console.log("✓ transcribeAudio successfully routed to Groq API endpoint.");
  }

  console.log("\n=================================");
  console.log("GROQ ROUTING VERIFICATION PASSED!");
  console.log("=================================");
}

testGroqRouting().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
