









import os
import re
import logging
from flask import Flask, request, jsonify, session
from uuid import uuid4
from auth import auth_bp
from datetime import timedelta
import pytesseract
from pdf_utils import process_native_pdf, process_ocr, ai_summarize_text, extract_text_from_pdf, detect_languages, optimized_ocr, ai_chat_response
from flask_cors import CORS




app = Flask(__name__)
# Initialize CORS before registering blueprints
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
app.register_blueprint(auth_bp)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")
app.permanent_session_lifetime = timedelta(hours=2)

# --- Admin analytics endpoint ---
from functools import wraps

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = session.get('user')
        if user != 'admin@gmail.com':
            return jsonify({'error': 'Forbidden'}), 403
        return f(*args, **kwargs)
    return decorated

@app.route('/admin/analytics', methods=['GET'])
@admin_required
def admin_analytics():
    # Example analytics: user count, total uploads, total extractions
    user_count = len(user_pdf_history)
    total_uploads = sum(len(h) for h in user_pdf_history.values())
    # Import users_db from auth
    from auth import users_db
    users = []
    for u, h in user_pdf_history.items():
        user_info = {'username': u, 'uploads': len(h)}
        if u in users_db:
            user_info['active'] = users_db[u].get('active', True)
        users.append(user_info)
    # Add users from users_db not in user_pdf_history
    for u in users_db:
        if u not in user_pdf_history:
            user_info = {'username': u, 'uploads': 0, 'active': users_db[u].get('active', True)}
            users.append(user_info)
    return jsonify({
        'user_count': len(users_db),
        'total_uploads': total_uploads,
        'users': users
    })

# --- Admin: Grant user access ---

@app.route('/admin/grant', methods=['POST'])
@admin_required
def admin_grant():
    from auth import users_db
    data = request.get_json()
    username = data.get('username')
    if not username or username not in users_db:
        return jsonify({'error': 'User not found'}), 404
    users_db[username]['active'] = True
    return jsonify({'message': f'Access granted to {username}'})

# --- Admin: Revoke user access ---
@app.route('/admin/revoke', methods=['POST'])
@admin_required
def admin_revoke():
    from auth import users_db
    data = request.get_json()
    username = data.get('username')
    if not username or username not in users_db:
        return jsonify({'error': 'User not found'}), 404
    if username == 'admin@gmail.com':
        return jsonify({'error': 'Cannot revoke admin access'}), 403
    users_db[username]['active'] = False
    return jsonify({'message': f'Access revoked for {username}'})

# --- Global handler for OPTIONS preflight requests ---
@app.before_request
def handle_options_preflight():
    if request.method == 'OPTIONS':
        # Let Flask-CORS handle the headers, just return 200
        return ('', 200)

