const pdfParse = require('pdf-parse');
const path = require('path'); 
const upload = require("../middlewares/file.middleware").upload
const aiService = require("../services/ai.services")

async function generateUserInterviewReport(req, res) {
  const resume = req.file;

  if (!resume) {
    return res.status(400).json({
      message: "Resume file is required"
    });
  }

  const { selfDescription, jobDescription } = req.body;

  const pdfData = await pdfParse(resume.buffer);

  const response = await aiService.generateInterviewReport({
    resume: pdfData.text,
    jobDescription,
    selfDescription
  });

  res.status(201).json({
    status: "Successful",
    response
  });
}
module.exports ={generateUserInterviewReport}