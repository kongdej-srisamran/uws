import serial
from firebase import firebase
import urllib2, urllib, httplib
import time
import datetime


ser = serial.Serial('/dev/ttyACM0',9600)
firebase = firebase.FirebaseApplication('https://uws-egat.firebaseio.com/', None)

while True:
    data_serial=ser.readline()
#    data_serial = '1,2,3,4,5,6,7,8,9,10,11,12,13'
    if len(data_serial) >  10:
        data = data_serial.replace("\r\n", "").split(",")
        st = datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
        dataobj = {
            "timestamp": st,
            "temperature": data[0],
            "humidity": data[1],
            "temperature2": data[2],
            "wind_direction": data[3],
            "wind_speed": data[4],
            "rain": data[5],
            "pm10": data[6],
            "pm25": data[7],
            "light": data[8],
            "volt": data[9]
#            "uv": data[10],
#            "db": data[11]
        }
        
        firebase.post('/data', dataobj)
        print st,dataobj