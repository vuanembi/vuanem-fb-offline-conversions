def assertion(res):
    for i in res['results']:
        assert i["num_processed_entries"] > 0
