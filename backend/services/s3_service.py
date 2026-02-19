"""AWS S3 service for file storage.

Provides upload, download URL generation, and deletion for claim documents.
Uses boto3 with credentials from application settings.
"""
import boto3
from botocore.exceptions import ClientError
from typing import Optional
import logging

from config.settings import settings

logger = logging.getLogger(__name__)


class S3Service:
    """Service for interacting with AWS S3."""
    
    def __init__(self):
        """Initialize S3 client with credentials from settings."""
        self.bucket_name = settings.AWS_S3_BUCKET_NAME
        self.region = settings.AWS_S3_REGION
        
        self.s3_client = boto3.client(
            "s3",
            region_name=self.region,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )
    
    def upload_file(
        self,
        file_bytes: bytes,
        s3_key: str,
        content_type: str = "application/octet-stream"
    ) -> str:
        """Upload a file to S3.
        
        Args:
            file_bytes: Raw file content
            s3_key: S3 object key (path in bucket)
            content_type: MIME type of the file
            
        Returns:
            Full S3 URL of the uploaded object
            
        Raises:
            ClientError: If upload fails
        """
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_bytes,
                ContentType=content_type,
            )
            
            s3_url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{s3_key}"
            logger.info(f"Uploaded file to S3: {s3_key}")
            return s3_url
            
        except ClientError as e:
            logger.error(f"S3 upload failed for key {s3_key}: {e}")
            raise
    
    def generate_presigned_url(
        self,
        s3_key: str,
        expiration: int = 3600
    ) -> Optional[str]:
        """Generate a presigned URL for downloading a file.
        
        Args:
            s3_key: S3 object key
            expiration: URL validity in seconds (default: 1 hour)
            
        Returns:
            Presigned URL string, or None if generation fails
        """
        try:
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": s3_key,
                },
                ExpiresIn=expiration,
            )
            return url
            
        except ClientError as e:
            logger.error(f"Failed to generate presigned URL for {s3_key}: {e}")
            return None
    
    def delete_file(self, s3_key: str) -> bool:
        """Delete a file from S3.
        
        Args:
            s3_key: S3 object key to delete
            
        Returns:
            True if deletion succeeded, False otherwise
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key,
            )
            logger.info(f"Deleted file from S3: {s3_key}")
            return True
            
        except ClientError as e:
            logger.error(f"S3 deletion failed for key {s3_key}: {e}")
            return False
