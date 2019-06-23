import urllib
import requests
import socket

while True:

        ip =  ((([ip for ip in socket.gethostbyname_ex(socket.gethostname())[2] if not ip.startswith("127.")] or [[(s.connect(("8.8.8.8", 53)), s.getsockname()[0], s.close()) for s in [socket.socket(socket.AF_INET, socket.SOCK_DGRAM)]][0][1]]) + ["no IP found"])[0])

        html=urllib.urlopen('https://khun-raspberry.herokuapp.com/saveip?ip='+ip)

	print "ok"

	if len(ip) > 5:

		break
