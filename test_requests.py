from main import main

def test_auto():
    res = main({})
    for i in res['results']:
        assert i["num_processed_entries"] > 0

def test_manual():
    res = main({"day": "2"})
    for i in res['results']:
        assert i["num_processed_entries"] > 0
