import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
from flask import Flask, request
from flask_socketio import SocketIO
from flask_cors import CORS
import threading
import atexit
import signal
import sys

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

reader = SimpleMFRC522()

def scan_rfid():
    try:
        while True:
            print("Waiting for scan")
            id, _ = reader.read()
            print("The ID for the scanned card is:", id)
            socketio.emit('rfid_scan', {'id': id})
    except Exception as e:
        print(f"Error during RFID scan: {e}")
    finally:
        cleanup()

@app.route('/')
def index():
    return "RFID Scanner Running"

@app.route('/shutdown')
def shutdown():
    cleanup()
    func = request.environ.get('werkzeug.server.shutdown')
    if func:
        func()
    return "Server shutting down..."

def cleanup():
    GPIO.cleanup()

def signal_handler(sig, frame):
    print('Shutting down server...')
    cleanup()
    sys.exit(0)

if __name__ == '__main__':
    GPIO.setwarnings(False)
    atexit.register(cleanup)
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    threading.Thread(target=scan_rfid, daemon=True).start()
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)