import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import threading
import atexit

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize RFID reader
reader = SimpleMFRC522()

def scan_rfid():
    try:
        while True:
            print("Waiting for scan")
            id, _ = reader.read()
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
    atexit.register(cleanup)
    threading.Thread(target=scan_rfid, daemon=True).start()
    socketio.run(app, host='0.0.0.0', port=5000)
