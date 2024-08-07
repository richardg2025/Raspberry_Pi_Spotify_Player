# server.py
from flask import Flask
from flask_socketio import SocketIO
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import threading
import atexit

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
    except Exception as e:
        print(f"Error during RFID scan: {e}")
    finally:
        GPIO.cleanup()

@app.route('/')
def index():
    return "RFID Scanner Running"

def cleanup():
    GPIO.cleanup()

if __name__ == '__main__':
    # Ensure GPIO cleanup on exit
    atexit.register(cleanup)
    threading.Thread(target=scan_rfid, daemon=True).start()
    socketio.run(app, host='0.0.0.0', port=5000)
