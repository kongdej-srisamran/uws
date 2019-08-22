#include <Wire.h>
#include "SparkFunBME280.h"
#define Offset 0;
BME280 mySensor;
#include <SoftwareSerial.h>

SoftwareSerial mySerial(10, 11); // Rx,Tx

unsigned int pm1 = 0;
unsigned int pm2_5 = 0;
unsigned int pm10 = 0;

int Time;

float Speed;
int AnemoPin = 2;
int AnemoState;
volatile int numRevsAnemometer = 0;

int VaneValue;// raw analog value from wind vane 
int Direction;// translated 0 - 360 direction 
int CalDirection;// converted value with offset applied 
int LastValue;

int TimeRain;

float Rain;
float totalRain;
int RainPin = 3;
int RainState;
int Rain24[24];
unsigned long hour_interval = 60*60*1000;  // Average 24 Hours
unsigned long speed_interval = 1000;   // 1 seconds
unsigned long prevMillis=0;
unsigned long prevMillis_speed=0;
volatile int  numDropRainGauge = 0;

int pinRef3V3 = A0;
int pinOut = A1;

int Sound = 5;
int Vibration = 4;

int measurePin = A2;
int ledPower = 4;
 
int samplingTime = 280;
int deltaTime = 40;
int sleepTime = 9680;
 
float voMeasured = 0;
float calcVoltage = 0;
float dustDensity = 0;

float Voltage;

unsigned long lastTip=0;

void setup() {
  Serial.begin(9600);

  mySerial.begin(9600);
  //Serial.println("Staring...");

  Wire.begin();
  mySensor.beginI2C();
  pinMode(A0, INPUT);
  pinMode(A1, INPUT);
  pinMode(A3, INPUT);
  pinMode(2, INPUT);
  pinMode(3, INPUT); 
  pinMode(4, INPUT);
  pinMode(5, INPUT);
  
  LastValue = 1;
  attachInterrupt(0, countAnemometer, FALLING);  // Pin D2
  attachInterrupt(1, countRainGauge, FALLING);  // Pin D3
}

int i = 0;

