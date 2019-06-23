import requests
import socket
import time

time.sleep(15)

ip =  ((([ip for ip in socket.gethostbyname_ex(socket.gethostname())[2] if not ip.startswith("127.")] or [[(s.connect(("8.8.8.8", 53)), s.getsockname()[0], s.close()) for s in [socket.socket(socket.AF_INET, socket.SOCK_DGRAM)]][0][1]]) + ["no IP found"])[0])
print ip

print "Line Notify...."
LINE_ACCESS_TOKEN="EQLOgdnKBxTHyeWMqcm5ISg9vFPWE5BCKEDubnJC2PD"
url = "https://notify-api.line.me/api/notify"
data = ({'message':ip}) # insert text here
LINE_HEADERS = {"Authorization":"Bearer "+LINE_ACCESS_TOKEN}
session = requests.Session()
r=session.post(url, headers=LINE_HEADERS, data=data)
print(r.text)
