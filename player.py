# player.py
#!/usr/bin/env python
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from time import sleep
import json
from dotenv import load_dotenv
import os
import sys
import signal
from flask import Flask, request
from flask_socketio import SocketIO
from flask_cors import CORS
import threading
import atexit

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Load environment variables
load_dotenv()

CLIENT_ID = os.getenv("REACT_APP_CLIENT_ID")
CLIENT_SECRET = os.getenv("REACT_APP_CLIENT_SECRET")

def load_assigned_tags():
    try:
        with open("AssignedTags.json", "r") as file:
            return json.load(file)
    except Exception as e:
        print(f"Error loading assigned tags: {e}")
        return {}

def get_device_id(sp):
    devices = sp.devices()
    if devices['devices']:
        return devices['devices'][0]['id']
    else:
        raise Exception("No available devices found.")

def scan_rfid(sp, assigned_tags, device_id):
    reader = SimpleMFRC522()
    try:
        while True:
            print("Waiting for scan")
            id, _ = reader.read()
            print("Card Value is:", id)
            sp.transfer_playback(device_id=device_id)

            uri = assigned_tags.get(str(id))

            if uri:
                if "track" in uri:
                    sp.start_playback(device_id=device_id, uris=[uri])
                elif "album" in uri or "playlist" in uri:
                    sp.start_playback(device_id=device_id, context_uri=uri)
                print(f"Playing: {uri}")
            else:
                print("ID not recognized!")

            sleep(2)
    except KeyboardInterrupt:
        print("Exiting cleanly...")
    except Exception as e:
        print(f"Error during RFID scan: {e}")
    finally:
        GPIO.cleanup()
        sys.exit()

@app.route('/')
def index():
    return "RFID Scanner Running"

@app.route('/shutdown')
def shutdown():
    cleanup()
    func = request.environ.get('werkzeug.server.shutdown')
    if func:
        func()
    return "Player shutting down..."

def cleanup():
    GPIO.cleanup()

def signal_handler(sig, frame):
    print('Shutting down server...')
    cleanup()
    sys.exit(0)

if __name__ == '__main__':
    GPIO.setwarnings(False)
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                                   client_secret=CLIENT_SECRET,
                                                   redirect_uri="http://localhost:8080",
                                                   scope="user-read-playback-state,user-modify-playback-state"))
    assigned_tags = load_assigned_tags()
    device_id = get_device_id(sp)
    print(f"Using Device ID: {device_id}")
    scan_rfid(sp, assigned_tags, device_id)
    atexit.register(cleanup)
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    threading.Thread(target=scan_rfid, daemon=True).start()
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
