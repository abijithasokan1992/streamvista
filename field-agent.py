import subprocess
import requests
import json
import os
import sys

# Configuration for the StreamVista Hub
HUB_URL = "http://localhost:3000" # Replace with your ngrok/localtunnel URL
JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImZ1bGxOYW1lIjoiQWJpaml0aCBBc29rYW4iLCJlbWFpbCI6ImFiaWppdGhhc29rYW5AY3JheW9uc3BpY3R1cmVzLmNvbSIsIndvcmtzcGFjZSI6InN0dWRpbyIsInRvbGUiOiJhZG1pbiIsImlhdCI6MTc4Mjg4NzE2NCwiZXhwIjoxNzgzNDkxOTY0fQ.BkBCS2wFRvseTBNUKd6zc3bmqJe5Uk2rGzf_z2Z2seM"
SUSPECT_ID = "arjunajith941@gmail.com"

def run_adb(command):
    try:
        result = subprocess.run(["adb"] + command.split(), capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"[FieldAgent] ADB Error: {e.stderr}")
        return None
    except FileNotFoundError:
        print("[FieldAgent] Error: ADB not found on this system.")
        return None

def extract_contacts():
    print("[FieldAgent] Extracting Contacts...")
    # Standard Android content provider query for contacts
    contacts = run_adb("shell content query --uri content://com.android.contacts/data --projection display_name:data1")
    if contacts:
        with open("contacts_extraction.txt", "w") as f:
            f.write(contacts)
        return "contacts_extraction.txt"
    return None

def extract_conversations():
    print("[FieldAgent] Extracting SMS Conversations...")
    # Standard Android content provider query for SMS
    sms = run_adb("shell content query --uri content://sms --projection address:body:date")
    if sms:
        with open("conversations_extraction.txt", "w") as f:
            f.write(sms)
        return "conversations_extraction.txt"
    return None

def upload_to_hub(file_path):
    if not file_path or not os.path.exists(file_path):
        return

    print(f"[FieldAgent] Syncing {file_path} to Police Data Box...")
    url = f"{HUB_URL}/api/ingest"
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    files = {'file': open(file_path, 'rb')}
    data = {'useDataBox': 'true', 'suspectId': SUSPECT_ID}

    try:
        response = requests.post(url, headers=headers, files=files, data=data)
        if response.status_code == 200:
            print(f"[FieldAgent] Successfully synced: {file_path}")
            # Secure deletion of local extraction file after sync
            os.remove(file_path)
        else:
            print(f"[FieldAgent] Sync Failed: {response.text}")
    except Exception as e:
        print(f"[FieldAgent] Connection Error: {e}")

def main():
    print(f"=== StreamVista Field Agent - Investigative Bridge ===")
    print(f"Target Identity: {SUSPECT_ID}")
    
    # 1. Extract and Sync Contacts
    contacts_file = extract_contacts()
    upload_to_hub(contacts_file)

    # 2. Extract and Sync Conversations (SMS)
    convos_file = extract_conversations()
    upload_to_hub(convos_file)

    print("=== Extraction Task Complete ===")

if __name__ == "__main__":
    main()
