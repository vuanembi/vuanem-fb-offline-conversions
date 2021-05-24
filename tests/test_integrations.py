import os
import subprocess

import requests

def start_server():
    return subprocess.Popen(
      [
        'functions-framework',
        '--target', 'main'
      ],
      cwd=os.path.dirname(__file__),
      stdout=subprocess.PIPE
    )

def test_auto():
    process = start_server()
    with requests.get('http://localhost:8080') as r:
        res = r.json()
    for i in res['results']:
        assert i["num_processed_entries"] > 0
    process.kill()
    process.wait()

def test_manual():
    process = start_server()
    with requests.get('http://localhost:8080', json={"day": 9}) as r:
        res = r.json()
    for i in res['results']:
        assert i["num_processed_entries"] > 0
    process.kill()
    process.wait()
