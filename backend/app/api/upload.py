"""
文件上傳 API
提供 FA 報告文件上傳功能,支援多種格式
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid
import logging
from ..config import settings

router = APIRouter(prefix="/api/v1", tags=["upload"])
logger = logging.getLogger(__name__)

# 創建上傳目錄
UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(exist_ok=True)

# 支援的文件格式
ALLOWED_EXTENSIONS = {
    ".pdf", ".docx", ".pptx", ".txt",
    ".jpg", ".jpeg", ".png", ".gif", ".webp"
}


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    上傳 FA 報告文件

    支援格式: PDF, DOCX, PPTX, TXT, JPG, PNG, GIF, WEBP
    最大大小: 50MB

    Returns:
        - file_id: 文件唯一標識
        - filename: 原始文件名
        - size: 文件大小(字節)
        - path: 服務器存儲路徑
    """

    # 驗證文件類型
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"不支援的文件格式: {file_ext}。支援格式: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 讀取並驗證文件大小
    content = await file.read()
    file_size = len(content)

    if file_size > settings.MAX_FILE_SIZE:
        max_mb = settings.MAX_FILE_SIZE // (1024 * 1024)
        current_mb = file_size / (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"文件過大 ({current_mb:.2f}MB),最大允許 {max_mb}MB"
        )

    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="文件為空,請上傳有效文件"
        )

    # 生成唯一文件 ID 並保存
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}{file_ext}"

    try:
        with open(file_path, "wb") as f:
            f.write(content)

        logger.info(f"文件上傳成功: {file.filename} -> {file_id}{file_ext}")

        return {
            "file_id": file_id,
            "filename": file.filename,
            "size": file_size,
            "path": str(file_path)
        }

    except Exception as e:
        logger.error(f"文件保存失敗: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"文件保存失敗: {str(e)}"
        )


@router.delete("/upload/{file_id}")
async def delete_uploaded_file(file_id: str):
    """
    刪除已上傳的文件

    Args:
        file_id: 文件 ID

    Returns:
        成功消息
    """
    # 查找文件
    matching_files = list(UPLOAD_DIR.glob(f"{file_id}.*"))

    if not matching_files:
        raise HTTPException(
            status_code=404,
            detail="文件不存在"
        )

    try:
        for file_path in matching_files:
            file_path.unlink()
            logger.info(f"文件已刪除: {file_path}")

        return {"message": "文件刪除成功", "file_id": file_id}

    except Exception as e:
        logger.error(f"文件刪除失敗: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"文件刪除失敗: {str(e)}"
        )
