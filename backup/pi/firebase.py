from firebase import firebase
firebase = firebase.FirebaseApplication('https://raspberrypi-1ee5e.firebaseio.com/', None)
result = firebase.get('/sensor', None, params={'print': 'pretty'}, headers={'X_FANCY_HEADER': 'very fancy'})
print result
