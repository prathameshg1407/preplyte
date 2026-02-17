# ATS Score Checker - Usage Guide

## Overview
The ATS (Applicant Tracking System) Score Checker analyzes resumes and provides a comprehensive compatibility score along with actionable feedback.

## Features
- ✅ PDF and Word document support (.pdf, .doc, .docx)
- ✅ AI-powered analysis using Google Gemini
- ✅ Keyword optimization analysis
- ✅ Formatting compatibility check
- ✅ Section-by-section evaluation
- ✅ Optional job description matching
- ✅ Actionable improvement suggestions

## API Endpoint

### Check ATS Score
**POST** `/api/resume-builder/ats-check`

**Authentication:** Required (JWT token)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `resume` (file, required): PDF or Word document (max 5MB)
- `jobDescription` (string, optional): Job description to match against

**Example Request (cURL):**
```bash
curl -X POST http://localhost:4000/api/resume-builder/ats-check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "resume=@/path/to/resume.pdf" \
  -F "jobDescription=We are looking for a Full Stack Developer with experience in React, Node.js, and PostgreSQL..."
```

**Example Request (JavaScript/Fetch):**
```javascript
const formData = new FormData();
formData.append('resume', fileInput.files[0]);
formData.append('jobDescription', 'Optional job description here...');

const response = await fetch('http://localhost:4000/api/resume-builder/ats-check', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "strengths": [
      "Clear section headers and organization",
      "Strong use of action verbs",
      "Quantifiable achievements included",
      "Relevant keywords present",
      "Professional formatting"
    ],
    "weaknesses": [
      "Missing LinkedIn profile URL",
      "Some experience descriptions lack metrics",
      "Skills section could be more detailed"
    ],
    "suggestions": [
      "Add LinkedIn profile URL to contact information",
      "Include more quantifiable metrics in experience descriptions",
      "Expand skills section with proficiency levels",
      "Add relevant certifications if available",
      "Consider adding a professional summary",
      "Ensure consistent date formatting throughout",
      "Add more industry-specific keywords",
      "Include links to portfolio or GitHub projects"
    ],
    "keywordAnalysis": {
      "found": [
        "JavaScript",
        "React",
        "Node.js",
        "PostgreSQL",
        "API",
        "Agile",
        "Git"
      ],
      "missing": [
        "TypeScript",
        "Docker",
        "CI/CD",
        "Testing",
        "Cloud platforms"
      ]
    },
    "formatting": {
      "score": 90,
      "issues": [
        "Consider using standard section headers",
        "Avoid using tables for layout"
      ]
    },
    "sections": [
      {
        "name": "Contact Information",
        "present": true,
        "quality": "good"
      },
      {
        "name": "Professional Summary",
        "present": false,
        "quality": "missing"
      },
      {
        "name": "Work Experience",
        "present": true,
        "quality": "excellent"
      },
      {
        "name": "Education",
        "present": true,
        "quality": "good"
      },
      {
        "name": "Skills",
        "present": true,
        "quality": "fair"
      },
      {
        "name": "Projects",
        "present": true,
        "quality": "good"
      }
    ],
    "analyzedAt": "2024-02-13T10:30:00.000Z"
  },
  "message": "Resume analyzed successfully"
}
```

## Error Responses

### 400 Bad Request - No File
```json
{
  "success": false,
  "error": {
    "code": "NO_FILE",
    "message": "Please upload a resume file"
  }
}
```

### 400 Bad Request - Invalid File Type
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Only PDF and Word documents (.pdf, .doc, .docx) are supported"
  }
}
```

### 400 Bad Request - File Too Large
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size must be less than 5MB"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "ANALYSIS_ERROR",
    "message": "Failed to analyze resume"
  }
}
```

## Configuration

### Environment Variables
Add the following to your `.env` file:

```env
# Gemini AI for ATS Score Checker
GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting a Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

## File Requirements

### Supported Formats
- PDF (.pdf)
- Microsoft Word (.doc, .docx)

### File Size Limit
- Maximum: 5MB

### Best Practices for Resume Files
- Use standard fonts (Arial, Calibri, Times New Roman)
- Avoid complex layouts with tables or columns
- Use clear section headers
- Save as PDF for best compatibility
- Ensure text is selectable (not scanned images)

## Score Interpretation

### Overall ATS Score (0-100)
- **90-100**: Excellent - Highly ATS-compatible
- **75-89**: Good - Minor improvements needed
- **60-74**: Fair - Several improvements recommended
- **40-59**: Poor - Significant changes required
- **0-39**: Very Poor - Major restructuring needed

### Formatting Score (0-100)
Evaluates how well the resume can be parsed by ATS systems:
- Simple, clean layout
- Standard section headers
- No graphics or complex formatting
- Proper use of whitespace

## Integration Example (React)

```jsx
import { useState } from 'react';

function ATSChecker() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('resume', file);
    if (jobDescription) {
      formData.append('jobDescription', jobDescription);
    }

    try {
      const response = await fetch('/api/resume-builder/ats-check', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert(data.error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>ATS Score Checker</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <textarea
          placeholder="Job Description (optional)"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Check ATS Score'}
        </button>
      </form>

      {result && (
        <div>
          <h3>ATS Score: {result.score}/100</h3>
          <div>
            <h4>Strengths:</h4>
            <ul>
              {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <h4>Suggestions:</h4>
            <ul>
              {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default ATSChecker;
```

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Applies to all resume builder endpoints

## Notes
- The ATS checker uses AI analysis, so results may vary slightly between runs
- For best results, provide a job description to get targeted keyword analysis
- The service analyzes content only - it cannot evaluate visual design
- Processing time typically ranges from 5-15 seconds depending on file size
