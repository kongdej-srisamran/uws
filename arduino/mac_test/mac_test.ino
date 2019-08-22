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
volatile int numDropRainGauge = 0;

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

void setup() {
  Serial.begin(9600);
  mySerial.begin(9600);
  
  Wire.begin();

  mySensor.beginI2C();
  //if (mySensor.beginI2C() == false) //Begin communication over I2C
  //{
  //   Serial.println("The sensor did not respond. Please check wiring.");
  //   while(1);      //Freeze
  //}

  pinMode(A0, INPUT);
  pinMode(A1, INPUT);
  pinMode(A3, INPUT);
  pinMode(2, INPUT);   // AnemoPin
  pinMode(3, INPUT);   // Rain
  pinMode(4, INPUT);   // Vibretion
  pinMode(5, INPUT);   // sound

  LastValue = 1;

  attachInterrupt(0, countAnemometer, RISING);
  attachInterrupt(1, countRainGauge, FALLING);
}

void loop() {

//-------- For Vibration Sensor ---------
//  int statusVibration = digitalRead(Vibration);
//  Serial.println(statusVibration);
  long measurement = TP_init();
  Serial.print(measurement);
  Serial.print(",");
//---------------------------------------

//-------- For Dust ---------------------
  int index = 0;
  char value;
  char previousValue;

  while (mySerial.available()) {
    value = mySerial.read();
    if ((index == 0 && value != 0x42) || (index == 1 && value != 0x4d)){
//      Serial.println("Cannot find the data header.");
        Serial.print(pm2_5);
        Serial.print(",");
        Serial.print(pm10);
        Serial.print(",");
      break;
    }

    if (index == 4 || index == 6 || index == 8 || index == 10 || index == 12 || index == 14) {
      previousValue = value;
    }
//    else if (index == 5) {
//      pm1 = 256 * previousValue + value;
//      Serial.print("{ ");
//      Serial.print("\"pm1\": ");
//      Serial.print(pm1);
//      Serial.print(", ");
//    }
    else if (index == 7) {
      pm2_5 = 256 * previousValue + value;
//      Serial.print("\"pm2_5\": ");
      Serial.print(pm2_5);
      Serial.print(",");
    }
    else if (index == 9) {
      pm10 = 256 * previousValue + value;
//      Serial.print("\"pm10\": ");
      Serial.print(pm10);
      Serial.print(",");
    } 
    else if (index > 15) {
//        Serial.print(pm2_5);
//        Serial.print(",");
//        Serial.print(pm10);
//        Serial.print(",");
      break;
    }
    index++;
  }

  
//  while(mySerial.available()) mySerial.read();

//---------------------------------------

//-------- For Wind Speed ---------------
  AnemoState = digitalRead(AnemoPin); //Read digital signal
  
//  if (AnemoState == 1) {
//    countAnemometer();
//  }
    
  if (Time >= 60) {
    Time = 0;
    calcAnemometer();
  }
  Time = Time + 60;

//  Serial.print(numRevsAnemometer);
  Serial.print(Speed);
  Serial.print(",");
//---------------------------------------

//-------- For Wind Direction -----------
  VaneValue = analogRead(A3); 
  Direction = map(VaneValue, 0, 1023, 0, 360); 
  CalDirection = Direction + Offset; 

  if(CalDirection > 360) 
  CalDirection = CalDirection - 360; 

  if(CalDirection < 0) 
  CalDirection = CalDirection + 360;

//  Serial.print(Direction);
  getHeading(CalDirection); 
  LastValue = CalDirection;
  Serial.print(","); 
//---------------------------------------

//-------- For RainGauge ----------------
  RainState = digitalRead(RainPin); //Read digital signal
  
//  if (RainState == 0) {
//    countRainGauge();
//  }

  if (TimeRain >= 3600) {
    TimeRain = 0;
    calcRainFall();
  }

  TimeRain = TimeRain + 60;

//  Serial.print(RainState);
//  Serial.print(numDropRainGauge);
  Serial.print(totalRain);
  Serial.print(",");
//---------------------------------------

//-------- For BME280 -------------------
  Serial.print(mySensor.readFloatHumidity(), 0);
  Serial.print(",");
  float Pressure;
    Pressure = mySensor.readFloatPressure()/100000;
  Serial.print(Pressure, 4);
//  Serial.print(mySensor.readFloatPressure(), 0);
  Serial.print(",");
//  Serial.print(mySensor.readFloatAltitudeFeet(), 1);
  Serial.print(mySensor.readTempC(), 2);
  Serial.print(",");
//---------------------------------------

//-------- For UV Sensor ----------------
  int hodnotaUV = prumerAnalogRead(pinOut);
  int hodnotaRef3V3 = prumerAnalogRead(pinRef3V3);

  float napetiOutUV = 3.3 / hodnotaRef3V3 * hodnotaUV;
  float intenzitaUV = prevodNapetiIntenzita(napetiOutUV, 0.96, 2.8, 0.0, 15.0);

  intenzitaUV = intenzitaUV;
  
  Serial.print(intenzitaUV);
  Serial.print(",");
//---------------------------------------

//-------- For Sound Sensor -------------
  int statusSound = digitalRead(Sound);
  if (statusSound == 1) {
  Serial.print("Low");
  Serial.print(",");
  }
  else {
  Serial.print("High");
  Serial.print(",");
  }
//---------------------------------------

//-------- For Voltage Sensor -----------
  float RealVoltage;
  Voltage = analogRead(A2);
  RealVoltage = Voltage * 25 / 1023;
  Serial.println(RealVoltage);
//---------------------------------------

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
  long measurement = pulseIn (Vibration, HIGH);
  
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
  numDropRainGauge++;
}

void calcRainFall() {
  float Vol = 0.2794;
  Rain = Vol * (numDropRainGauge);
  totalRain = totalRain + Rain;
  numDropRainGauge = 0;
}
//---------------------------------------
