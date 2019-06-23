void setup(){
  Serial.begin(9600);
//  randomSeed(100;
}

void loop() {
    for (int i=0; i < 11; i++) { 
        Serial.print(random(100));Serial.print(',');
    }
    Serial.println(random(100));
    delay(1000);
}
