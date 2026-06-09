const mongoose = require('mongoose');

const questionItemSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'behavioral', 'resume-based'],
    required: true
  },
  topic: {
    type: String,
    default: ''
  },
  userAnswer: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  idealAnswer: {
    type: String,
    default: ''
  },
  followUpQuestion: {
    type: String,
    default: ''
  },
  followUpAnswer: {
    type: String,
    default: ''
  },
  followUpScore: {
    type: Number,
    default: null
  },
  followUpFeedback: {
    type: String,
    default: ''
  }
}, { _id: false });

const mockInterviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  jobRole: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null
  },
  extractedDetails: {
    projects: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    technologies: { type: [String], default: [] }
  },
  focusAreas: {
    type: [String],
    default: []
  },
  questions: [questionItemSchema],
  overallScore: {
    type: Number,
    default: null
  },
  technicalScore: {
    type: Number,
    default: null
  },
  communicationScore: {
    type: Number,
    default: null
  },
  strengths: {
    type: [String],
    default: []
  },
  weaknesses: {
    type: [String],
    default: []
  },
  lackingSkills: {
    type: [String],
    default: []
  },
  recommendations: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['initiated', 'in_progress', 'completed'],
    default: 'initiated'
  }
}, {
  timestamps: true
});

const mockInterviewModel = mongoose.model('MockInterview', mockInterviewSchema);

module.exports = mockInterviewModel;
