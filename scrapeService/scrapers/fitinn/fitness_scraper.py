from .country_scraper import CountryScraper
from .studio_scraper import StudioScraper
from .equipment_scraper import EquipmentScraper
from .utils import save_to_json

class FitnessScraper:
    def __init__(self):
        self.country_scraper = CountryScraper()
        self.studio_scraper = StudioScraper()
        self.equipment_scraper = EquipmentScraper()
    
    def scrape_all(self):
        result = {}
        
        countries = self.country_scraper.get_countries()
        print(f"Gefunden: {len(countries)} Länder")
        
        for country in countries:
            result[country] = {}
            
            cities = self.country_scraper.get_cities_for_country(country)
            
            for city in cities:
                studios = self.studio_scraper.get_studios_for_city(country, city)
                
                studios_with_equipment = []
                for studio in studios:
                    
                    equipment = self.equipment_scraper.get_equipment_for_studio(studio['href'])
                    
                    studio_data = {
                        'name': studio['name'],
                        'href': studio['href'],
                        'equipment': equipment
                    }
                    studios_with_equipment.append(studio_data)
                
                result[country][city] = studios_with_equipment
        
        save_to_json(result, 'fitinn_output.json')
        print("\n✓ Gespeichert in fitinn_output.json")
        return result

if __name__ == '__main__':
    scraper = FitnessScraper()
    data = scraper.scrape_all()