//==================================================================
void loop() {
 unsigned long currentMillis = millis();
 
//-------- For Vibration Sensor ---------
  int statusVibration = digitalRead(Vibration);
  long measurement =TP_init();
//---------------------------------------

//-------- For Dust ---------------------
  int index = 0;
  char value;
  char previousValue;
  while (mySerial.available()) {
    value = mySerial.read();
    if ((index == 0 && value != 0x42) || (index == 1 && value != 0x4d)){
      break;
    }

    if (index == 4 || index == 6 || index == 8 || index == 10 || index == 12 || index == 14) {
      previousValue = value;
    }
    else if (index == 7) {
      pm2_5 = 256 * previousValue + value;
    }
    else if (index == 9) {
      pm10 = 256 * previousValue + value;
    } 
    index++;
  }
//---------------------------------------

//-------- For Wind Speed ---------------
  Speed = numRevsAnemometer*2.4;
  if (currentMillis - prevMillis_speed > speed_interval) {
    prevMillis_speed = currentMillis;
    numRevsAnemometer = 0;
  }
//---------------------------------------

//-------- For Wind Direction -----------
  VaneValue = analogRead(A3); 
  Direction = map(VaneValue, 0, 1023, 0, 360); 
  CalDirection = Direction + Offset; 

  if(CalDirection > 360) 
  CalDirection = CalDirection - 360; 

  if(CalDirection < 0) 
  
  CalDirection = CalDirection + 360;
  LastValue = CalDirection;
//---------------------------------------

//-------- For RainGauge ----------------
  if (currentMillis - prevMillis > hour_interval) {
    prevMillis = currentMillis; 
    Rain24[i] = numDropRainGauge;
    i = i < 24 ? i+1:0;
    numDropRainGauge=0;
  }
  int rain_total=0;
  for(int j=0; j<24; j++) {
    rain_total += Rain24[j];
  }
  int RainAvg = rain_total/24;
//---------------------------------------

//-------- For BME280 -------------------
//  Serial.print("BME280 = ");
//---------------------------------------

//-------- For UV Sensor ----------------
  int hodnotaUV = prumerAnalogRead(pinOut);
  int hodnotaRef3V3 = prumerAnalogRead(pinRef3V3);

  float napetiOutUV = 3.3 / hodnotaRef3V3 * hodnotaUV;
  float intenzitaUV = prevodNapetiIntenzita(napetiOutUV, 0.96, 2.8, 0.0, 15.0);
  
  intenzitaUV = intenzitaUV;
//---------------------------------------

//-------- For Sound Sensor -------------
  int statusSound = digitalRead(Sound);
//---------------------------------------

//-------- For Voltage Sensor -----------
  float RealVoltage;
  Voltage = analogRead(A2);
  RealVoltage = Voltage * 25 / 1023;
//---------------------------------------

//---------------------------------------
// send data to serial.
//        
//
 Serial.print(measurement); Serial.print(','); // 1.vibration
 Serial.print(pm2_5); Serial.print(',');       // 2.pm25 
 Serial.print(pm10); Serial.print(',');        // 3.pm10
 Serial.print(Speed); Serial.print(',');       // 4.wind speed
 getHeading(Direction); Serial.print(',');     // 5.wind direction
 Serial.print(RainAvg); Serial.print(',');     // 6.Rain
 Serial.print(mySensor.readFloatHumidity(), 0); Serial.print(",");// 7.Humidity
 Serial.print(mySensor.readFloatPressure(), 0); Serial.print(",");// 8.Pressure
 Serial.print(mySensor.readTempC(), 2); Serial.print(",");        // 9.Temperature C
 Serial.print(intenzitaUV); Serial.print(",");                    // 10.UV
 Serial.print(statusSound); Serial.print(",");                    // 11.Sound
 Serial.print(RealVoltage);                                       // 12.Battery voltage
 Serial.println();
 delay(1000);  
}

//--------- For UV sensor ---------------
int prumerAnalogRead(int pinToRead) {
  byte numberOfReadings = 8;
  unsigned int runningValue = 0; 

  for(int x = 0 ; x < numberOfReadings ; x++)
    runningValue += analogRead(pinToRead);
  runningValue /= numberOfReadings;

  return(runningValue);  
}

float prevodNapetiIntenzita(float x, float in_min, float in_max,float out_min, float out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
//---------------------------------------

//--------- For Vibration Sensor --------
long TP_init(){
  long measurement=pulseIn (Vibration, HIGH);
  return measurement;
}
//---------------------------------------

//--------- For Wind Speed --------------
void countAnemometer() {
  numRevsAnemometer++;
}

void calcAnemometer() {
  int D = 4;
  Speed = D * numRevsAnemometer * 0.001885; //rpm to km/hr
  numRevsAnemometer = 0;
}
//---------------------------------------

//--------- For Wind Direction ----------

void getHeading(int direction) { 
  if(direction < 22) 
  Serial.print("N"); 
  else if (direction < 43) 
  Serial.print("NE"); 
  else if (direction < 67) 
  Serial.print("E"); 
  else if (direction < 109) 
  Serial.print("NW"); 
  else if (direction < 149) 
  Serial.print("SE"); 
  else if (direction < 182) 
  Serial.print("W"); 
  else if (direction < 208) 
  Serial.print("SW"); 
  else if (direction < 221) 
  Serial.print("S"); 
  else 
  Serial.print("No"); 
}
//---------------------------------------

//--------- For Rain Gauge --------------
void countRainGauge() {
   if(millis() - lastTip > 500){
     numDropRainGauge++;
     lastTip = millis();
   }
}

void calcRainFall() {
  float Vol = 0.2794;
  Rain = Vol * (numDropRainGauge);
  totalRain = totalRain + Rain;
  numDropRainGauge = 0;
}
//---------------------------------------
