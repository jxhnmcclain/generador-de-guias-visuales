import React, { useState } from 'react';
import GeometricShapes from './components/GeometricShapes';
import FileUpload from './components/FileUpload';
import Preview from './components/Preview';
import { fileToBase64, generateSiteFromPdf } from './services/geminiService';
import { AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);

    try {
      const base64 = await fileToBase64(file);
      const generatedHtml = await generateSiteFromPdf(base64);
      setHtmlContent(generatedHtml);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error al procesar el documento. Por favor intenta de nuevo.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setHtmlContent('');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-[#4cbf8c] selection:text-white">
      {/* Brand Navbar */}
      <nav className="relative z-20 bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
               {/* Simulated Logo */}
               <div className="w-10 h-10 bg-[#4cbf8c] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                 CF
               </div>
               <span className="font-bold text-2xl tracking-tight text-[#4e526e]">
                 Comunidad<span className="text-[#4cbf8c]">Feliz</span>
               </span>
            </div>
            <div className="hidden md:flex space-x-8">
               <span className="text-[#005fc5] font-semibold cursor-pointer hover:opacity-80">Documentación</span>
               <span className="text-[#4e526e] font-semibold cursor-pointer hover:text-[#4cbf8c] transition">Ayuda</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Decorative Background */}
      <GeometricShapes />

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center min-h-[calc(100vh-80px)]">
        
        {appState === AppState.IDLE && (
          <div className="text-center mb-12 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold text-[#4e526e] mb-6">
              Generador de <span className="text-[#005fc5]">Guías Visuales</span>
            </h1>
            <p className="text-lg text-[#4e526e] max-w-2xl mx-auto leading-relaxed">
              Transforma tus documentos PDF en páginas web hermosas y estructuradas, 
              siguiendo automáticamente la identidad visual de ComunidadFeliz.
            </p>
          </div>
        )}

        {appState === AppState.ERROR && (
           <div className="w-full max-w-2xl bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-center text-red-600">
              {errorMsg}
              <button onClick={handleReset} className="block mx-auto mt-2 text-sm font-bold underline">Intentar de nuevo</button>
           </div>
        )}

        {(appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ERROR) && (
          <FileUpload 
            onFileSelect={handleFileSelect} 
            isLoading={appState === AppState.ANALYZING} 
          />
        )}

        {appState === AppState.SUCCESS && (
          <Preview htmlContent={htmlContent} onReset={handleReset} />
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white border-t border-gray-100 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-[#4e526e] text-sm">
          <p>© {new Date().getFullYear()} ComunidadFeliz. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
