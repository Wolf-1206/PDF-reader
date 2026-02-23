from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash

users_db = {}  # username: {password_hash, active, login_count, extraction_count}
# Ensure admin user always exists
from werkzeug.security import generate_password_hash
if 'admin@gmail.com' not in users_db:
    users_db['admin@gmail.com'] = {
        'password_hash': generate_password_hash('Admin@123'),  # Default password, change as needed
        'active': True,
        'login_count': 0,
        'extraction_count': 0
    }
auth_bp = Blueprint('auth', __name__)

from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash

users_db = {}  # username: {password_hash, active, login_count, extraction_count}
# Ensure admin user always exists
from werkzeug.security import generate_password_hash
if 'admin@gmail.com' not in users_db:
    users_db['admin@gmail.com'] = {
        'password_hash': generate_password_hash('Admin@123'),  # Default password, change as needed
        'active': True,
        'login_count': 0,
        'extraction_count': 0
    }
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    if username in users_db:
        return jsonify({'error': 'User already exists'}), 409
    users_db[username] = {
        'password_hash': generate_password_hash(password),
        'active': True,
        'login_count': 0,
        'extraction_count': 0
    }
    return jsonify({'message': 'User registered successfully'})

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    user_obj = users_db.get(username)
    if not user_obj or not check_password_hash(user_obj['password_hash'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    if not user_obj.get('active', True):
        return jsonify({'error': 'User access revoked'}), 403
    session['user'] = username
    user_obj['login_count'] = user_obj.get('login_count', 0) + 1
    return jsonify({'message': 'Login successful', 'user': username})

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({'message': 'Logged out'})

@auth_bp.route('/me', methods=['GET'])
def me():
    user = session.get('user')
    if not user:
        return jsonify({'user': None}), 401
    return jsonify({'user': user})


