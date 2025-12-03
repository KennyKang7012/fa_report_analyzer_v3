"""
配置管理 API
提供系統配置的保存、讀取和管理功能
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from ..database import get_db
from ..models.config import SystemConfig
from ..schemas.config import ConfigItem, ConfigUpdate, ConfigResponse
from ..core.security import get_security_manager

router = APIRouter(prefix="/api/v1", tags=["config"])
logger = logging.getLogger(__name__)


@router.get("/config", response_model=List[ConfigResponse])
async def get_all_configs(db: Session = Depends(get_db)):
    """
    獲取所有配置項

    Returns:
        配置項列表,敏感信息已脫敏
    """
    configs = db.query(SystemConfig).all()

    result = []
    for config in configs:
        # API Key 類配置顯示為掩碼
        if "api_key" in config.key.lower() or "key" in config.key.lower():
            display_value = mask_api_key(config.value)
        else:
            display_value = config.value

        result.append({
            "id": config.id,
            "key": config.key,
            "value": display_value,
            "is_encrypted": "api_key" in config.key.lower() or "key" in config.key.lower(),
            "created_at": config.created_at,
            "updated_at": config.updated_at
        })

    return result


@router.get("/config/{key}", response_model=ConfigResponse)
async def get_config_by_key(key: str, db: Session = Depends(get_db)):
    """
    根據 key 獲取配置項

    Args:
        key: 配置鍵

    Returns:
        配置項詳情
    """
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()

    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"配置不存在: {key}"
        )

    # API Key 類配置顯示為掩碼
    if "api_key" in config.key.lower() or "key" in config.key.lower():
        display_value = mask_api_key(config.value)
        is_encrypted = True
    else:
        display_value = config.value
        is_encrypted = False

    return {
        "id": config.id,
        "key": config.key,
        "value": display_value,
        "is_encrypted": is_encrypted,
        "created_at": config.created_at,
        "updated_at": config.updated_at
    }


@router.post("/config", response_model=ConfigResponse)
async def save_config(
    config_item: ConfigItem,
    db: Session = Depends(get_db)
):
    """
    保存或更新配置項

    Args:
        config_item: 配置項
        - key: 配置鍵
        - value: 配置值
        - encrypt: 是否加密 (API Key 等敏感信息)

    Returns:
        保存後的配置項
    """
    # 查找是否已存在
    existing = db.query(SystemConfig).filter(SystemConfig.key == config_item.key).first()

    # 處理加密
    value_to_store = config_item.value
    if config_item.encrypt:
        try:
            security_manager = get_security_manager()
            value_to_store = security_manager.encrypt(config_item.value)
            logger.info(f"配置已加密: {config_item.key}")
        except Exception as e:
            logger.error(f"加密失敗: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"加密配置失敗: {str(e)}"
            )

    if existing:
        # 更新現有配置
        existing.value = value_to_store
        db.commit()
        db.refresh(existing)
        config = existing
        logger.info(f"配置已更新: {config_item.key}")
    else:
        # 創建新配置
        config = SystemConfig(
            key=config_item.key,
            value=value_to_store
        )
        db.add(config)
        db.commit()
        db.refresh(config)
        logger.info(f"配置已創建: {config_item.key}")

    # 返回時脫敏
    display_value = mask_api_key(config.value) if config_item.encrypt else config.value

    return {
        "id": config.id,
        "key": config.key,
        "value": display_value,
        "is_encrypted": config_item.encrypt,
        "created_at": config.created_at,
        "updated_at": config.updated_at
    }


@router.put("/config", response_model=List[ConfigResponse])
async def batch_update_configs(
    configs: ConfigUpdate,
    db: Session = Depends(get_db)
):
    """
    批量更新配置

    Args:
        configs: 配置列表

    Returns:
        更新後的配置列表
    """
    results = []

    for config_item in configs.configs:
        # 重用單個保存的邏輯
        result = await save_config(config_item, db)
        results.append(result)

    logger.info(f"批量更新了 {len(results)} 個配置")
    return results


@router.delete("/config/{key}")
async def delete_config(key: str, db: Session = Depends(get_db)):
    """
    刪除配置項

    Args:
        key: 配置鍵

    Returns:
        刪除結果
    """
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()

    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"配置不存在: {key}"
        )

    db.delete(config)
    db.commit()

    logger.info(f"配置已刪除: {key}")

    return {
        "message": "配置刪除成功",
        "key": key
    }


@router.get("/config/{key}/decrypt")
async def decrypt_config(key: str, db: Session = Depends(get_db)):
    """
    解密並獲取配置值 (僅用於後端內部使用,前端不應調用)

    Args:
        key: 配置鍵

    Returns:
        解密後的配置值
    """
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()

    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"配置不存在: {key}"
        )

    # 嘗試解密
    try:
        if "api_key" in config.key.lower() or "key" in config.key.lower():
            security_manager = get_security_manager()
            decrypted_value = security_manager.decrypt(config.value)
            return {"key": key, "value": decrypted_value}
        else:
            return {"key": key, "value": config.value}
    except Exception as e:
        logger.error(f"解密失敗: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"解密失敗: {str(e)}"
        )


def mask_api_key(api_key: str, visible_chars: int = 4) -> str:
    """
    將 API Key 轉換為掩碼顯示

    Args:
        api_key: 原始 API Key
        visible_chars: 可見字符數

    Returns:
        掩碼後的 API Key
    """
    if not api_key or len(api_key) <= visible_chars:
        return "****"

    return api_key[:visible_chars] + "*" * (len(api_key) - visible_chars)
