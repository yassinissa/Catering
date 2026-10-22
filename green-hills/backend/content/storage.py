import os

import cloudinary
import cloudinary.uploader
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible

VIDEO_EXTENSIONS = {'.mp4', '.webm', '.mov', '.m4v'}


def _cloud():
    return cloudinary.config().cloud_name


@deconstructible
class CloudinaryStorage(Storage):
    """
    Keeps admin uploads on Cloudinary (Render's own disk is wiped on every deploy).
    Configured by the CLOUDINARY_URL environment variable. Stored name: '<image|video>/<public_id>.<format>'.
    """

    folder = 'green-hills'

    def _save(self, name, content):
        folder, filename = os.path.split(name)
        kind = 'video' if os.path.splitext(filename)[1].lower() in VIDEO_EXTENSIONS else 'image'
        content.seek(0)
        upload = cloudinary.uploader.upload_large if kind == 'video' else cloudinary.uploader.upload
        result = upload(
            content,
            resource_type=kind,
            folder=f'{self.folder}/{folder}'.rstrip('/'),
            use_filename=True,
            unique_filename=True,
            overwrite=False,
        )
        return f"{kind}/{result['public_id']}.{result['format']}"

    def url(self, name):
        kind, rest = name.split('/', 1)
        # images: at most 2000px wide, served as WebP/AVIF where the browser supports it
        transform = 'c_limit,w_2000,f_auto,q_auto' if kind == 'image' else 'q_auto'
        return f'https://res.cloudinary.com/{_cloud()}/{kind}/upload/{transform}/{rest}'

    def video_poster_url(self, name):
        """A still frame of an uploaded video, used when no poster image was uploaded."""
        kind, rest = name.split('/', 1)
        if kind != 'video':
            return ''
        return f'https://res.cloudinary.com/{_cloud()}/video/upload/so_0,f_auto,q_auto/{os.path.splitext(rest)[0]}.jpg'

    def delete(self, name):
        kind, rest = name.split('/', 1)
        cloudinary.uploader.destroy(os.path.splitext(rest)[0], resource_type=kind, invalidate=True)

    def exists(self, name):
        return False  # Cloudinary adds a unique suffix to every upload

    def size(self, name):
        return 0
