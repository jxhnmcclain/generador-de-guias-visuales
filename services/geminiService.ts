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

export const generateGuideFromPrompt = async (userPrompt: string, context: string): Promise<string> => {
  const modelId = 'gemini-flash-latest';

  const prompt = `
    You are an expert UI/UX Designer and Content Strategist at ComunidadFeliz.
    
    TASK: Generate a VISUAL FLYER/BROCHURE based on the user's request, using the provided ComunidadFeliz context.
    
    CRITICAL: Maintain HIGH DETAIL for the provided product information. Do NOT summarize aggressively. Your task is to present the features, benefits, and specific descriptions of the selected products in a comprehensive way. While you may synthesize and reorganize the text to create a cohesive layout within the 3-page limit, you must ensure that no key information or specific value propositions are lost.
    
    COMUNIDADFELIZ CONTEXT (DETAILED):
    ${context}
    
    USER REQUEST:
    "${userPrompt}"
    
    CONSTRAINTS & FORMATTING:
    1. FORMAT: Create a "Visual Flyer" or "Brochure" layout using modular sections.
    2. MODULAR DESIGN (CRITICAL FOR PDF): DO NOT wrap the entire content in one giant <div> or any colored background container. The document must have a WHITE BACKGROUND by default. Use multiple <section> or <div> blocks. Each main topic or product should be its own block. This allows the PDF generator to insert page breaks correctly.
    3. NO WRAPPERS: Do not add an outer div with "bg-gray-50", "shadow" or "rounded-xl" to the whole output. Only apply those styles to specific feature cards within the sections.
    4. LENGTH LIMIT: The content must fit within a MAXIMUM OF 3 A4 PAGES. Be VERY SPECIFIC and DETAILED.
    4. NO WALLS OF TEXT: Use grid layouts, cards, and icons, but maintain the density of information.
    5. LANGUAGE: Always respond in Spanish.
    6. STYLE & CONTRAST (CRITICAL): 
       - If you use a dark background (like Blue #005fc5), you MUST use WHITE TEXT for ALL elements inside.
       - Use the class "!text-white" on headings (h1, h2, h3) and paragraphs (p) to ensure high contrast.
       - NEVER use gray or dark text on dark backgrounds.
       - Use Green (#4cbf8c) for success/primary actions.
       - Use Blue (#005fc5) for main headers or hero backgrounds.
       - Typography: Montserrat.
    
    REQUIRED HTML PATTERNS (Tailwind CSS):
    - Hero Section: <div class="bg-[#005fc5] text-white p-8 rounded-2xl mb-8"> <h1 class="!text-white text-3xl font-bold mb-2">Titulo</h1> <p class="!text-white opacity-90">Subtitulo</p> </div>
    - Use <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> for features.
    - Use <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#4cbf8c]"> for highlights.
    - Use icons (as SVG or emojis if needed, but styled nicely).
    
    OUTPUT:
    - Return ONLY the raw HTML string for the content area.
    - Do NOT wrap in \`\`\`html code blocks.
    - Do NOT include <html>, <head>, or <body> tags.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.text || '';
    return text.replace(/```html/g, '').replace(/```/g, '').trim();
  } catch (error) {
    console.error("Gemini Chat API Error:", error);
    throw new Error("Failed to generate content from chat prompt.");
  }
};