import React from 'react';

interface ResultsDisplayProps {
  xmlUrl: string;
  srtUrl: string;
  audioUrl: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ xmlUrl, srtUrl, audioUrl }) => {
  if (!xmlUrl && !srtUrl) return null;

  return (
    <div className="w-full mx-auto p-8 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl">
      <h3 className="text-xl font-medium text-gray-200 mb-6">
        ¡Procesamiento completado!
      </h3>
      <div className="space-y-3">
        {xmlUrl && (
          <a
            href={xmlUrl}
            download
            className="block w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 
                     hover:from-emerald-700 hover:to-teal-700 text-white text-center rounded-lg 
                     transition-all duration-200 shadow-lg hover:shadow-emerald-500/20"
          >
            Descargar XML
          </a>
        )}
        {srtUrl && (
          <a
            href={srtUrl}
            download
            className="block w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 
                     hover:from-emerald-700 hover:to-teal-700 text-white text-center rounded-lg 
                     transition-all duration-200 shadow-lg hover:shadow-emerald-500/20"
          >
            Descargar SRT
          </a>
        )}
        {audioUrl && (
          <a
            href={audioUrl}
            download
            className="block w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 
                     hover:from-emerald-700 hover:to-teal-700 text-white text-center rounded-lg 
                     transition-all duration-200 shadow-lg hover:shadow-emerald-500/20"
          >
            Descargar Audio
          </a>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay; 