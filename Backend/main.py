from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
import shutil
import asyncio
from datetime import datetime
from sound_to_xml import MoodboardSimple
import logging
import uvicorn
from pathlib import Path
from typing import Optional

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuración de la aplicación
app = FastAPI(
    title="Sound to XML API",
    description="API para procesar archivos de audio y generar archivos XML/SRT con marcadores",
    version="1.0.0"
)

# Configuración de CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # URL del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de directorios
UPLOAD_DIR = Path("audiosrt")
UPLOAD_DIR.mkdir(exist_ok=True)

# Montar directorio de archivos estáticos
app.mount("/files", StaticFiles(directory=str(UPLOAD_DIR)), name="files")

async def process_audio_file(file_path: Path, background_tasks: BackgroundTasks):
    """Procesa el archivo de audio usando MoodboardSimple."""
    try:
        moodboard = MoodboardSimple(str(UPLOAD_DIR))
        xml_path, srt_path = await moodboard.procesar_audio(str(file_path))
        return xml_path, srt_path
    except Exception as e:
        logger.error(f"Error procesando audio: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error en el procesamiento del audio: {str(e)}"
        )

def cleanup_old_files():
    """Limpia archivos antiguos del directorio de uploads."""
    try:
        current_time = datetime.now().timestamp()
        for file in UPLOAD_DIR.glob("*"):
            if file.is_file() and (current_time - file.stat().st_mtime) > 3600:  # 1 hora
                file.unlink()
    except Exception as e:
        logger.error(f"Error limpiando archivos: {str(e)}")

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks()
) -> JSONResponse:
    """
    Endpoint para subir y procesar archivos de audio.
    Acepta archivos .mp3, .wav y .m4a
    """
    # Validar extensión del archivo
    allowed_extensions = {".mp3", ".wav", ".m4a"}
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido. Use: {', '.join(allowed_extensions)}"
        )

    try:
        # Crear nombre único para el archivo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"audio_{timestamp}{file_extension}"
        file_path = UPLOAD_DIR / safe_filename

        # Guardar el archivo
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Procesar el archivo
        xml_path, srt_path = await process_audio_file(file_path, background_tasks)

        # Programar limpieza de archivos antiguos
        background_tasks.add_task(cleanup_old_files)

        # Construir URLs para los archivos generados
        base_url = "http://localhost:5001/files"  # URL base para archivos
        xml_url = f"{base_url}/{Path(xml_path).name}"
        srt_url = f"{base_url}/{Path(srt_path).name}"
        audio_url = f"{base_url}/{safe_filename}"

        return JSONResponse({
            "status": "success",
            "message": "Archivo procesado exitosamente",
            "data": {
                "xml_url": xml_url,
                "srt_url": srt_url,
                "audio_url": audio_url
            }
        })

    except Exception as e:
        logger.error(f"Error en upload_file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/download/{filename}")
async def download_file(filename: str) -> FileResponse:
    """
    Endpoint para descargar archivos procesados.
    """
    try:
        file_path = UPLOAD_DIR / filename
        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Archivo no encontrado"
            )

        return FileResponse(
            str(file_path),
            media_type='application/octet-stream',
            filename=filename
        )

    except Exception as e:
        logger.error(f"Error en download_file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al descargar el archivo: {str(e)}"
        )

@app.get("/status")
async def check_status() -> JSONResponse:
    """
    Endpoint para verificar el estado del servidor y la conexión.
    """
    try:
        return JSONResponse({
            "status": "online",
            "upload_directory": str(UPLOAD_DIR),
            "upload_directory_exists": UPLOAD_DIR.exists(),
            "server_time": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error en check_status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al verificar el estado del servidor"
        )

@app.get("/")
async def read_root() -> JSONResponse:
    """
    Endpoint raíz que muestra información sobre la API.
    """
    return JSONResponse({
        "name": "Sound to XML API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "upload": "/upload",
            "download": "/download/{filename}",
            "status": "/status"
        },
        "supported_formats": [".mp3", ".wav", ".m4a"]
    })

if __name__ == "__main__":
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=5001,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        logger.error(f"Error iniciando el servidor: {str(e)}") 