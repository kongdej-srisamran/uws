import os
import urllib

while True:

	status = urllib.urlopen('https://khun-raspberry.herokuapp.com/reboot.text')

	print status.read()
#os.system('sudo reboot')
