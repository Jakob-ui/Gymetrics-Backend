from flask import Flask, request, jsonify
from functools import wraps
from scrapers.fitinn.fitness_scraper import FitnessScraper
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

SCRAPER_API_KEY = os.getenv('SCRAPER_API_KEY')

if not SCRAPER_API_KEY:
    raise ValueError("SCRAPER_API_KEY nicht in .env gesetzt!")

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('apiKey')
        
        if not api_key or api_key != SCRAPER_API_KEY:
            return jsonify({'error': 'Invalid API Key'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

@app.route('/scrape', methods=['POST'])
@require_api_key
def scrape():
    try:
        scraper = FitnessScraper()
        data = scraper.scrape_all()
        
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok','Key': SCRAPER_API_KEY}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)