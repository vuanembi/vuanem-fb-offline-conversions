import requests
from main import main

def test_requests():
    res = main({'day': 7})
    for i in res['results']:
        assert i["num_processed_entries"] > 0
