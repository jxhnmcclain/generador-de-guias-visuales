import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateSiteFromPdf = async (base64Pdf: string): Promise<string> => {
  const modelId = 'gemini-flash-latest'; // Supports multimodal PDF input

  const prompt = `
    You are an expert UI/UX Designer and Frontend Developer.
    
    Your task: Convert the PDF content into a HIGHLY VISUAL, DETAILED, and COMPREHENSIVE HTML guide.
    
    CRITICAL INSTRUCTIONS:
    1. DO NOT SUMMARIZE AGGRESSIVELY. The user wants to see ALL the information, events, and details found in the document.
    2. EXTRACT EVERYTHING: If there is a list of events, rules, or steps, include ALL of them. Do not skip items.
    3. USE VISUAL STRUCTURES to organize the density:
       - Use "Detailed Cards" for concepts (include bullet points inside cards).
       - Use "Timeline/Step Lists" for events or processes. This is vital.
       - Use "Highlights" for important data.
    4. NO WALLS OF TEXT. Break detail down into readable paragraphs or lists.
    
    BRAND GUIDELINES (ComunidadFeliz):
    - Colors:
      - Green (#4cbf8c): Primary actions, success states, icon backgrounds.
      - Blue (#005fc5): Headings, secondary highlights.
      - Yellow (#ffc000) & Red (#ff6b75): Accent badges or alerts.
      - Text (#4e526e): Dark gray for legibility.
      - Background (#eef3fe): Use for section backgrounds to create contrast with white cards.
    - shapes: Rounded corners (rounded-xl or rounded-2xl).
    
    REQUIRED LAYOUT PATTERNS:
    
    <!-- Pattern: Hero Section (Detailed) -->
    <div class="bg-[#eef3fe] rounded-2xl p-8 mb-8">
       <h1 class="text-3xl font-bold text-[#005fc5] mb-4">Document Title</h1>
       <p class="text-lg text-[#4e526e] leading-relaxed">Full introduction or context provided in the document.</p>
    </div>
    
    <!-- Pattern: Detailed Grid (For Categories/Rules) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
       <div class="bg-white p-6 rounded-xl shadow-sm border-t-4 border-[#4cbf8c]">
           <!-- Insert SVG Icon Here -->
           <h3 class="font-bold text-[#4e526e] text-xl mb-3">Section Title</h3>
           <p class="text-gray-600 mb-3">Explanation of this section.</p>
           <!-- Use lists for sub-details -->
           <ul class="list-disc list-inside text-sm text-gray-500 space-y-2">
             <li>Detail point A</li>
             <li>Detail point B</li>
             <li>Detail point C</li>
           </ul>
       </div>
       <!-- Repeat for ALL sections found -->
    </div>
    
    <!-- Pattern: Comprehensive Timeline / Events List (CRITICAL) -->
    <!-- Use this for every single step, date, or event in the PDF -->
    <div class="space-y-6 mb-12">
       <h2 class="text-2xl font-bold text-[#005fc5] mb-6">Detailed Process / Events</h2>
       
       <!-- Repeat this block for EVERY item. Do not summarize 10 steps into 3. Keep all 10. -->
       <div class="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="bg-[#005fc5] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 mt-1 text-sm">1</div>
          <div class="flex-1">
             <h4 class="font-bold text-[#4e526e] text-lg">Event or Step Name</h4>
             <p class="text-gray-600 mt-2 leading-relaxed">Detailed description of what happens here. Include dates, times, or specific requirements mentioned.</p>
             <div class="mt-3 flex gap-2">
                <!-- Optional Badges for specific data -->
                <span class="bg-[#eef3fe] text-[#005fc5] text-xs font-bold px-3 py-1 rounded-full">Date/Info</span>
             </div>
          </div>
       </div>
    </div>

    OUTPUT FORMAT:
    - Return ONLY the raw HTML string representing the content area. 
    - Do NOT wrap in \`\`\`html code blocks. 
    - Do NOT include <html>, <head>, or <body> tags.
    - Ensure responsive design.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Pdf,
              },
            },
          ],
        },
      ],
    });

    const text = response.text || '';
    // Cleanup code blocks if Gemini adds them despite instructions
    return text.replace(/```html/g, '').replace(/```/g, '').trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content from PDF.");
  }
};