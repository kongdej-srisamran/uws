import serial
import urllib

ser = serial.Serial('/dev/ttyACM0',115200)

print(ser.name)
while True:
	read_serial=ser.readline()
	print read_serial

#below this is how to separate ser.readline() to many variable
#	mes = read_serial.replace("\r\n","")
#	if len(mes) > 2 :
#		c,h,t  =  mes.split(",")
#		print c
#		print h
#		print t

#	html=urllib.urlopen('https://khun-raspberry.herokuapp.com/save?data='+read_serial)
#		htmltext=html.read()
#		print htmltext
