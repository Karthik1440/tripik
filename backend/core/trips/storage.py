import os
import posixpath
from django.core.files.storage import Storage
from django.conf import settings
from imagekitio import ImageKit


class ImageKitStorage(Storage):
    """
    Custom Django Storage backend for ImageKit.io with Cloudinary fallback for legacy images.
    """
    def __init__(self):
        self.public_key = getattr(settings, 'IMAGEKIT_PUBLIC_KEY', os.getenv('IMAGEKIT_PUBLIC_KEY', ''))
        self.private_key = getattr(settings, 'IMAGEKIT_PRIVATE_KEY', os.getenv('IMAGEKIT_PRIVATE_KEY', ''))
        self.url_endpoint = getattr(settings, 'IMAGEKIT_URL_ENDPOINT', os.getenv('IMAGEKIT_URL_ENDPOINT', '')).rstrip('/')

        if self.private_key and self.private_key != 'your_private_key':
            try:
                self.client = ImageKit(private_key=self.private_key)
            except Exception:
                self.client = None
        else:
            self.client = None

    def _save(self, name, content):
        if not self.client:
            return name

        name = name.replace('\\', '/')
        dir_name, file_name = posixpath.split(name)
        folder_path = f"/{dir_name}" if dir_name else "/"

        file_bytes = content.read()
        if hasattr(content, 'seek'):
            content.seek(0)

        try:
            upload_res = self.client.files.upload(
                file=file_bytes,
                file_name=file_name,
                folder=folder_path,
                use_unique_file_name=True
            )

            if hasattr(upload_res, 'file_path') and upload_res.file_path:
                return upload_res.file_path.lstrip('/')
            elif hasattr(upload_res, 'name') and upload_res.name:
                return posixpath.join(dir_name, upload_res.name)
        except Exception:
            pass

        return name

    def _open(self, name, mode='rb'):
        raise NotImplementedError("ImageKitStorage does not support direct file reading.")

    def exists(self, name):
        return False

    def url(self, name):
        if not name:
            return ""
        if name.startswith("http://") or name.startswith("https://"):
            return name

        clean_name = name.lstrip('/')

        # Fallback to Cloudinary legacy media URL if ImageKit ID is placeholder 'your_id' or unconfigured
        if not self.url_endpoint or "your_id" in self.url_endpoint:
            return f"https://res.cloudinary.com/dlsvpokcu/image/upload/v1/{clean_name}"
        
        return f"{self.url_endpoint}/{clean_name}"
