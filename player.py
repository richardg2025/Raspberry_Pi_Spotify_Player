#!/usr/bin/env python
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from time import sleep
import json
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

def load_assigned_tags():
    with open("AssignedTags.json", "r") as file:
        return json.load(file)

def get_device_id(sp):
    devices = sp.devices()
    if devices['devices']:
        return devices['devices'][0]['id']
    else:
        raise Exception("No available devices found.")

def scan_rfid(sp, assigned_tags, device_id):
    try:
        reader = SimpleMFRC522()
        while True:
            print("Waiting for scan")
            id, _ = reader.read()
            print("Card Value is:", id)
            sp.transfer_playback(device_id=device_id)

            # Directly access the assigned_tags dictionary with the scanned ID
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

    except Exception as e:
        print(f"Error during RFID scan: {e}")

    finally:
        print("Cleaning up...")
        GPIO.cleanup()

if __name__ == '__main__':
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                                   client_secret=CLIENT_SECRET,
                                                   redirect_uri="http://localhost:8080",
                                                   scope="user-read-playback-state,user-modify-playback-state"))
    assigned_tags = load_assigned_tags()
    device_id = get_device_id(sp)
    print(f"Using Device ID: {device_id}")
    scan_rfid(sp, assigned_tags, device_id)