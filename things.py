import os
import time
import sys
import paho.mqtt.client as mqtt
import json
import serial
import datetime

#ser = serial.Serial('/dev/ttyACM0',9600)

THINGSBOARD_HOST = 'mqtt.egat.co.th'
ACCESS_TOKEN = 'RNA80PBG47rmKVAhMlcJ'
INTERVAL=2   # upload interval in seconds
next_reading = time.time() 
client = mqtt.Client()
client.username_pw_set(ACCESS_TOKEN)
client.connect(THINGSBOARD_HOST, 1883, 60)
client.loop_start()
try:
    while True:
        data_serial=ser.readline()
        if len(data_serial) >  10:
            data = data_serial.replace("\r\n", "").split(",")
            st = datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
            sensor_data = {
                "timestamp": st,
                "vibration": data[0],
                "pm25": data[1],
                "pm10": data[2],
                "wind_speed": data[3],
                "wind_direction": data[4],
                "rain": data[5],
                "humidity": data[6],
                "presssure": data[7],
                "temperature": data[8],
                "uv": data[9],
                "sound": data[10],
                "battery": data[11]
            }
            client.publish('v1/devices/me/telemetry', json.dumps(sensor_data), 1)
            print sensor_data
            next_reading += INTERVAL
            sleep_time = next_reading-time.time()
            if sleep_time > 0:
                time.sleep(sleep_time)
except KeyboardInterrupt:
    pass

client.loop_stop()
client.disconnect()