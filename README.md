# Course Recommendation API

A NestJS-based API that provides intelligent course recommendations based on job titles and skills using AI-powered analysis and web scraping.

## 🏗️ Architecture

The project consists of several modular services:

- **AI Module**: LangChain integration for job skills analysis and query generation
- **Source Generator**: Web scraping service for course discovery
- **Scheduler**: Background job processing for large-scale operations
- **Recommendation**: Main service orchestrating the recommendation process

## 🛠️ Tech Stack

- **Framework**: NestJS
- **AI/ML**: LangChain, Google Generative AI (Gemini)
- **Database**: MongoDB (user auth), Chroma (vector store)
- **Queue System**: Bull with Redis
- **Web Scraping**: DuckDuckGo API
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- Google API Key (for Gemini AI)
- MongoDB (optional, for user authentication)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd course-recommender-api
npm install
```

### 2. Environment Setup

Create a `.env` file, copy and update content of .env.example file into it:


### 3. Run with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📚 API Endpoints

### Basic Flow

The typical workflow for getting course recommendations:

1. **Seed Vector Store** → `POST /recommendation/seed-vector-store`
2. **Generate Recommendations** → `POST /recommendation/vector-store-only`

### Course Recommendations

#### Core Endpoints
- `POST /recommendation/seed-vector-store` - **First step**: Populate vector store with job analysis and scraped courses
  - Use this to initialize the system with job data
  - Analyzes job titles, extracts skills, generates queries, scrapes courses
  - Stores everything in the vector database for later retrieval

- `POST /recommendation/seed-vector-store-trending` - ** Runs a background job that opulate vector store with job analysis and scraped courses
  - Use this to initialize the system with job data for random trending job titles
  - Analyzes job titles, extracts skills, generates queries, scrapes courses
  - Stores everything in the vector database for later retrieval

- `POST /recommendation/vector-store-only` - **Second step**: Generate course recommendations from existing vector store
  - Use this after seeding to get recommendations
  - Searches the vector store for relevant courses
  - Returns structured course bundles for different learning preferences
  - **Note**: If no data exists, it automatically schedules a background job and asks you to try again in a minute

#### Additional Endpoints
- `POST /recommendation/half-process` - Half of the  process in one request (job analysis + scraping)
  - Use when you want everything done in a single API call
  - Good for testing scraping results that is suppose to be stored in the vector store.

- `GET /recommendation/vector-store/similar` - Search for similar courses using a query string
  - Use for checking the vectore store for data similar to a paticular job title
  - Query parameters: `query` (required), `n` (optional, default: 5)

- `GET /recommendation/vector-store/all` - Get all documents in the vector store (debug endpoint)

- `POST /recommendation/test` - Test endpoint for job analysis only (debug)

### Job Analysis

- `GET /ai/analyze-job/:jobTitle` - Analyze a single job title and extract skills
  - Use for individual job analysis without scraping
  - Returns job skills analysis and generated queries

### Monitoring

- `GET /test` - Health check endpoint
- `GET /langchain-test` - Test LangChain AI integration
- `http://localhost:3000/admin/queues/queue/background-jobs` - **Bull Dashboard** for monitoring background jobs
  - Monitor job status, progress, and failures
  - View job history and retry failed jobs
  - Access this URL in your browser when the app is running

## 🧪 Test Endpoints

### Health Check
```bash
GET /test
# Returns: "API is working"
```

### LangChain Test
```bash
GET /langchain-test
# Returns: "LangChain received: Is LangChain working?"
```
### Project Structure

```
src/
├── ai/                    # AI services (LangChain, job analysis)
├── common/               # Shared utilities (logger, DTOs)
├── recommendation/       # Main recommendation service
├── scheduler/           # Background job processing
├── source-generator/    # Web scraping services
└── auth/               # User authentication
```

### Key Services

- **JobSkillsAnalyzerService**: Extracts skills from job titles using AI
- **CourseScraperService**: Scrapes course content from web sources
- **RecommendationService**: Orchestrates the recommendation process
- **SchedulerService**: Manages background job processing

### Services

- **API**: NestJS application (port 3000)
- **MongoDB**: User authentication database (port 27017)
- **Chroma**: Vector store for course embeddings (port 8000)
- **Redis**: Queue system for background jobs (port 6379)


## 📊 Monitoring

- **Health Check**: `GET /test`
- **Queue Status**: Monitor Bull dashboard
- **Vector Store**: Check Chroma collection status
- **Logs**: Use custom colored logger service
