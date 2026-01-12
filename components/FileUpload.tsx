import React, { useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && files[0].type === 'application/pdf') {
      onFileSelect(files[0]);
    } else {
      alert("Por favor sube un archivo PDF válido.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${
          isLoading 
            ? 'border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed' 
            : 'border-[#4cbf8c] bg-[#eef3fe] hover:bg-[#eef3fe]/80 cursor-pointer'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleChange}
          disabled={isLoading}
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#4cbf8c] mb-4"></div>
            <p className="text-[#4e526e] font-semibold text-lg">Generando Guía Visual...</p>
            <p className="text-[#4e526e] text-sm mt-2">Analizando PDF con Gemini</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-[#4cbf8c] rounded-full flex items-center justify-center mb-4 text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#4e526e] mb-2">Sube tu documento PDF</h3>
            <p className="text-center text-[#4e526e] opacity-80 mb-6">
              Arrastra y suelta tu archivo aquí, o haz clic para seleccionar.
            </p>
            <button className="bg-[#005fc5] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-[#004bb5] transition transform hover:scale-105">
              Seleccionar Archivo
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
