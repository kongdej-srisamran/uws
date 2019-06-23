
import requests
import sys
import serial

global mes

LINE_ACCESS_TOKEN = "7kG64xnWzPKg4YN5pV2hMwJdZi78BQWEpcJopOY2ABA"
ser = serial.Serial('/dev/ttyACM0',115200)
#mes = ser.readline()

while True:
	mes = ser.readline()

	if len(mes) > 5:
		print mes
		break

url = "https://notify-api.line.me/api/notify"
file = {'imageFile':open('/home/pi/image/45855.jpg','rb')}
data = ({
        'message': mes
    })
#print mes
LINE_HEADERS = {"Authorization":"Bearer "+LINE_ACCESS_TOKEN}
session = requests.Session()

#if data != 0:
r=session.post(url, headers=LINE_HEADERS, files=file, data=data)
print r.text

