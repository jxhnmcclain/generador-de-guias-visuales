from fastapi import FastAPI, HTTPException, Response, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from playwright.async_api import async_playwright
import uvicorn
import base64
import os

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Load logo as base64 for PDF embedding
LOGO_BASE64 = ""
LOGO_PATH = os.path.join(os.path.dirname(__file__), "logo-full.jpg")
if os.path.exists(LOGO_PATH):
    with open(LOGO_PATH, "rb") as f:
        LOGO_BASE64 = base64.b64encode(f.read()).decode('utf-8')
    print(f"INFO: Logo loaded successfully ({len(LOGO_BASE64)} bytes)")
else:
    print(f"WARNING: Logo file not found at {LOGO_PATH}")

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Allow CORS so the React app can call it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, verify specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExportRequest(BaseModel):
    html_content: str
    orientation: str = "portrait" # "portrait" or "landscape"

@app.get("/")
async def root():
    return {"status": "ok", "message": "ComunidadFeliz PDF Export Backend is running"}

@app.post("/export")
@limiter.limit("5/minute")
async def export_pdf(export_data: ExportRequest, request: Request):
    try:
        # Determine dimensions based on orientation
        is_landscape = export_data.orientation == "landscape"
        width = 1123 if is_landscape else 794
        height = 794 if is_landscape else 1123
        
        # We wrap the content in the full HTML structure
        # ensuring the same styles (Tailwind CDN) and fonts are present.
        full_html = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Guía Generada - ComunidadFeliz</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script>
      tailwind.config = {{
        theme: {{
          extend: {{
            fontFamily: {{
              sans: ['Montserrat', 'sans-serif'],
            }},
            colors: {{
              cf: {{
                green: '#4cbf8c',
                blue: '#005fc5',
                celeste: '#eef3fe',
                yellow: '#ffc000',
                red: '#ff6b75',
                gray: '#4e526e',
              }}
            }}
          }}
        }}
      }}
    </script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      body {{ 
        font-family: 'Montserrat', sans-serif; 
        color: #4e526e; 
        background-color: #ffffff !important; 
        margin: 0;
        padding: 0;
      }}
      
      /* Intelligent Page Breaks */
      section, .grid > div, .space-y-6 > div, .card, .bg-white, .rounded-xl, .rounded-2xl {{
        break-inside: avoid-page;
        page-break-inside: avoid;
      }}
      
      h1, h2, h3, h4 {{
        break-after: avoid-page;
        page-break-after: avoid;
      }}

      img, ul, ol, table {{
        break-inside: avoid-page;
        page-break-inside: avoid;
      }}

      p, li {{
        orphans: 4;
        widows: 4;
      }}

      @page {{
        size: A4;
        margin-top: 35mm;
        margin-bottom: 25mm;
        margin-left: 15mm;
        margin-right: 15mm;
      }}

      /* Full-width content container */
      .pdf-content {{
        width: 100%;
        background-color: #ffffff !important;
      }}
    </style>
</head>
<body class="bg-white">
    <div class="pdf-content">
        {export_data.html_content}
    </div>
</body>
</html>
"""
        # Header template for every page
        header_html = f"""
        <div style="width: 100%; font-size: 10px; padding: 10px 40px; display: flex; justify-content: space-between; align-items: center; font-family: 'Montserrat', sans-serif; border-bottom: 1px solid #f0f0f0;">
            <div style="display: flex; align-items: center;">
                {f'<img src="data:image/jpeg;base64,{LOGO_BASE64}" style="height: 25px; width: auto;" />' if LOGO_BASE64 else '<span style="font-weight: bold; color: #4e526e;">Comunidad<span style="color: #4cbf8c;">Feliz</span></span>'}
            </div>
            <div style="height: 3px; width: 40px; background-color: #005fc5; opacity: 0.2; border-radius: 10px;"></div>
        </div>
        """

        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            await page.emulate_media(media="print")
            await page.set_viewport_size({"width": width, "height": height})
            await page.set_content(full_html, wait_until="networkidle") 
            
            pdf_data = await page.pdf(
                format="A4",
                landscape=is_landscape,
                print_background=True, 
                # Increase top margin to accommodate the headerTemplate
                margin={"top": "40mm", "bottom": "20mm", "left": "15mm", "right": "15mm"},
                scale=1.0,
                display_header_footer=True,
                header_template=header_html,
                footer_template='<div style="width: 100%; font-size: 8px; text-align: right; padding: 0 40px; color: #aaa; font-family: sans-serif;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
                prefer_css_page_size=True
            )
            await browser.close()

        return Response(content=pdf_data, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=guia-comunidadfeliz.pdf"})
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error generating PDF: {{e}}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
