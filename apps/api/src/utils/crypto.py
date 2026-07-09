from cryptography.fernet import Fernet
from src.config.settings import settings
import base64


def _derive_fernet_key() -> bytes:
    secret = settings.jwt_secret.get_secret_value() if hasattr(settings.jwt_secret, 'get_secret_value') else str(settings.jwt_secret)
    key_bytes = secret.encode()[:32].ljust(32, b'0')
    return base64.urlsafe_b64encode(key_bytes)


_cipher = Fernet(_derive_fernet_key())


def encrypt_api_key(api_key: str) -> str:
    if not api_key:
        return ""
    return _cipher.encrypt(api_key.encode()).decode()


def decrypt_api_key(encrypted_key: str) -> str:
    if not encrypted_key:
        return ""
    return _cipher.decrypt(encrypted_key.encode()).decode()