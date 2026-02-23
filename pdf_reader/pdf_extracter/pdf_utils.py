def ai_chat_response(user_message):
    if not API_KEY or not DEPLOYMENT_NAME or not API_VERSION or not URL:
        logging.warning('Azure OpenAI API credentials not set. Returning echo.')
        return f"[No AI available] You said: {user_message}"
    prompt = user_message[:4000] if user_message else ""
    headers = {
        "Content-Type": "application/json",
        "api-key": API_KEY
    }
    payload = {
        "model": DEPLOYMENT_NAME,
        "messages": [
            {"role": "system", "content": "You are ChatGPT, a helpful, friendly, and conversational AI assistant."},
            {"role": "user", "content": prompt}
        ],
        "maxTokens": 600,
        "temperature": 0.7
    }
    try:
        response = requests.post(URL, headers=headers, json=payload, verify=False)
        response.raise_for_status()
        result = response.json()
        reply = result["choices"][0]["message"]["content"].strip()
        return reply
    except Exception as e:
        logging.error(f'Azure OpenAI chat failed: {e}')
        return f"[AI error: {e}] You said: {user_message}"

import os
import re
import logging
import PyPDF2
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import requests
from flask import jsonify
from uuid import uuid4
from dotenv import load_dotenv
# Always load .env from the directory where this file is located
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(dotenv_path)
API_KEY = os.getenv("API_KEY")
DEPLOYMENT_NAME = os.getenv("DEPLOYMENT_NAME")
API_VERSION = os.getenv("API_VERSION")
URL = os.getenv("URL")

POPPLER_PATH = r"C:\Users\nishant_chaudhary\Downloads\Release-25.07.0-0\poppler-25.07.0\Library\bin"
pytesseract.pytesseract.tesseract_cmd = r"C:\Users\nishant_chaudhary\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"

def handle_pdf_extraction_error(error):
    if 'password' in error.lower():
        return jsonify({'error': error}), 401
    else:
        return jsonify({'error': error}), 403

def process_native_pdf(file_path, password):
    text, error = extract_text_from_pdf(file_path, password)
    if error:
        return None, error, None, None
    detected = detect_languages(text)
    language = 'multi-language'
    try:
        import langdetect
        langs = langdetect.detect_langs(text)
        if langs and len(langs) == 1 and langs[0].prob > 0.90:
            language = langs[0].lang
    except Exception:
        pass
    return text, None, detected, language

def process_ocr(file_path):
    text, language, detected_langs = optimized_ocr(file_path)
    detected = ', '.join([str(l) for l in detected_langs]) if detected_langs else 'Unknown'
    return text, detected, language

def ai_summarize_text(text):
    if not API_KEY or not DEPLOYMENT_NAME or not API_VERSION or not URL:
        logging.warning('Azure OpenAI API credentials not set. Returning original text.')
        return text
    truncated_text = text[:4000] if text else ""
    prompt = (
        "You are a professional summarizer. "
        "Your job is to extract and present all key-value pairs (form fields, table data, or any values related to a key) from the following PDF-extracted text. "
        "List ALL key-value pairs as bullet points in the format 'Key: Value'. "
        "After listing key-value pairs, output a bullet list of the main points, key facts, and important sections. "
        "You may use up to 30 lines for the summary if needed. "
        "Do NOT copy or repeat the original text. Do NOT include more than 1/5th of the original content. "
        "If the text is long, focus only on the most important information. "
        "Output only the summary as a bullet list, nothing else.\n"
        "Text:\n" + truncated_text
    )
    headers = {
        "Content-Type": "application/json",
        "api-key": API_KEY
    }
    payload = {
        "model": DEPLOYMENT_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "maxTokens": 600,
        "temperature": 0.3
    }
    try:
        response = requests.post(URL, headers=headers, json=payload, verify=False)
        response.raise_for_status()
        result = response.json()
        summary = result["choices"][0]["message"]["content"].strip()
        return summary
    except Exception as e:
        logging.error(f'Azure OpenAI summarization failed: {e}')
        return text

def extract_text_from_pdf(file_path, password=None):
    text = ''
    with open(file_path, 'rb') as f:
        pdf_reader = PyPDF2.PdfReader(f)
        if pdf_reader.is_encrypted:
            if password:
                try:
                    pdf_reader.decrypt(password)
                except Exception as e:
                    logging.error(f"PDF decryption failed: {e}")
                    return None, 'Incorrect password or unable to decrypt PDF.'
            else:
                return None, 'PDF is password-protected. Please provide a password.'
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text
    return text, None

def detect_languages(text):
    import langdetect
    try:
        detected_langs = langdetect.detect_langs(text)
        return ', '.join([f"{str(l.lang)} ({l.prob:.2f})" for l in detected_langs])
    except Exception:
        return 'Unknown'

def ocr_pdf_images(file_path, lang):
    images = convert_from_path(file_path, poppler_path=POPPLER_PATH)
    ocr_texts = []
    iso_to_tess = {
        'en': 'eng', 'fr': 'fra', 'hi': 'hin', 'es': 'spa', 'de': 'deu', 'it': 'ita', 'ja': 'jpn', 'zh': 'chi_sim', 'ar': 'ara',
    }
    if lang == 'multi':
        ocr_langs = 'eng+fra+hin+spa+deu+ita+jpn+chi_sim+ara'
    else:
        if isinstance(lang, list):
            tess_codes = [iso_to_tess.get(code, None) for code in lang]
            tess_codes = [c for c in tess_codes if c]
            ocr_langs = '+'.join(tess_codes) if tess_codes else 'eng'
        else:
            ocr_langs = iso_to_tess.get(lang, 'eng')
    for image in images:
        page_text = pytesseract.image_to_string(image, lang=ocr_langs)
        ocr_texts.append(page_text)
    return '\n'.join(ocr_texts)

def optimized_ocr(file_path):
    initial_text = ocr_pdf_images(file_path, 'multi')
    # For simplicity, skip AI language detection in this utility
    return initial_text, 'multi-language', ['multi']
