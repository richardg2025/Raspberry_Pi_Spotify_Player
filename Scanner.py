import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522

reader = SimpleMFRC522()

try:
    print("Waiting for scan")
    id = reader.read()[0]
    print("The ID for the scanned card is: ", id)
        
finally:
    GPIO.cleanup()