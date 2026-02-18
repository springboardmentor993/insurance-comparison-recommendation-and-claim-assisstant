import boto3
from botocore.exceptions import ClientError
from typing import Optional
import logging
from datetime import datetime, timedelta
import os

from config import (
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    S3_BUCKET_NAME,
)

logger = logging.getLogger(__name__)


class S3Service:
    def __init__(self):
        # Check if AWS credentials are provided
        if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                region_name=AWS_REGION,
            )
            self.bucket_name = S3_BUCKET_NAME
            self.mode = "s3"
            logger.info("S3 Service initialized in S3 mode")
        else:
            self.s3_client = None
            self.bucket_name = None
            self.mode = "local"
            # Local uploads directory (must match main.py mount)
            self.upload_dir = "uploads"
            os.makedirs(self.upload_dir, exist_ok=True)
            logger.info("S3 Service initialized in LOCAL mode (uploads/)")

    def upload_file(
        self,
        file_content: bytes,
        file_name: str,
        content_type: str,
        folder: str = "claims"
    ) -> Optional[str]:
        """
        Upload file to S3 or local storage and return the key.
        """
        # Generate unique key with timestamp
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        key = f"{folder}/{timestamp}_{file_name}"
        
        try:
            if self.mode == "s3":
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=key,
                    Body=file_content,
                    ContentType=content_type,
                )
                logger.info(f"File uploaded successfully to S3: {key}")
                return key
            else:
                # Local storage
                file_path = os.path.join(self.upload_dir, folder, f"{timestamp}_{file_name}")
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
                with open(file_path, "wb") as f:
                    f.write(file_content)
                
                logger.info(f"File saved locally: {file_path}")
                return key
                
        except Exception as e:
            logger.error(f"Error uploading file ({self.mode}): {e}")
            return None

    def generate_presigned_url(
        self,
        s3_key: str,
        expiration: int = 3600
    ) -> Optional[str]:
        """
        Generate a URL for accessing the file.
        """
        if self.mode == "s3":
            try:
                url = self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket_name, 'Key': s3_key},
                    ExpiresIn=expiration
                )
                return url
            except ClientError as e:
                logger.error(f"Error generating presigned URL: {e}")
                return None
        else:
            # Local URL
            # Ideally use a configured base URL, but localhost default works for dev
            # The key includes folder e.g. "claims/file.jpg"
            # Main.py mounts "uploads" to "/static"
            # So URL is /static/claims/file.jpg
            base_url = "http://localhost:8000"
            return f"{base_url}/static/{s3_key}"

    def delete_file(self, s3_key: str) -> bool:
        """
        Delete file from S3 or local storage.
        """
        try:
            if self.mode == "s3":
                self.s3_client.delete_object(
                    Bucket=self.bucket_name,
                    Key=s3_key
                )
                logger.info(f"File deleted successfully from S3: {s3_key}")
                return True
            else:
                file_path = os.path.join(self.upload_dir, s3_key)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"File deleted locally: {file_path}")
                    return True
                return False
                
        except Exception as e:
            logger.error(f"Error deleting file ({self.mode}): {e}")
            return False

    def get_public_url(self, s3_key: str) -> str:
        """
        Get public URL for object.
        """
        if self.mode == "s3":
            return f"https://{self.bucket_name}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
        else:
            return self.generate_presigned_url(s3_key)


# Singleton instance
s3_service = S3Service()
