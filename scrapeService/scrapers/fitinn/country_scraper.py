from bs4 import BeautifulSoup
from .base_scraper import BaseScraper
from .constants import COUNTRY_PAGE

class CountryScraper(BaseScraper):
    
    def get_countries(self):
        r = self.get(COUNTRY_PAGE)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        links = soup.select('a.entry[href*="/training/"]')
        countries = [item.text.strip() for item in links]
        return countries
    
    def get_cities_for_country(self, country):
        url = f"{COUNTRY_PAGE}?land={country}"
        r = self.get(url)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        citieslinks = soup.select('a.entry.stadt[href="#"]')
        return [city.text.strip() for city in citieslinks]