import os
import uuid
import boto3

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_ENDPOINT = os.getenv("R2_ENDPOINT")
R2_PUBLIC_BASE_URL = os.getenv("R2_PUBLIC_BASE_URL")

# Configure the Cloudflare R2 S3 client
s3 = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    region_name="auto",
)


def generate_object_key(prefix: str, filename: str) -> str:
    ext = ""
    if "." in filename:
        ext = "." + filename.rsplit(".", 1)[-1].lower()
    return f"{prefix}/{uuid.uuid4().hex}{ext}"


def upload_bytes(prefix: str, filename: str, data: bytes, content_type: str) -> str:
    key = generate_object_key(prefix, filename)

    s3.put_object(
        Bucket=R2_BUCKET_NAME,
        Key=key,
        Body=data,
        ContentType=content_type,
    )

    # Public URL returned to the frontend
    return f"{R2_PUBLIC_BASE_URL}/{key}"
