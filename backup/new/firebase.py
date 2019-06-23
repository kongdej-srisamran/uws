from time import sleep
from firebase import firebase
import urllib2, urllib, httplib
import time
import datetime

import serial
ser = serial.Serial('/dev/ttyACM0',115200)
print(ser.name)

firebase = firebase.FirebaseApplication('https://raspberrypi-1ee5e.firebaseio.com/', None)
ts = time.time()
st = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')


def update_firebase():

	data = {"timestamp": st, "temp": c, "humidity": h, "temp2": t}
	firebase.post('/sensor/weather', data)


while True:
	read_serial = ser.readline()
	mes =  read_serial.replace("\r\n","")
	if len(mes) > 2 :
		c,h,t = mes.split(",")
		update_firebase()
	sleep(5)
