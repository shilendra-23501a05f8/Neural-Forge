# 🚀 VidyaGuide: Agentic AI Career Coach & Resume Mentor

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)

An advanced, end-to-end **Agentic AI-powered career coach** designed to automate resume feedback, track professional skill gaps, generate custom timelines, run adaptive technical interview quizzes, and fetch matching job listings using an intelligent scraping loop.

</div>

---

## 🗺️ System Architecture

The diagram below details the data flow and integration between the Vite client, the MERN server, and the Google Gemini API agent:

```mermaid
graph TD
    Client[React Client / Vite] -->|1. Uploads PDF or Selects Resume| Backend[Express Backend / Node.js]
    Backend -->|2. Saves User / Resume / Quiz Results| Database[(MongoDB / Mongoose)]
    Backend -->|3. Feeds Raw Parsing + Settings| Gemini[Google Gemini AI / Zod Validation]
    Gemini -->|4. Tool Call Request| JobScraper[LinkedIn & Unstop Scraper Service]
    JobScraper -->|5. Scraped Opportunity Feeds| Gemini
    Gemini -->|6. Validated Structured JSON| Backend
    Backend -->|7. API Response / HSL Dashboard render| Client
```

---

## ✨ Core Features

### 📁 Resume Portfolio & Profile Manager
* **In-Memory PDF Parser**: Converts PDF uploads into raw text structures instantly.
* **Resume Manager Collection**: Users can drag-and-drop multiple resumes to their profile.
* **Dropdown Selection**: Generated reports can target stored profile resumes, eliminating redundant uploads.
* **Resume Maintenance**: Full dashboard to view upload histories and delete files dynamically.

### 🎯 AI Coaching Reports & Prep Roadmaps
* **Intelligent Match Score**: Instant alignment metrics (0-100%) against target job descriptions.
* **Mock Interviews**: Returns 5-7 technical questions and 3-5 behavioral questions matching candidate-intent and answers.
* **Adaptive Timelines**: Dynamic preparation timelines that scale from 7 up to 30+ days based on skill gaps.
* **Learning Badges**: Clickable video resources (🎥 YouTube) and official reference pages (📄 documentation).

### 🧠 Adaptive Interview Prep Quizzes
* **Hybrid Scope Selectors**: Launch quizzes targeting either job description history or identified skill gaps.
* **Custom Parameter Bounds**: Supports custom numeric input count (1-30 questions) and difficulty levels.
* **MCQ Game Loop**: Interactive deck showing progress bars and immediate choice checkmarks.
* **Detailed AI Explanations**: Explains the correct answer logic with Gemini-backed explanations.
* **Performance Tracker**: Score logging and past quiz history persisted in MongoDB.

### 💼 Agentic Job Discovery
* **Scraper Tool Loops**: Uses Gemini function declarations to search LinkedIn and Unstop.
* **AI Relevance Filter**: Discards unrelated profiles and filters jobs matching the search query.

---

## 📁 Repository Directory Structure

```text
├── backend/
│   ├── config/              # MongoDB ODM connections
│   ├── src/
│   │   ├── controllers/     # Authentication, reports, resumes, and quiz logic
│   │   ├── middlewares/     # JWT authentication guards and multer file handlers
│   │   ├── models/          # Mongoose database schemas
│   │   ├── routes/          # Mounted endpoints
│   │   └── services/        # Gemini AI integrations & scraper methods
│   ├── index.js             # Middleware configurations & routes binding
│   └── server.js            # Node HTTP server listener
└── frontend/
    ├── src/
    │   ├── components/      # UI components (Sidebar, Report Details)
    │   ├── pages/           # Pages (Dashboard, Profile, Quiz, Search)
    │   ├── utils/           # Client-side API fetch utilities
    │   ├── App.jsx          # Route configurations
    │   ├── index.css        # Core design system stylesheet
    │   └── main.jsx         # App bootstrap anchor
```

---

## ⚙️ Prerequisites & Environment Variables

Create a file named `.env` in the `backend` directory:

