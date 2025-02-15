import { useState, ChangeEvent } from 'react';
import axios from 'axios';

interface FileUploadProps {
  onStatusChange: (status: string) => void;
  onError: (error: string) => void;
  onSuccess: (xmlUrl: string, srtUrl: string, audioUrl: string) => void;
}

const FileUploadComponent: React.FC<FileUploadProps> = ({
  onStatusChange,
  onError,
  onSuccess
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar el tipo de archivo
      const validTypes = ['.mp3', '.wav', '.m4a'];
      const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      
      if (!validTypes.includes(fileExtension)) {
        onError(`Tipo de archivo no válido. Por favor, use: ${validTypes.join(', ')}`);
        return;
      }
      
      setUploadedFile(file);
      onError(''); // Limpiar cualquier error previo
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      onError('Por favor, seleccione un archivo primero');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      onStatusChange('Subiendo archivo...');
      
      // Verificar que el servidor esté disponible
      try {
        await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/status`);
      } catch (error) {
        throw new Error('No se puede conectar con el servidor. Por favor, verifique que el servidor esté corriendo.');
      }
      
      // Subir y procesar el archivo
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            onStatusChange(`Subiendo archivo: ${progress}%`);
          },
        }
      );

      if (response.data.status === 'success') {
        onStatusChange('Procesamiento completado');
        onSuccess(
          response.data.data.xml_url,
          response.data.data.srt_url,
          response.data.data.audio_url
        );
      } else {
        throw new Error('Error en el procesamiento del archivo');
      }
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || 
          (error.message === 'Network Error' 
            ? 'Error de conexión con el servidor. Verifique que el servidor esté corriendo.' 
            : error.message);
        onError(`Error: ${errorMessage}`);
      } else {
        onError(error instanceof Error ? error.message : 'Error inesperado durante la carga');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-8 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl">
      <div className="space-y-4">
        <input
          type="file"
          onChange={handleFileChange}
          accept=".mp3,.wav,.m4a"
          className="block w-full text-gray-400 
                    file:mr-4 file:py-2 file:px-4 
                    file:rounded-lg file:border-0 
                    file:text-sm file:font-semibold 
                    file:bg-emerald-600 file:text-white 
                    hover:file:bg-emerald-700 
                    file:cursor-pointer file:transition-colors"
          disabled={isUploading}
        />
        <button
          onClick={handleFileUpload}
          disabled={!uploadedFile || isUploading}
          className={`w-full py-3 px-4 
                    ${!uploadedFile || isUploading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'} 
                    text-white rounded-lg transition-all duration-200 
                    shadow-lg hover:shadow-emerald-500/20`}
        >
          {isUploading ? 'Procesando...' : 'Procesar Audio'}
        </button>
      </div>
    </div>
  );
};

export default FileUploadComponent; 