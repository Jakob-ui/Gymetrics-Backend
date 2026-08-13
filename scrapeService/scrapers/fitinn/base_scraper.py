import requests
from .constants import HEADERS

class BaseScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
    
    def get(self, url):
        return self.session.get(url)