```env
# MongoDB Connection URI (Local database or Atlas Cluster)
mongo_uri=mongodb://localhost:27017/agentic-ai-resume

# Google Gemini API credential
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret key for authentication token hashing
jwt_secret=your_super_secret_jwt_key_here
```

---

## 🚀 Getting Started

Follow these steps to set up and run the application locally:

### 1. Start the Backend API
Navigate to the `backend` folder, install npm packages, and start the development server:
```bash
cd backend
npm install
npm start
```
*(The backend server will connect to MongoDB and start listening on port `3000`)*

### 2. Start the Frontend Client
Open a new terminal window, navigate to the `frontend` folder, install npm packages, and launch Vite:
```bash
cd frontend
npm install
npm run dev
```
*(The client application will start running on port `5173`)*

---

## 🔌 Core API Specifications

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Registers a new user account | No |
| **POST** | `/api/auth/login` | Authenticates user and sets token cookie | No |
| **GET** | `/api/auth/get-me` | Validates session token and returns credentials | Yes |
| **POST** | `/api/auth/logout` | Clears local cookie and blacklists token | Yes |
| **POST** | `/api/interview/` | Generates a career report from parsed PDF upload or stored resume | Yes |
| **GET** | `/api/interview/history` | Fetches historical reports generated by user | Yes |
| **GET** | `/api/resumeUpload/` | Lists metadata of user's stored resumes | Yes |
| **POST** | `/api/resumeUpload/` | Uploads and saves a new resume to profile | Yes |
| **DELETE**| `/api/resumeUpload/:id` | Deletes a stored resume from database | Yes |
| **POST** | `/api/quiz/generate` | Generates custom multiple-choice quiz questions | Yes |
| **POST** | `/api/quiz/submit` | Grades and saves the completed quiz score | Yes |
| **GET** | `/api/quiz/history` | Retrieves the history of completed quizzes | Yes |
| **POST** | `/api/jobs/search` | Scrapes public search opportunities agentically | Yes |

---

## 🔄 Detailed Feature & API Workflows

This section details the step-by-step execution flow for every application feature and API request, complete with interactive Mermaid diagrams mapping frontend triggers directly to backend controllers, MongoDB schemas, and the Google Gemini AI Agent loop.

### 🔑 1. User Authentication Flow
Handles registering accounts, logging in, managing browser cookies/session validation, and handling secure sign-out.

#### 🛠️ Files Involved:
* **Routes**: [user.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/user.routes.js)
* **Controller**: [user.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/user.controller.js)
* **Model**: [user.models.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models/user.models.js)
* **Auth Guard Middleware**: [auth.middleware.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/middlewares/auth.middleware.js)

