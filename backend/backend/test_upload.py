import os

def test_upload():
    url = "http://localhost:8000/claims/claims"
    # We need a valid user token, but for now let's see if we can just Hit the endpoint.
    # Actually, the endpoint is protected by Depends(get_current_user). 
    # Generating a full auth flow in a script is complex.
    
    # Alternative: Unit test logic by importing S3Service directly.
    # This verifies the logic I just wrote without needing a running server/auth.
    
    from s3_service import s3_service
    
    print(f"S3 Service Mode: {s3_service.mode}")
    print(f"Upload Dir: {getattr(s3_service, 'upload_dir', 'N/A')}")
    
    content = b"This is a test file content."
    filename = "test_doc.txt"
    content_type = "text/plain"
    
    key = s3_service.upload_file(content, filename, content_type)
    
    if key:
        print(f"Upload successful. Key: {key}")
        # Verify file exists
        expected_path = os.path.join("uploads", key) # s3_service uses relative path "uploads"
        # Wait, s3_service is initialized in backend/backend.
        # If I run this script from backend/backend, it should work.
        
        if os.path.exists(expected_path):
            print(f"File verified at: {expected_path}")
            
            # Clean up
            # s3_service.delete_file(key)
            # print("File deleted.")
        else:
            print(f"File NOT found at: {expected_path}")
    else:
        print("Upload failed.")

if __name__ == "__main__":
    test_upload()
