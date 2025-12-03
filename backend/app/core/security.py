"""
安全工具模組
提供 API Key 加密/解密功能
"""
from cryptography.fernet import Fernet
import base64
import hashlib
import logging

logger = logging.getLogger(__name__)


class SecurityManager:
    """安全管理器 - 處理敏感數據加密"""

    def __init__(self, encryption_key: str = None):
        """
        初始化安全管理器

        Args:
            encryption_key: 加密密鑰,如果為 None 則使用默認密鑰
        """
        if encryption_key:
            # 使用提供的密鑰生成 Fernet 密鑰
            key = self._derive_key(encryption_key)
        else:
            # 使用默認密鑰
            key = Fernet.generate_key()

        self.cipher = Fernet(key)

    @staticmethod
    def _derive_key(password: str) -> bytes:
        """
        從密碼派生 Fernet 密鑰

        Args:
            password: 原始密碼

        Returns:
            32 字節的 base64 編碼密鑰
        """
        # 使用 SHA256 生成固定長度的密鑰
        key = hashlib.sha256(password.encode()).digest()
        return base64.urlsafe_b64encode(key)

    def encrypt(self, plaintext: str) -> str:
        """
        加密文本

        Args:
            plaintext: 明文

        Returns:
            加密後的文本 (base64)
        """
        if not plaintext:
            return ""

        try:
            encrypted = self.cipher.encrypt(plaintext.encode())
            return encrypted.decode()
        except Exception as e:
            logger.error(f"加密失敗: {str(e)}")
            raise

    def decrypt(self, ciphertext: str) -> str:
        """
        解密文本

        Args:
            ciphertext: 密文 (base64)

        Returns:
            解密後的明文
        """
        if not ciphertext:
            return ""

        try:
            decrypted = self.cipher.decrypt(ciphertext.encode())
            return decrypted.decode()
        except Exception as e:
            logger.error(f"解密失敗: {str(e)}")
            raise


# 全局安全管理器實例 (延遲初始化)
_security_manager = None


def get_security_manager(encryption_key: str = None) -> SecurityManager:
    """
    獲取全局安全管理器實例

    Args:
        encryption_key: 加密密鑰

    Returns:
        SecurityManager 實例
    """
    global _security_manager

    if _security_manager is None:
        from ..config import settings
        key = encryption_key or settings.ENCRYPTION_KEY
        _security_manager = SecurityManager(key)

    return _security_manager
