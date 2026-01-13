import React, { useState, useEffect, useRef } from 'react';

interface PreviewProps {
  htmlContent: string;
  onReset: () => void;
}

// Base64 Encoded SVG Pattern (Cubes/Grid) to avoid CORS/Loading errors in html2pdf
const CUBE_PATTERN = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234cbf8c' fill-opacity='0.2' fill-rule='evenodd'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10z'/%3E%3C/g%3E%3C/svg%3E")`;

const Preview: React.FC<PreviewProps> = ({ htmlContent, onReset }) => {
  const [localHtml, setLocalHtml] = useState(htmlContent);
  const [isEditing, setIsEditing] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const editableRef = useRef<HTMLDivElement>(null);

  // Sync prop with local state when a new generation occurs
  useEffect(() => {
    setLocalHtml(htmlContent);
  }, [htmlContent]);

  const handleDownloadPdf = () => {
    // If we are editing, capture changes first
    if (isEditing && editableRef.current) {
      setLocalHtml(editableRef.current.innerHTML);
    }

    setIsGeneratingPdf(true);
    // Target the outer card container (cf-preview-card) to include header/footer graphics
    const element = document.getElementById('cf-preview-card');

    // Configuration for html2pdf
    const opt = {
      margin: [0, 0, 0, 0],
      filename: 'guia-comunidadfeliz.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save().then(() => {
        setIsGeneratingPdf(false);
      }).catch((err: any) => {
        console.error("PDF generation failed", err);
        setIsGeneratingPdf(false);
      });
    } else {
      console.error("html2pdf library not loaded");
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyForWebflow = () => {
    const currentHtml = isEditing && editableRef.current ? editableRef.current.innerHTML : localHtml;

    const webflowCode = `
<!-- ComunidadFeliz Widget Start -->
<div id="cf-guide-widget">
  <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Montserrat', 'sans-serif'] },
          colors: {
            cf: {
              green: '#4cbf8c',
              blue: '#005fc5',
              celeste: '#eef3fe',
              yellow: '#ffc000',
              red: '#ff6b75',
              gray: '#4e526e',
            }
          }
        }
      }
    }
  </script>

  <style>
    #cf-guide-widget { font-family: 'Montserrat', sans-serif; color: #4e526e; }
  </style>

  <div class="bg-[#fafafa] p-4 md:p-8 rounded-xl border-t-4 border-[#4cbf8c] shadow-lg">
    ${currentHtml}
  </div>
</div>
<!-- ComunidadFeliz Widget End -->
    `.trim();

    navigator.clipboard.writeText(webflowCode).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 3000);
    });
  };

  const toggleEditing = () => {
    if (isEditing && editableRef.current) {
      setLocalHtml(editableRef.current.innerHTML);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-[#4e526e]">Vista Previa & Exportación</h2>
        <div className="flex flex-wrap gap-3 justify-center">

          {/* Edit Mode Toggle */}
          <button
            onClick={toggleEditing}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold transition shadow-md ${isEditing ? 'bg-[#4cbf8c] text-white' : 'bg-white text-[#4e526e] border border-gray-200 hover:border-blue-400'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918a4 4 0 01-1.342.885l-3.155 1.262a.5.5 0 01-.65-.65z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
            </svg>
            {isEditing ? 'Guardar Cambios' : 'Editar Texto'}
          </button>

          {/* Orientation Control */}
          <div className="flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setOrientation('portrait')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${orientation === 'portrait' ? 'bg-white shadow text-[#005fc5]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Vertical
            </button>
            <button
              onClick={() => setOrientation('landscape')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${orientation === 'landscape' ? 'bg-white shadow text-[#005fc5]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Horizontal
            </button>
          </div>

          {/* Python PDF Export Button */}
          <button
            onClick={async () => {
              try {
                const currentHtml = isEditing && editableRef.current ? editableRef.current.innerHTML : localHtml;
                setIsGeneratingPdf(true);
                const apiUrl = (import.meta as any).env.VITE_API_URL || '/api';
                const response = await fetch(`${apiUrl}/export`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    html_content: currentHtml,
                    orientation: orientation
                  })
                });

                if (response.status === 429) {
                  alert("Has excedido el límite de exportaciones. Por favor, espera un minuto e intenta de nuevo.");
                  setIsGeneratingPdf(false);
                  return;
                }

                if (!response.ok) throw new Error('Export failed');

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `guia-comunidadfeliz-${orientation}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setIsGeneratingPdf(false);
              } catch (e) {
                console.error(e);
                setIsGeneratingPdf(false);
                alert("Error exporting: Ensure the Python backend is running (port 8001) and Playwright is installed.");
              }
            }}
            disabled={isGeneratingPdf}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-white transition shadow-md ${isGeneratingPdf ? 'bg-gray-400 cursor-wait' : 'bg-[#ffc000] hover:bg-[#e6ad00]'
              }`}
          >
            {isGeneratingPdf ? (
              <div className="flex items-center"><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>Generando...</div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.965 3.129V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
                Exportar PDF
              </>
            )}
          </button>

          {/* Webflow Copy Button */}
          <button
            onClick={handleCopyForWebflow}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-white transition shadow-md ${copyStatus === 'copied' ? 'bg-[#4cbf8c]' : 'bg-[#005fc5] hover:bg-[#004bb5]'
              }`}
          >
            {copyStatus === 'copied' ? '¡Código Copiado!' : 'Copiar HTML'}
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="bg-[#ff6b75] text-white px-4 py-2 rounded-full font-bold hover:bg-[#ff525e] transition shadow-md flex items-center gap-2"
          >
            Reiniciar
          </button>
        </div>
      </div>

      <div id="cf-preview-card" className="bg-white rounded-xl shadow-2xl overflow-hidden min-h-[600px] border border-gray-100 relative">
        {/* Document Branding Background Shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4cbf8c]/10 rounded-bl-full pointer-events-none"></div>
        <div className="absolute bottom-12 left-0 w-24 h-24 bg-[#ffc000]/10 rounded-tr-full pointer-events-none"></div>

        {/* Brand Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-50 flex justify-between items-center relative z-10">
          <div className="flex items-center">
            <img
              src="/assets/logo-full.jpg"
              alt="ComunidadFeliz"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="h-1 w-16 bg-[#005fc5] rounded-full opacity-20"></div>
        </div>

        <div className="p-8 md:p-12 relative z-10">
          {/* Content */}
          <div
            ref={editableRef}
            contentEditable={isEditing}
            className={`prose prose-slate max-w-none outline-none
                prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6 prose-h1:text-inherit
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:text-inherit
                prose-h3:text-xl prose-h3:font-bold prose-h3:text-inherit
                prose-p:leading-relaxed prose-p:text-inherit
                prose-strong:text-[#4cbf8c]
                ${isEditing ? 'bg-blue-50/30 ring-2 ring-blue-100 rounded-lg p-4 -m-4 cursor-text' : ''}
                `}
            dangerouslySetInnerHTML={{ __html: localHtml }}
          />
        </div>

        {/* Footer Decorator */}
        <div className="w-full h-8 bg-[#eef3fe] mt-auto relative overflow-hidden flex items-center justify-end px-4">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: CUBE_PATTERN,
            backgroundSize: '20px 20px'
          }}></div>
          <span className="relative z-10 text-[10px] text-[#4e526e] opacity-60 font-medium tracking-wider">GENERADO POR COMUNIDADFELIZ</span>
        </div>
      </div>

      {isEditing && (
        <p className="text-center mt-4 text-[#4e526e] opacity-60 text-sm">
          💡 Modo edición activo: puedes hacer clic en cualquier texto para cambiarlo.
        </p>
      )}
    </div>
  );
};

export default Preview;