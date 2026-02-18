import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.auth.transport.requests import Request

# OAuth scope
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# Your folder ID
FOLDER_ID = "1naDilCnesImx5fn8f8mXL9cbLiFafuHl"


def get_drive_service():
    creds = None

    # Token file (auto created after first login)
    if os.path.exists("token.pickle"):
        with open("token.pickle", "rb") as token:
            creds = pickle.load(token)

    # If no valid credentials, login via browser
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "client_secret.json", SCOPES
            )
            creds = flow.run_local_server(port=0)

        # Save token for future runs
        with open("token.pickle", "wb") as token:
            pickle.dump(creds, token)

    service = build("drive", "v3", credentials=creds)
    return service


def upload_file_to_drive(file_path, file_name):
    service = get_drive_service()

    file_metadata = {
        "name": file_name,
        "parents": [FOLDER_ID]
    }

    media = MediaFileUpload(file_path, resumable=True)

    file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields="id"
    ).execute()

    file_id = file.get("id")

    # Make file public
    service.permissions().create(
        fileId=file_id,
        body={
            "role": "reader",
            "type": "anyone"
        }
    ).execute()

    file_url = f"https://drive.google.com/file/d/{file_id}/view?usp=sharing"

    return file_url
