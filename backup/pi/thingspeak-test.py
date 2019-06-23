from time import localtime,strftime
import psutil
import time

import serial

import thingspeak

ser = serial.Serial('/dev/ttyACM0',115200)
print ser.name

channel_id = "552051"
write_key  = "N5ETM1EV7ONHPXM1"

def doit(channel,tem):

    if len(tem) >  3 :
        tem = tem.replace("\r\n", "")
        c,h,t = tem.split(",")

        cpu_pc = psutil.cpu_percent()
        mem_avail = psutil.virtual_memory().percent
        try:
	    response = channel.update({ 1:cpu_pc, 2:mem_avail, 3:c, 4:h, 5:t })
 #   	print (cpu_pc)
  #  	print (mem_avail)
   # 	   print (c)
            print (h)
   #        print (t)
   #     print strftime("%a, %d %b %Y %H:%M:%S", localtime())
    	    print (response)
        except:
           print ("connection failed")


#sleep for 16 seconds (api limit of 15 secs)
if __name__ == "__main__":
    channel = thingspeak.Channel(id=channel_id,write_key=write_key)
    while True:
   	tem = ser.readline()
        doit(channel,tem)
        time.sleep(5)
