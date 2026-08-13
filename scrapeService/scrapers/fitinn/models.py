from typing import List, Dict

class Studio:
    name: str
    href: str

class City:
    name: str
    studios: List[Studio]

class Country:
    name: str
    cities: Dict[str, List[Studio]]