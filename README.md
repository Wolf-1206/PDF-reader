# PDF Reader & AI Analysis Project

## Overview
This project provides a web-based platform for uploading PDF files, extracting their text, and performing AI-driven analysis. It includes authentication, admin dashboard, chatbot, and email utilities. The backend is built with Python, and the frontend uses React.

## Features
- PDF upload and text extraction
- AI-powered analysis of extracted text
- User authentication and password reset
- Admin dashboard for managing uploads and users
- Chatbot interface for user interaction
- Email notifications

## Folder Structure
```
upatedAfterAI/
├── package.json
├── pdf_reader/
│   ├── sonar-project.properties
│   ├── pdf_extracter/
│   │   ├── ai_analysis.py
│   │   ├── app.py
│   │   ├── auth.py
│   │   ├── email_utils.py
│   │   ├── package.json
│   │   ├── pdf_utils.py
│   │   ├── README.md
│   │   ├── requirements.txt
│   │   └── uploads/
│   └── pdf_reader/
│       ├── package.json
│       ├── README.md
│       ├── public/
│       └── src/
│           └── components/
└── uploads/
```

## Backend
- **Location:** `pdf_reader/pdf_extracter/`
- **Main files:**
  - `app.py`: Main application logic
  - `ai_analysis.py`: AI analysis functions
  - `auth.py`: Authentication utilities
  - `email_utils.py`: Email sending functions
  - `pdf_utils.py`: PDF extraction utilities
- **Requirements:** See `requirements.txt`

## Frontend
- **Location:** `pdf_reader/pdf_reader/`
- **Main files:**
  - `src/App.js`: Main React app
  - `src/components/`: UI components (Chatbot, AdminDashboard, etc.)
- **Static files:** `public/`

## Setup Instructions

### Backend
1. Navigate to `pdf_reader/pdf_extracter/`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend server:
   ```bash
   python app.py
   ```

### Frontend
1. Navigate to `pdf_reader/pdf_reader/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm start
   ```

## Usage
- Upload PDF files via the web interface
- View extracted text and AI analysis results
- Interact with the chatbot for further insights
- Admins can manage users and uploads

## License
Specify your license here (e.g., MIT, Apache 2.0)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Contact
Email - sikarwarnishant31@gmail.com