# --- Check if PDF is password protected ---
from PyPDF2 import PdfReader
@app.route('/check_protected', methods=['POST'])
def check_protected():
    data = request.get_json()
    filename = data.get('filename')
    if not filename:
        return jsonify({'error': 'Filename is required'}), 400
    upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
    file_path = os.path.join(upload_folder, filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    try:
        reader = PdfReader(file_path)
        is_protected = reader.is_encrypted
        return jsonify({'protected': is_protected}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- In-memory user PDF history store (for demo) ---
user_pdf_history = {}  # {username: [ {name, pages, addedAt} ]}

# --- Helper: Handle PDF extraction errors ---
def handle_pdf_extraction_error(error):
    if 'password' in error.lower():
        return jsonify({'error': error}), 401
    else:
        return jsonify({'error': error}), 403


# --- Upload endpoint ---
@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    allowed_exts = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx']
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        return jsonify({'error': 'Only PDF, JPG, PNG, Word, and Excel files are allowed'}), 400

    upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, file.filename)
    file.save(file_path)

    # Add to user-specific history
    username = session.get('user')
    if username:
        history = user_pdf_history.setdefault(username, [])
        # Avoid duplicate entries for same file name
        if not any(h['name'] == file.filename for h in history):
            from datetime import datetime
            history.append({
                'name': file.filename,
                'pages': '-',
                'addedAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
    return jsonify({'message': 'File uploaded successfully', 'filename': file.filename}), 200


# --- User PDF history endpoints ---
@app.route('/history', methods=['GET'])
def get_history():
    username = session.get('user')
    if not username:
        return jsonify({'error': 'Not authenticated'}), 401
    return jsonify({'history': user_pdf_history.get(username, [])})

@app.route('/history/clear', methods=['POST'])
def clear_history():
    username = session.get('user')
    if not username:
        return jsonify({'error': 'Not authenticated'}), 401
    user_pdf_history[username] = []
    return jsonify({'message': 'History cleared'})

# --- Extract endpoint ---
from flask import make_response
@app.route('/extract', methods=['POST', 'OPTIONS'])
def extract_pdf():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json()
        filename = data.get('filename')
        if not filename:
            return jsonify({'error': 'Filename is required'}), 400
        upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
        file_path = os.path.join(upload_folder, filename)
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        ext = os.path.splitext(filename)[1].lower()
        text = ''
        summary = ''
        username = session.get('user')
        if ext == '.pdf':
            password = data.get('password')
            try:
                text, error = extract_text_from_pdf(file_path, password=password)
                if error:
                    if 'password' in error.lower() or 'encrypted' in error.lower():
                        return jsonify({'error': 'PDF is password protected', 'needs_password': True}), 401
                    return handle_pdf_extraction_error(error)
            except Exception as e:
                err_msg = str(e)
                if 'password' in err_msg.lower() or 'encrypted' in err_msg.lower():
                    return jsonify({'error': 'PDF is password protected', 'needs_password': True}), 401
                return handle_pdf_extraction_error(err_msg)
        elif ext in ['.jpg', '.jpeg', '.png']:
            try:
                import PIL.Image
                img = PIL.Image.open(file_path)
                text = pytesseract.image_to_string(img)
            except Exception as e:
                return handle_pdf_extraction_error(f'Image extraction failed: {str(e)}')
        elif ext in ['.doc', '.docx']:
            try:
                import docx
                doc = docx.Document(file_path)
                text = '\n'.join([para.text for para in doc.paragraphs])
            except Exception as e:
                return handle_pdf_extraction_error(f'Word extraction failed: {str(e)}')
        elif ext in ['.xls', '.xlsx']:
            try:
                import openpyxl
                wb = openpyxl.load_workbook(file_path, read_only=True)
                text = ''
                for sheet in wb:
                    for row in sheet.iter_rows(values_only=True):
                        text += '\t'.join([str(cell) if cell is not None else '' for cell in row]) + '\n'
            except Exception as e:
                return handle_pdf_extraction_error(f'Excel extraction failed: {str(e)}')
        else:
            return handle_pdf_extraction_error('Unsupported file type for extraction')

        # Store extracted text for chatbot context (if user is logged in)
        if username:
            if not hasattr(app, 'user_pdf_texts'):
                app.user_pdf_texts = {}
            app.user_pdf_texts[username] = text
            import logging
            if not text or len(text.strip()) == 0:
                logging.warning(f"[DEBUG] Extracted text for user {username} is EMPTY!")
            elif len(text.strip()) < 50:
                logging.warning(f"[DEBUG] Extracted text for user {username} is VERY SHORT: {text.strip()}")
            else:
                logging.warning(f"[DEBUG] Stored extracted text for user {username}: {text[:200]}...")
            # Also add to user history if not already present
            history = user_pdf_history.setdefault(username, [])
            if not any(h['name'] == filename for h in history):
                from datetime import datetime
                history.append({
                    'name': filename,
                    'pages': '-',
                    'addedAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })
        return jsonify({'text': text, 'summary': summary}), 200
    except Exception as e:
        return handle_pdf_extraction_error(str(e))



# --- Simple Chatbot endpoint ---
@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    user_message = data.get('message', '')
    from pdf_utils import ai_chat_response
    # Get extracted PDF text for the current user, if available
    username = session.get('user')
    pdf_context = None
    if username and hasattr(app, 'user_pdf_texts'):
        pdf_context = app.user_pdf_texts.get(username)
    # If context exists, prepend it to the user message
    import logging
    if pdf_context:
        if not pdf_context or len(pdf_context.strip()) == 0:
            logging.warning(f"[DEBUG] PDF context for user {username} is EMPTY!")
        elif len(pdf_context.strip()) < 50:
            logging.warning(f"[DEBUG] PDF context for user {username} is VERY SHORT: {pdf_context.strip()}")
        else:
            logging.warning(f"[DEBUG] Using PDF context for user {username}: {pdf_context[:200]}...")
        full_message = f"[PDF Context]\n{pdf_context[:2000]}\n[User Question]\n{user_message}"
    else:
        logging.warning(f"[DEBUG] No PDF context found for user {username}.")
        full_message = user_message
    reply = ai_chat_response(full_message)
    if not reply or '[No AI available]' in reply or '[AI error:' in reply:
        logging.warning(f"[DEBUG] AI API returned fallback or error: {reply}")
    else:
        logging.warning(f"[DEBUG] AI API returned: {reply[:200]}...")
    return jsonify({'reply': reply})

# --- Runner block must be at the very end ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)






