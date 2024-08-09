#!/usr/bin/env python
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from time import sleep
import json

CLIENT_ID = "eb2882904717400b8c951b7d4f460f34"
CLIENT_SECRET = "f034ff6408864b47840923cab4a317dc"

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

            # Check if the scanned ID is in the JSON data
            uri = None
            for tag in assigned_tags:
                if str(id) in tag:
                    uri = tag[str(id)]
                    break

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
