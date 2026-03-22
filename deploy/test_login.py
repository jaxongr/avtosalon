import urllib.request, json
data = json.dumps({"username": "admin", "password": "admin123"}).encode()
req = urllib.request.Request("http://127.0.0.1:4010/api/auth/login", data=data, headers={"Content-Type": "application/json"}, method="POST")
try:
    resp = urllib.request.urlopen(req)
    print("OK:", resp.read().decode())
except Exception as e:
    print("ERR:", e)
    if hasattr(e, 'read'):
        print("Body:", e.read().decode())
