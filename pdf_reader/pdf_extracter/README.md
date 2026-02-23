# pdf_extracter (Python Backend)

This folder will contain the backend code for PDF extraction and API endpoints.

## Setup Instructions
1. Create a virtual environment (optional but recommended):
   python -m venv venv
2. Activate the virtual environment:
   - Windows: venv\Scripts\activate
   - macOS/Linux: source venv/bin/activate
3. Install required packages:
   pip install flask flask-cors PyPDF2
4. Run the backend server:
   python app.py

The backend will expose an /upload endpoint to receive PDF files and return extracted text as JSON.
