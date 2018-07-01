
#include <LiquidCrystal.h>
int index = 0;

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
  Serial.begin(9600);

  lcd.begin(16, 2);  

}

void loop() {

  if (Serial.available()) {
    delay(100);
    lcd.write(Serial.read());
    lcd.clear();
    lcd.write("Hei ");
    lcd.setCursor(4,0);
    while(Serial.available()>0){
      if(index == 16){
        lcd.setCursor(0,1);
      }
      char input = Serial.read();
 //     Serial.print(input);
      lcd.write(input);
      index++;
 
    }
    index = 0;
  }
}
