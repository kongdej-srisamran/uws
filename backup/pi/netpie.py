import microgear.client as microgear
import time
import serial

ser = serial.Serial('/dev/ttyACM0',115200)

appid = "EGATWeatherStation"
gearkey = "EShPsFvjYFlUYZT"
gearsecret =  "hDACENKjY5wMsf6qnzQkMPd5c"

microgear.create(gearkey,gearsecret,appid,{'debugmode': True})

def connection():
    print("Now I am connected with netpie")

def subscription(topic,message):
    print(topic+" "+message)

def disconnect():
    print("disconnect is work")

microgear.setalias("station1")
microgear.on_connect = connection
microgear.on_message = subscription
microgear.on_disconnect = disconnect
microgear.subscribe("/station1/#")
microgear.connect(False)

while True:

	if(microgear.connected):

		tem = ser.readline()

		if len(tem) > 3 :
			tem = tem.replace("\r\n","")
			c,h,t =  tem.split(",")

			microgear.publish("/station1/temperature1",c)
			microgear.publish("/station1/humid",h)
			microgear.publish("/station1/temperature2",t)
			data = {"Temperature1":c,"Humid":h,"Temperature2":t}
			microgear.writeFeed("EGATWeather",data,"7FnyupCE8kBPHOOAVU61wh7v85crfPzk")
	time.sleep(3)
