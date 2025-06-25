# Course Recommender API - Three Main Endpoints

## Overview

The API now has three distinct endpoints for different use cases:

1. **Seed Vector Store** - Populates the vector database with course data for multiple job titles
2. **Full Process** - Complete scraping process for a single job title (doesn't store in vector store)
3. **Vector Store Only** - Fast recommendations from existing vector store data (returns error if no data)

## DTO Validation

All endpoints use proper DTO validation with the following rules:

- **jobTitle**: Required string
- **jobTitles**: Required array of strings (minimum 1 item)
- **limit**: Optional number (1-50, defaults to 5)

Invalid requests will return 400 Bad Request with detailed validation error messages.

## Endpoints

### 1. Seed Vector Store

**Endpoint:** `POST /ai/seed-vector-store`

**Purpose:** Scrapes courses for multiple job titles and stores them in the persistent vector database.

**Request Body:**
```json
{
  "jobTitles": [
    "Data Scientist",
    "Frontend Developer", 
    "DevOps Engineer",
    "Machine Learning Engineer"
  ]
}
```

**Validation Rules:**
- `jobTitles` must be an array with at least 1 item
- Each item must be a string

**Response:**
```json
[
  {
    "jobTitle": "Data Scientist",
    "skills": ["Python", "SQL", "Machine Learning", "Data Analysis"],
    "courses": ["Course summaries..."],
    "totalCourses": 15
  },
  {
    "jobTitle": "Frontend Developer",
    "skills": ["JavaScript", "React", "HTML", "CSS"],
    "courses": ["Course summaries..."],
    "totalCourses": 12
  }
]
```

### 2. Full Process

**Endpoint:** `POST /ai/full-process`

**Purpose:** Complete process for a single job title - analyzes job, scrapes courses, and returns results (does NOT store in vector store).

**Request Body:**
```json
{
  "jobTitle": "Data Scientist",
  "limit": 5
}
```

**Validation Rules:**
- `jobTitle` is required and must be a string
- `limit` is optional, must be a number between 1-50

**Response:**
```json
{
  "jobTitle": "Data Scientist",
  "skills": ["Python", "SQL", "Machine Learning", "Data Analysis"],
  "recommendations": [
    {
      "title": "Complete Python Course for Data Science",
      "url": "https://example.com/course",
      "snippet": "Learn Python for data analysis...",
      "dataType": "Course",
      "skill": "Python",
      "query": "site:udemy.com python data science"
    }
  ],
  "totalRecommendations": 5,
  "source": "full_process"
}
```

### 3. Vector Store Only

**Endpoint:** `POST /ai/vector-store-only`

**Purpose:** Fast recommendations from existing vector store data. Returns 404 error if no relevant data exists.

**Request Body:**
```json
{
  "jobTitle": "Data Scientist",
  "limit": 5
}
```

**Validation Rules:**
- `jobTitle` is required and must be a string
- `limit` is optional, must be a number between 1-50

**Response (with data):**
```json
{
  "jobTitle": "Data Scientist",
  "skills": ["Python", "SQL", "Machine Learning", "Data Analysis"],
  "recommendations": [
    {
      "title": "Complete Python Course for Data Science",
      "url": "https://example.com/course",
      "snippet": "Learn Python for data analysis...",
      "dataType": "Course",
      "skill": "Python",
      "query": "site:udemy.com python data science"
    }
  ],
  "totalRecommendations": 5,
  "source": "vector_store"
}
```

**Response (no data - 404 Error):**
```json
{
  "statusCode": 404,
  "message": "No relevant course data found in vector store for job title: Unknown Job Title. Please use the seed endpoint first or try the full-process endpoint.",
  "error": "Not Found"
}
```

### 4. Analyze Job (Utility)

**Endpoint:** `GET /ai/analyze-job/:jobTitle`

**Purpose:** Analyzes a job title to extract skills and generate search queries.

**Example:** `GET /ai/analyze-job/Data%20Scientist`

## Usage Workflow

### Step 1: Seed the Vector Store (One-time setup)
First, populate the vector store with course data for job titles you want to support:

```bash
curl -X POST http://localhost:3000/ai/seed-vector-store \
  -H "Content-Type: application/json" \
  -d '{
    "jobTitles": ["Data Scientist", "Frontend Developer", "DevOps Engineer"]
  }'
```

### Step 2A: Fast Recommendations (Vector Store Only)
Once the vector store is populated, get fast recommendations:

```bash
curl -X POST http://localhost:3000/ai/vector-store-only \
  -H "Content-Type: application/json" \
  -d '{
    "jobTitle": "Data Scientist",
    "limit": 5
  }'
```

### Step 2B: Full Process (When you need fresh data)
For job titles not in the vector store or when you need fresh scraping:

```bash
curl -X POST http://localhost:3000/ai/full-process \
  -H "Content-Type: application/json" \
  -d '{
    "jobTitle": "New Job Title",
    "limit": 5
  }'
```

## API Comparison

| Endpoint | Purpose | Speed | Stores in Vector DB | Error Handling |
|----------|---------|-------|-------------------|----------------|
| `seed-vector-store` | Populate database | Slow | ✅ Yes | Graceful |
| `full-process` | Fresh scraping | Slow | ❌ No | Graceful |
| `vector-store-only` | Fast lookup | Fast | ❌ No | 404 Error |

## Validation Examples

### Valid Requests
```json
// Seed Vector Store
{
  "jobTitles": ["Data Scientist", "Frontend Developer"]
}

// Full Process / Vector Store Only
{
  "jobTitle": "Data Scientist",
  "limit": 10
}
```

### Invalid Requests (will return 400 Bad Request)
```json
// Empty job titles array
{
  "jobTitles": []
}

// Missing job title
{
  "limit": 5
}

// Invalid limit
{
  "jobTitle": "Data Scientist",
  "limit": 100
}

// Invalid job title type
{
  "jobTitle": 123
}
```

## Benefits

1. **Performance**: Vector store only endpoint is much faster than scraping
2. **Persistence**: Course data persists across container restarts
3. **Flexibility**: Choose between fast lookup or fresh scraping
4. **Error Handling**: Clear indication when no data exists
5. **Scalability**: Can handle many recommendation requests without re-scraping
6. **Validation**: Proper input validation with detailed error messages

## Docker Setup

Make sure your docker-compose includes the ChromaDB service:

```bash
docker compose up --build
```

This will start:
- API service (port 3000)
- MongoDB (port 27017) 
- ChromaDB (port 8000)

## Environment Variables

Ensure these are set in your `.env` file:
```
GOOGLE_API_KEY=your_google_api_key
CHROMA_HOST=chroma
CHROMA_PORT=8000
``` 