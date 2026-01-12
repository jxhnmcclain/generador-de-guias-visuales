import React, { useState } from 'react';

interface PreviewProps {
  htmlContent: string;
  onReset: () => void;
}

// Base64 Encoded SVG Pattern (Cubes/Grid) to avoid CORS/Loading errors in html2pdf
const CUBE_PATTERN = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234cbf8c' fill-opacity='0.2' fill-rule='evenodd'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10z'/%3E%3C/g%3E%3C/svg%3E")`;

const Preview: React.FC<PreviewProps> = ({ htmlContent, onReset }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    // Target the outer card container (cf-preview-card) to include header/footer graphics
    const element = document.getElementById('cf-preview-card');

    // Configuration for html2pdf
    const opt = {
      margin: [0, 0, 0, 0], // Zero margins to let the card design fill the page if needed, or small margins
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

    // Access html2pdf from window object (loaded via CDN)
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
    // Wrap the content in a self-contained HTML structure suitable for embedding
    const webflowCode = `
<!-- ComunidadFeliz Widget Start -->
<div id="cf-guide-widget">
  <!-- Tailwind CSS (Scoped via simple CDN for widget) -->
  <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <!-- Google Fonts -->
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
    /* Ensure font applies to widget container */
    #cf-guide-widget { font-family: 'Montserrat', sans-serif; color: #4e526e; }
  </style>

  <div class="bg-[#fafafa] p-4 md:p-8 rounded-xl border-t-4 border-[#4cbf8c] shadow-lg">
    ${htmlContent}
  </div>
</div>
<!-- ComunidadFeliz Widget End -->
    `.trim();

    navigator.clipboard.writeText(webflowCode).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 3000);
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-[#4e526e]">Vista Previa & Exportación</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {/* PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-white transition shadow-md ${isGeneratingPdf ? 'bg-gray-400 cursor-wait' : 'bg-[#4e526e] hover:bg-[#3d4157]'
              }`}
          >
            {isGeneratingPdf ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando PDF...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                  <path d="M4.5 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H5.25A.75.75 0 014.5 10z" />
                  <path fillRule="evenodd" d="M5.5 17a.75.75 0 01-.75-.75V16h10.5v.25a.75.75 0 01-.75.75H5.5z" clipRule="evenodd" />
                  <path d="M10 3a.75.75 0 01.75.75v7.69l1.72-1.72a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l1.72 1.72V3.75A.75.75 0 0110 3z" />
                </svg>
                Descargar PDF
              </>
            )}
          </button>

          {/* Orientation Control */}
          <div className="flex bg-gray-100 rounded-full p-1 mr-2">
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
                setIsGeneratingPdf(true);
                // Use VITE_API_URL or fallback to /api (for production proxy)
                const apiUrl = (import.meta as any).env.VITE_API_URL || '/api';
                const response = await fetch(`${apiUrl}/export`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    html_content: htmlContent,
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
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.965 3.129V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
                Exportar PDF (Py)
              </>
            )}
          </button>

          {/* Webflow Copy Button */}
          <button
            onClick={handleCopyForWebflow}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-white transition shadow-md ${copyStatus === 'copied' ? 'bg-[#4cbf8c]' : 'bg-[#005fc5] hover:bg-[#004bb5]'
              }`}
          >
            {copyStatus === 'copied' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                ¡Código Copiado!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5a.75.75 0 001.5 0v-2.5a.75.75 0 01.75-.75h2.5a.75.75 0 000-1.5h-2.5zM13.25 2a.75.75 0 000 1.5h2.5a.75.75 0 01.75.75v2.5a.75.75 0 001.5 0v-2.5A2.25 2.25 0 0015.75 2h-2.5zM2 13.25a.75.75 0 00-1.5 0v2.5A2.25 2.25 0 002.75 18h2.5a.75.75 0 000-1.5h-2.5a.75.75 0 01-.75-.75v-2.5zM13.25 18a.75.75 0 000 1.5h2.5A2.25 2.25 0 0018 15.75v-2.5a.75.75 0 00-1.5 0v2.5a.75.75 0 01-.75.75h-2.5z" clipRule="evenodd" />
                  <path d="M6 8a2 2 0 114 0 2 2 0 01-4 0zM6 12a2 2 0 114 0 2 2 0 01-4 0zM10 8a2 2 0 114 0 2 2 0 01-4 0zM10 12a2 2 0 114 0 2 2 0 01-4 0z" />
                </svg>
                Copiar HTML
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="bg-[#ff6b75] text-white px-4 py-2 rounded-full font-bold hover:bg-[#ff525e] transition shadow-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.061.025z" clipRule="evenodd" />
            </svg>
            Reiniciar
          </button>
        </div>
      </div>

      <div id="cf-preview-card" className="bg-white rounded-xl shadow-2xl overflow-hidden min-h-[600px] border border-gray-100 relative">
        {/* Document Branding Background Shapes (Inside the card so they export) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4cbf8c]/10 rounded-bl-full pointer-events-none"></div>
        <div className="absolute bottom-12 left-0 w-24 h-24 bg-[#ffc000]/10 rounded-tr-full pointer-events-none"></div>

        {/* Brand Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-50 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4cbf8c] rounded-md flex items-center justify-center text-white font-bold text-sm shadow-sm">CF</div>
            <span className="font-bold text-lg text-[#4e526e]">Comunidad<span className="text-[#4cbf8c]">Feliz</span></span>
          </div>
          {/* Optional decorative line or info */}
          <div className="h-1 w-16 bg-[#005fc5] rounded-full opacity-20"></div>
        </div>

        <div className="p-8 md:p-12 relative z-10">
          {/* Content */}
          <div
            className="prose prose-slate max-w-none 
                prose-headings:text-[#4e526e] 
                prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6
                prose-h2:text-2xl prose-h2:font-bold prose-h2:text-[#005fc5] prose-h2:mt-8
                prose-p:text-[#4e526e] prose-p:leading-relaxed
                prose-strong:text-[#4cbf8c]
                "
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* Footer Decorator with Offline Pattern */}
        <div className="w-full h-8 bg-[#eef3fe] mt-auto relative overflow-hidden flex items-center justify-end px-4">
          {/* The texture pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: CUBE_PATTERN,
            backgroundSize: '20px 20px'
          }}></div>
          {/* Small footer text */}
          <span className="relative z-10 text-[10px] text-[#4e526e] opacity-60 font-medium tracking-wider">GENERADO POR COMUNIDADFELIZ</span>
        </div>
      </div>
    </div>
  );
};

export default Preview;