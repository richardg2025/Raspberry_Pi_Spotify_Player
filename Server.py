# server.py
from flask import Flask
from flask_socketio import SocketIO
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import threading

app = Flask(__name__)
socketio = SocketIO(app)
reader = SimpleMFRC522()

def scan_rfid():
    try:
        while True:
            print("Waiting for scan")
            id = reader.read()[0]
            print("The ID for the scanned card is: ", id)
            socketio.emit('rfid_scan', {'id': id})
    finally:
        GPIO.cleanup()

@app.route('/')
def index():
    return "RFID Scanner Running"

if __name__ == '__main__':
    threading.Thread(target=scan_rfid).start()
    socketio.run(app, host='0.0.0.0', port=5000)