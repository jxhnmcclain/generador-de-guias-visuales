import requests

def test_export():
    url = "http://localhost:8001/export"
    payload = {"html_content": "<h1>Test</h1><p>This is a test.</p>"}
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print("SUCCESS: Backend export endpoint is working. Received 200 OK.")
            print("Response length:", len(response.content))
        else:
            print(f"FAILURE: Backend returned status code {response.status_code}")
            print("Response:", response.text)
    except Exception as e:
        print(f"FAILURE: Could not connect to backend. {e}")

if __name__ == "__main__":
    test_export()
