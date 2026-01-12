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
      body {{ font-family: 'Montserrat', sans-serif; color: #4e526e; background-color: #ffffff; }}
      
      /* Intelligent Page Breaks */
      
      /* Avoid breaking inside card-like elements and tables */
      .rounded-xl, .rounded-2xl, .shadow-md, .shadow-lg, .shadow-sm, table, tr, img, figure, .bg-white, .bg-\\[\\#eef3fe\\] {{
        page-break-inside: avoid;
        break-inside: avoid;
      }}
      
      /* Headers should not be separated from the text that follows */
      h1, h2, h3, h4, h5, h6 {{
        page-break-after: avoid;
        break-after: avoid;
      }}

      /* Improve readability across pages */
      p, li {{
        orphans: 3;
        widows: 3;
      }}
    </style>
</head>
<body class="bg-white">
    <!-- Brand Header -->
    <div class="w-full bg-white border-b border-gray-100 flex justify-between items-center p-8">
        <div class="flex items-center">
            {f'<img src="data:image/jpeg;base64,{{LOGO_BASE64}}" class="h-10 w-auto" />' if LOGO_BASE64 else f'<span class="font-bold text-lg text-[#4e526e]">Comunidad<span class="text-[#4cbf8c]">Feliz</span></span>'}
        </div>
        <div class="h-1 w-16 bg-[#005fc5] rounded-full opacity-20"></div>
    </div>

    <!-- Center container similar to the preview card -->
    <div class="w-full max-w-[{width}px] mx-auto p-8">
        {export_data.html_content}
    </div>
</body>
</html>
"""
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            
            # Simulate A4 dimensions based on orientation
            # This ensures Tailwind responsive classes (md:, lg:) behave as they would on the paper
            await page.set_viewport_size({"width": width, "height": height})
            
            # Wait for networkidle to ensure Tailwind CDN loads
            await page.set_content(full_html, wait_until="networkidle") 
            
            pdf_data = await page.pdf(
                format="A4",
                landscape=is_landscape,
                print_background=True, 
                margin={"top": "20px", "bottom": "20px", "left": "20px", "right": "20px"},
                scale=0.9  # Slight scale down to ensure margins don't clip content
            )
            await browser.close()

        return Response(content=pdf_data, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=guia-comunidadfeliz.pdf"})
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
