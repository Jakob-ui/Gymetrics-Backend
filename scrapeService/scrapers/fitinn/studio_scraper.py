from bs4 import BeautifulSoup
from .base_scraper import BaseScraper
from .constants import COUNTRY_PAGE

class StudioScraper(BaseScraper):
    
    def get_studios_for_city(self, country, city):
        url = f"{COUNTRY_PAGE}?land={country}"
        r = self.get(url)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        citieslinks = soup.select('a.entry.stadt[href="#"]')
        for citylink in citieslinks:
            if citylink.text.strip() == city:
                studio_container = citylink.find_next('div', class_='subauswahl')
                if studio_container:
                    studiolinks = studio_container.select('a.entry[href*="/training/studioauswahl"]')
                    studios = [
                        {
                            'name': link.text.strip(),
                            'href': link.get('href')
                        }
                        for link in studiolinks
                    ]
                    return studios
        return []