#### 📝 Step-by-Step Flow:
1. **Registration**: 
   * Client sends a `POST` request to `/api/auth/register` with `name`, `email`, and `password`.
   * The backend validates if the email is already registered using [userModel.findOne()](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/user.controller.js#L9).
   * If not registered, [userModel.create()](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/user.controller.js#L18) inserts a new document. A database pre-save hook automatically hashes the password using `bcrypt` (10 rounds).
2. **Login**: 
   * Client sends a `POST` request to `/api/auth/login` with credentials.
   * Backend retrieves the user by email including the password hash.
   * `bcrypt.compare()` checks credentials.
   * On success, a JWT is signed with `userId` and a cookie named `token` is set with a 2-hour expiration.
3. **Session Check**:
   * On application mount, Vite sends a `GET` request to `/api/auth/get-me`.
   * The `authUser` middleware intercepts, checks/verifies the token, and loads user info.
4. **Logout**:
   * Client sends a `POST` request to `/api/auth/logout`.
   * The backend clears the `token` cookie and registers the JWT inside `BlackListModel` to blacklist the token.

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef server fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef db fill:#f59e0b,stroke:#b45309,color:#fff,font-weight:bold;
    
    Start["User Actions: Register / Login / Logout / Session Check"] --> Route{Select Action}
    
    %% Register
    Route -->|Register| RegisterPost["POST /api/auth/register"]:::server
    RegisterPost --> FindUser{"Check existing email"}:::db
    FindUser -->|Exists| RegFail["Return 422: User Already Exists"]:::server
    FindUser -->|New| CreateUser["Create User in DB"]:::db
    CreateUser --> RegSuccess["Return 201: Created User Metadata"]:::server
    
    %% Login
    Route -->|Login| LoginPost["POST /api/auth/login"]:::server
    LoginPost --> FindLoginUser{"Fetch User & select Password"}:::db
    FindLoginUser -->|Not Found| LoginFailEmail["Return 401: Account does not exist"]:::server
    FindLoginUser -->|Found| CheckPassword{"Compare Password Hash"}:::db
    CheckPassword -->|Mismatch| LoginFailPass["Return 401: Invalid Password"]:::server
    CheckPassword -->|Match| GenToken["Sign JWT Token & set HTTP-Only Cookie"]:::server
    GenToken --> LoginSuccess["Return 200: User details + JWT Token"]:::server
    
    %% Session Check
    Route -->|Session Check| GetMe["GET /api/auth/get-me"]:::server
    GetMe --> AuthGuard["authMiddleware.authUser: Verify Token & check Blacklist"]:::server
    AuthGuard -->|Invalid or Blacklisted| GetMeFail["Return 401: Unauthorized"]:::server
    AuthGuard -->|Valid| FetchUser["Fetch User details by ID"]:::db
    FetchUser --> GetMeSuccess["Return 200: User Details"]:::server

    %% Logout
    Route -->|Logout| LogoutPost["POST /api/auth/logout"]:::server
    LogoutPost --> ClearCookie["Clear token Cookie from browser"]:::server
    ClearCookie --> Blacklist["Store token in BlackListModel"]:::db
    Blacklist --> LogoutSuccess["Return 200: Logout Successful"]:::server

    class Start,RegFail,RegSuccess,LoginFailEmail,LoginFailPass,LoginSuccess,GetMeFail,GetMeSuccess,LogoutSuccess client;
```

---

### 📁 2. Resume Portfolio & Profile Manager Flow
Users can upload, persist, view, and delete multiple resumes in their profile page to build a career portfolio.

#### 🛠️ Files Involved:
* **Routes**: [resumeUpload.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/resumeUpload.routes.js)
* **Controller**: [resumeUpload.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/resumeUpload.controller.js)
* **Model**: [resume.model.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models/resume.model.js)
* **File Middleware**: [file.middleware.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/middlewares/file.middleware.js) (Multer configuration)

#### 📝 Step-by-Step Flow:
1. **Upload**:
   * React client posts a multipart `FormData` object containing the `.pdf` file to `POST /api/resumeUpload/`.
   * Multer intercepts the file buffer in memory.
   * `pdf-parse` extracts raw text from the parsed buffer immediately.
   * A document containing the filename, parsed text contents, and associated `userId` is saved in the `Resume` collection via [resumeModel.create()](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/resumeUpload.controller.js#L34).
2. **List Resumes**:
   * React client fetches saved resumes using `GET /api/resumeUpload/`.
   * Backend queries MongoDB matching `userId` and projects `-resume` to exclude the heavy parsed text field, ensuring fast payloads.
3. **Delete**:
   * Client calls `DELETE /api/resumeUpload/:id`.
   * Backend performs a secure delete check ([resumeModel.findOneAndDelete](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/resumeUpload.controller.js#L77)) validating both the `_id` and owner `user` fields match the request context.

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef server fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef db fill:#f59e0b,stroke:#b45309,color:#fff,font-weight:bold;

    Start["Profile / Resumes Manager Dashboard"] --> ActionRoute{Select Action}

    %% Upload
    ActionRoute -->|Upload PDF| UploadPost["POST /api/resumeUpload/"]:::server
    UploadPost --> Multer["file.middleware: Parse Form-Data & extract PDF buffer"]:::server
    Multer --> PDFParse["pdf-parse: Extract raw text from PDF buffer"]:::server
    PDFParse --> FetchUser["Find User account in DB"]:::db
    FetchUser --> CreateResume["Save Resume to DB: text, original filename, userId"]:::db
    CreateResume --> UploadSuccess["Return 201: Upload Successful with metadata"]:::server

    %% List Resumes
    ActionRoute -->|List Resumes| ListGet["GET /api/resumeUpload/"]:::server
    ListGet --> FindResumes["Query DB for Resumes matching userId"]:::db
    FindResumes --> SelectExclusion["Exclude heavy 'resume' text field from projection"]:::db
    SelectExclusion --> ListSuccess["Return 200: Sorted Resumes List metadata"]:::server

    %% Delete Resume
    ActionRoute -->|Delete Resume| DeleteReq["DELETE /api/resumeUpload/:id"]:::server
    DeleteReq --> FindDelete["Find & Delete Resume matching resumeId and userId"]:::db
    FindDelete -->|Not Found| DeleteFail["Return 404: Not found or Unauthorized"]:::server
    FindDelete -->|Found| DeleteSuccess["Return 200: Resume Deleted successfully"]:::server

    class Start,UploadSuccess,ListSuccess,DeleteFail,DeleteSuccess client;
```

---

### 🎯 3. AI Coaching Reports & Prep Roadmaps Flow
Analyzes candidate details, parsed resumes, and job roles to draft actionable career roadmaps and prep reports.

#### 🛠️ Files Involved:
* **Routes**: [interview.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/interview.routes.js)
* **Controller**: [interview.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/interview.controller.js)
* **AI Service**: [ai.services.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/ai.services.js) (LLM Prompt & validation)
* **Model**: [interviewReportModel.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models/interviewReportModel.js)

#### 📝 Step-by-Step Flow:
1. **Trigger Report Generation**:
   * Client posts data to `POST /api/interview/`.
   * **Source Select Option**: If `resumeId` is present, the backend queries the database for the resume's text. If a new file is uploaded, `pdf-parse` extracts the text on-the-fly.
2. **AI Analysis**:
   * The text, job description, and optional self-description are packaged and dispatched to [generateInterviewReport()](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/ai.services.js#L52).
   * Gemini (`gemini-3-flash-preview` with a fallback to `gemini-2.5-flash`) builds a structured career report matching `interviewReportSchema` rules.
3. **Structured Validation**:
   * Gemini returns a JSON object.
   * `Zod` validation parses and verifies the JSON structure.
   * The response is saved in the database under the user's account and returned to the client to render visual scores, timelines, and reference links.

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef server fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef db fill:#f59e0b,stroke:#b45309,color:#fff,font-weight:bold;
    classDef ai fill:#8e75c2,stroke:#6b21a8,color:#fff,font-weight:bold;

    Start["Client: Upload PDF Resume OR Select Saved Resume"] --> InputForm["Input: Target Job Description & Optional Self-Description"]
    InputForm --> AuthGuard["authMiddleware.authUser"]:::server
    AuthGuard --> POST_Req["POST /api/interview/"]:::server

    %% Resume Text retrieval
    POST_Req --> CheckResumeId{"Has resumeId in body?"}
    
    CheckResumeId -->|Yes| FetchStored["Find stored resume in DB by ID"]:::db
    FetchStored --> VerifyOwner{"Does resume user match logged-in userId?"}:::db
    VerifyOwner -->|No| Unauthorized["Return 404: Selected resume not found or unauthorized"]:::server
    VerifyOwner -->|Yes| ExtractSavedText["Retrieve saved resume text"]
    
    CheckResumeId -->|No| MulterParser["file.middleware: Parse multipart PDF upload"]:::server
    MulterParser --> PDFParse["pdf-parse: Extract raw text from PDF buffer"]:::server
    
    ExtractSavedText --> CombineInputs["Combine Resume Text, Job Description, & Self-Description"]
    PDFParse --> CombineInputs
    
    %% Gemini Core AI
    CombineInputs --> AICall["aiService.generateInterviewReport"]:::server
    AICall --> PromptBuilder["Construct Expert Technical Recruiter Prompt"]:::ai
    PromptBuilder --> GeminiCall["Call gemini-3-flash-preview with responseMimeType: application/json"]:::ai
    GeminiCall --> JSONParse["Parse AI response to JSON object"]:::ai
    JSONParse --> ZodValidation["Validate JSON against Zod interviewReportSchema"]:::ai
    ZodValidation -->|Valid JSON| SaveReport["Create new Coaching Report document in DB"]:::db
    SaveReport --> RespondReport["Return 201: Career Mentor Report Response"]:::server

    class Start,InputForm,Unauthorized,RespondReport client;
```

---

### 🧠 4. Adaptive Interview Prep Quizzes Flow
Enables interactive game-loop testing based on specific skill gaps or target job profiles.

#### 🛠️ Files Involved:
* **Routes**: [quiz.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/quiz.routes.js)
* **Controller**: [quiz.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/quiz.controller.js)
* **AI Service**: [ai.services.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/ai.services.js) (`generateQuizAgentically`)
* **Model**: [quiz.model.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models/quiz.model.js)

#### 📝 Step-by-Step Flow:
1. **Initialize Setup**:
   * React calls `GET /api/interview/history` and `GET /api/quiz/history` to pre-populate setup fields with previous job profile titles and identified skill gaps.
2. **Generate Questions**:
   * User posts options (mode, question count, difficulty, target skills or job description) to `POST /api/quiz/generate`.
   * Backend forwards the data to `generateQuizAgentically`.
   * Gemini compiles customized MCQs with exactly 4 options, a correct answer string, and detailed explanations, which are validated by `aiQuizSchema` (Zod) and returned.
3. **Gameplay & Submission**:
   * React displays the interactive quiz questions in a deck-based UI with active progress bars.
   * On final click, answers are graded on-the-fly, and the results are sent via `POST /api/quiz/submit` to save the performance details in MongoDB.

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef server fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef db fill:#f59e0b,stroke:#b45309,color:#fff,font-weight:bold;
    classDef ai fill:#8e75c2,stroke:#6b21a8,color:#fff,font-weight:bold;

    Start["Client: Open Quiz Setup"] --> FetchData["GET /api/interview/history & GET /api/quiz/history"]:::server
    FetchData --> PopulateSetup["Pre-populate available Job Profiles & Skill Gaps from historical reports"]
    
    %% Setup & Generate
    PopulateSetup --> QuizSetup["User selects: Mode ('jd' or 'skills') & Parameters (Num Questions, Difficulty)"]
    QuizSetup --> GenerateReq["POST /api/quiz/generate"]:::server
    GenerateReq --> ValidateInputs{"Validate inputs based on Mode"}:::server
    ValidateInputs -->|Invalid| GenErr["Return 400: Validation Error"]:::server
    ValidateInputs -->|Valid| AICall["aiService.generateQuizAgentically"]:::server
    AICall --> QuizPrompt["Build technical interviewer MCQ prompt"]:::ai
    QuizPrompt --> GeminiCall["Call gemini-3-flash-preview with responseMimeType: application/json"]:::ai
    GeminiCall --> ZodValidate["Validate MCQ list with Zod aiQuizSchema"]:::ai
    ZodValidate --> ReturnQuiz["Return 200: Generated MCQ Quiz Data"]:::server

    %% Gameplay Loop
    ReturnQuiz --> PlayQuiz["Interactive MCQ Game Loop: Choose option, track progress"]
    
    %% Submit
    PlayQuiz --> SubmitQuiz["POST /api/quiz/submit"]:::server
    SubmitQuiz --> GradeCheck["Backend validates and stores completed quiz performance"]:::db
    GradeCheck --> SavedResponse["Return 201: Persisted Quiz Results & explanations"]:::server
    SavedResponse --> ResultsUI["Show interactive Results Dashboard with score ring & AI explanations"]

    class Start,PopulateSetup,QuizSetup,GenErr,PlayQuiz,ResultsUI client;
```

---

### 💼 5. Agentic Job Discovery Flow
Orchestrates an intelligent scraping loop utilizing Google Gemini function declarations to look up job postings on LinkedIn and Unstop.

#### 🛠️ Files Involved:
* **Routes**: [job.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/job.routes.js)
* **Controller**: [job.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/job.controller.js)
* **AI Service**: [ai.services.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/ai.services.js) (`retrieveJobsAgentically`)
* **Scraper Service**: [job.service.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/job.service.js)

#### 📝 Step-by-Step Flow:
1. **Search Request**:
   * Client posts the search query to `POST /api/jobs/search` with `{ jobRole }`.
2. **Gemini Agentic Tool Trigger**:
   * `retrieveJobsAgentically` sends a prompt specifying the tool definition of `fetchJobPostings` to Gemini.
   * Gemini interprets the intent and responds requesting the execution of the `fetchJobPostings` function with parameters.
3. **Execution Loop**:
   * The backend captures this function call and executes `jobService.fetchJobPostings(jobRole)`.
   * **LinkedIn Guest Scraper**: Runs a request to public Guest Search and extracts listing tags using customized regex match patterns.
   * **Unstop Scraper**: Queries Unstop's search APIs in parallel.
   * The gathered listings are compiled into a raw array and sent back to Gemini.
4. **Relevance Filter & Format**:
   * Gemini analyzes the raw results, filters out any unrelated postings, and structures the response into a validated JSON layout conforming to `jobSearchResultSchema` (Zod), which is then sent to the client.

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef server fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef db fill:#f59e0b,stroke:#b45309,color:#fff,font-weight:bold;
    classDef ai fill:#8e75c2,stroke:#6b21a8,color:#fff,font-weight:bold;

    Start["Client: Input Job Role"] --> AuthCheck{"authMiddleware.authUser"}:::server
    AuthCheck --> SearchPost["POST /api/jobs/search"]:::server
    SearchPost --> AgentCall["aiService.retrieveJobsAgentically"]:::server
    
    %% Call 1
    AgentCall --> AgentPrompt["Build search instruction prompt with fetchJobPostings tool definition"]:::ai
    AgentPrompt --> CallGemini1["Call gemini-3-flash-preview with Tool Declarations"]:::ai
    
    %% Check Tool
    CallGemini1 --> ToolRequested{"Does Gemini call fetchJobPostings tool?"}
    
    %% Branch A: Tool Called
    ToolRequested -->|Yes| RunScraper["Execute jobService.fetchJobPostings with arg jobRole"]:::server
    RunScraper --> ScrapeAPI["Parallel Guest Search Scraper Loop: scrape LinkedIn html & Unstop API"]:::server
    ScrapeAPI --> ScrapedJobs["Return array of scraped job raw objects"]:::server
    ScrapedJobs --> SendToolResult["Send Tool Response back to Gemini"]:::ai
    SendToolResult --> CallGemini2["Call gemini-3-flash-preview with search history + tool result"]:::ai
    
    %% Branch B: Manual Fallback
    ToolRequested -->|No| ManualScrape["Directly execute jobService.fetchJobPostings"]:::server
    ManualScrape --> SendFallbackResult["Send scraped jobs data to Gemini for formatting/filtering"]:::ai
    SendFallbackResult --> CallGeminiFallback["Call Gemini to format JSON response"]:::ai
    
    %% Merge & Zod
    CallGemini2 --> FinalJSON["Parse Gemini response JSON text"]
    CallGeminiFallback --> FinalJSON
    FinalJSON --> ZodCheck["Validate with Zod jobSearchResultSchema: Filter unrelated roles"]:::ai
    ZodCheck --> SearchResponse["Return 200: Clean filtered jobs array"]:::server
    SearchResponse --> DisplayJobs["Display matching job cards in UI"]

    class Start,DisplayJobs client;
```


