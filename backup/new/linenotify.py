import microgear.client as microgear
import time
import requests
import socket

appid = "EGATWeatherStation"
gearkey = "kXYcGquYNJf26je"
gearsecret =  "PVREFWnv8fWEE497iBcCMpsLj"


microgear.create(gearkey,gearsecret,appid,{'debugmode': True})

t = 0
h = 0
c = 0

def connection():
    print("Now I am connected with netpie")

def subscription(topic,message):
    global t,h,c
    print(topic+" "+message)

    if topic == "/EGATWeatherStation/station1/temperature1":
	t = message
#	print(t)
    if topic == "/EGATWeatherStation/station1/humid":
	h = message
#	print(h)
    if topic == "/EGATWeatherStation/station1/temperature2":
	c = message
#	print(c)
    if t != 0 and h !=0 and c != 0:

	LINE_ACCESS_TOKEN="EQLOgdnKBxTHyeWMqcm5ISg9vFPWE5BCKEDubnJC2PD"
	url = "https://notify-api.line.me/api/notify"

	mes = "Temperature1 = " + t + "\n"
	mes += "Humid = " + h + "\n"
	mes += "Temperature2 = " + c + "\n"

	data = ({'message':mes})
#	data = ("t,h,c"}

	LINE_HEADERS = {"Authorization":"Bearer "+LINE_ACCESS_TOKEN}
	session = requests.Session()
	session.post(url, headers=LINE_HEADERS, data=data)
	print(t,h,c)
	exit()

def disconnect():
    print("disconnect is work")

microgear.setalias("LineNotify")
microgear.on_connect = connection
microgear.on_message = subscription
microgear.on_disconnect = disconnect
microgear.subscribe("/station1/#")
microgear.connect(True)

