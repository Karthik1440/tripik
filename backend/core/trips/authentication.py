import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from .models import AppUser
import os


def get_firebase_app():
    if not firebase_admin._apps:
        # Try settings first, then env directly, then hardcoded path
        cred_path = (
            settings.FIREBASE_CREDENTIALS_PATH
            or os.getenv('FIREBASE_CREDENTIALS_PATH')
            or r'C:\Users\karth\travel-app\backend\core\firebase-service-account.json'
        )
        print("Using Firebase cred path:", cred_path)
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)


class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')

        if not auth_header.startswith('Bearer '):
            return None

        id_token = auth_header.split('Bearer ')[1]

        get_firebase_app()

        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
        except firebase_auth.ExpiredIdTokenError:
            raise AuthenticationFailed('Token has expired.')
        except firebase_auth.InvalidIdTokenError:
            raise AuthenticationFailed('Invalid token.')
        except Exception as e:
            raise AuthenticationFailed(f'Token verification failed: {str(e)}')

        uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        name = decoded_token.get('name') or ''

        user, _ = AppUser.objects.get_or_create(
            firebase_uid=uid,
            defaults={'email': email, 'display_name': name}
        )

        return (user, None)

    def authenticate_header(self, request):
        return 'Bearer realm="api"'