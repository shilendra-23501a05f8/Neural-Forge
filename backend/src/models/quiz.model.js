const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Question text is required" ]
    },
    options: [ {
        type: String,
        required: [ true, "Option is required" ]
    } ],
    correctAnswer: {
        type: String,
        required: [ true, "Correct answer is required" ]
    },
    selectedAnswer: {
        type: String,
        default: ""
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    explanation: {
        type: String,
        required: [ true, "Explanation is required" ]
    }
}, {
    _id: false
});

const quizResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // references the users collection
        required: [ true, "User reference is required" ]
    },
    title: {
        type: String,
        required: [ true, "Quiz title is required" ]
    },
    difficulty: {
        type: String,
        enum: [ "Easy", "Medium", "Hard" ],
        required: [ true, "Difficulty level is required" ]
    },
    score: {
        type: Number,
        required: [ true, "Score is required" ]
    },
    totalQuestions: {
        type: Number,
        required: [ true, "Total number of questions is required" ]
    },
    questions: [ quizQuestionSchema ]
}, {
    timestamps: true
});

const quizModel = mongoose.model("Quiz", quizResultSchema);

module.exports = { quizModel };
