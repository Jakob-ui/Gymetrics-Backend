from bs4 import BeautifulSoup
from .base_scraper import BaseScraper
from .constants import BASE_URL

class EquipmentScraper(BaseScraper):
    
    def get_equipment_for_studio(self, studio_href):
        url = f"{BASE_URL}{studio_href}" 
        r = self.get(url)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        equipment_dict = {}
        muscle_group_links = soup.select('div.auswahl a.entry[href]')
        for link in muscle_group_links:
            muscle_group_name = link.text.strip()
            muscle_group_href = link.get('href')
            print(muscle_group_name, muscle_group_href)
            devices = self.get_devices_for_muscle_group(muscle_group_href)
            
            if devices:
                equipment_dict[muscle_group_name] = devices
        
        return equipment_dict
    
    def get_devices_for_muscle_group(self, muscle_group_href):
        if muscle_group_href.startswith('http'):
            url = muscle_group_href
        else:
            url = f"{BASE_URL}/training/{muscle_group_href}"
        print(url)
        try:
            r = self.get(url)
            soup = BeautifulSoup(r.text, 'html.parser')
            
            device_entries = soup.select('div.liste.geraete a.entry')
            
            devices = []
            for entry in device_entries:
                device_name = self.extract_device_name(entry)
                if device_name:
                    devices.append(device_name)
            
            return devices
        except Exception as e:
            print(f"Fehler bei {url}: {e}")
            return []
    
    def extract_device_name(self, entry):
        try:
            text_div = entry.find('div', class_='text')
            if text_div:
                br_tag = text_div.find('br')
                if br_tag:
                    text_after_br = br_tag.next_sibling
                    if text_after_br:
                        return str(text_after_br).strip()
            return None
        except:
            return None
        