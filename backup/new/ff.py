import ffmpy
ff = ffmpy.FFmpeg(inputs={'http://10.60.219.121:8080/?action=stream': None},
outputs={'/home/pi/image/output1.jpg': ['-y','-vf', "drawtext=fontfile=/home/pi/font/arial.ttf: text='25C 75\\\% 20ppm':fontcolor=black:fontsize=24:box=1:x=(w-text_w)/2: y=(h-text_h)-3"]})
ff.run()

