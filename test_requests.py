import requests


def test_requests():
    with requests.get("http://localhost:8080", json={'day': 7}) as r:
        res = r.json()
    for i in res.get("results"):
        assert i["num_processed_entries"] > 0
