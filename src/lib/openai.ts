import OpenAI from 'openai';

// Format script using OpenAI
export const formatScriptWithAI = async (text: string): Promise<string> => {
  if (!text || !text.trim()) {
    throw new Error('Script is empty');
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: `You are a professional script formatter. Format the provided text into a proper screenplay format following these rules:

1. Scene headings:
   - ALL CAPS
   - Start with INT./EXT.
   - Include location and time
   - Example: INT. COFFEE SHOP - DAY

2. Character names:
   - ALL CAPS
   - Centered
   - Stand alone on their own line
   - End with colon
   - Example: JOHN:

3. Dialog:
   - Below character name
   - Indented
   - Regular case

4. Parentheticals:
   - In (parentheses)
   - Below character name, above dialog
   - Example: (angry)

5. Action/Description:
   - Regular case
   - Full width
   - Descriptive present tense

CRITICAL REQUIREMENTS:
- Keep all existing character names and dialog
- Maintain story flow and meaning
- Use proper line spacing between elements
- Format consistently throughout
- Return ONLY the formatted script
- DO NOT add any explanatory text
- DO NOT change the actual content/story`
      }, {
        role: "user",
        content: text
      }],
      temperature: 0.3,
      max_tokens: 4000
    });

    const formattedScript = response.choices[0].message.content;
    if (!formattedScript) {
      throw new Error('Failed to format script');
    }

    return formattedScript;
  } catch (error) {
    console.error('Script formatting failed:', error);
    throw error;
  }
};

const validateApiKey = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OpenAI API key is missing. Using fallback formatting.');
    return '';
  }
  
  return apiKey;
};

const openai = new OpenAI({
  apiKey: validateApiKey(),
  dangerouslyAllowBrowser: true
});

interface CharacterAnalysis {
  name: string;
  description: string;
  traits: string[];
  relationships: { [key: string]: string };
  lineCount: number;
  mainCharacter: boolean;
}

// Function to extract text from image using Vision API
export const extractTextFromImage = async (imageBase64: string): Promise<string> => {
  try {
    const apiKey = validateApiKey();
    // Validate API key and model access
    if (!apiKey) {
      throw new Error('OpenAI API key is missing');
    }

    // Validate image data
    if (!imageBase64 || imageBase64.length < 100) {
      throw new Error('Invalid image data');
    }
    
    // Create the message content array
    const content = [
      { 
        type: "text", 
        text: "Extract and format the text from this script image. Preserve all formatting, including:\n- Scene headings (INT./EXT.)\n- Character names in ALL CAPS with colons\n- Dialog and action descriptions\n- Parentheticals and transitions\nMaintain original line breaks and spacing."
      },
      {
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`,
          detail: "high"
        }
      }
    ];

    // Make the API call - Updated to use the current vision model
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract and format the text from this script image. Preserve all formatting, including:\n- Scene headings (INT./EXT.)\n- Character names in ALL CAPS with colons\n- Dialog and action descriptions\n- Parentheticals and transitions\nMaintain original line breaks and spacing."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "high"
              }
            }
          ]
        },
        {
          role: "system",
          content: "You are a professional script formatter. Extract text exactly as it appears, maintaining proper screenplay format."
        }
      ]
    });

    // Validate response
    if (!response.choices?.[0]?.message?.content) {
      throw new Error('No text extracted from image');
    }

    // Extract and return the response text
    const extractedText = response.choices[0].message.content || '';
    
    // Clean up the extracted text
    const cleanedText = extractedText
      .replace(/[\u0000-\u001F\u007F-\u009F\uFFFD\uFFFE\uFFFF]/g, ' ') // Remove control chars
      .replace(/\uD83D[\uDC00-\uDFFF]|\uD83C[\uDC00-\uDFFF]|\uFFFD/g, ' ') // Remove emojis
      .replace(/([A-Z][A-Z\s]+)(?:\s+)([A-Z][A-Z\s]+):/g, '$1 $2:') // Fix split character names
      .replace(/\s*\(CONT'D\)\s*/gi, '') // Remove CONT'D markers
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    return cleanedText;
  } catch (error) {
    console.error('OpenAI Vision API error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.warn('Vision API not available, using basic OCR fallback');
      // Fall back to basic text extraction
      return extractTextFromPDF(imageBase64);
    }
    
    if (error.response?.status === 401) {
      return 'API authentication failed. Please check your OpenAI API key configuration.';
    }
    
    if (error.response?.status === 429) {
      return 'API rate limit reached. Please wait a few minutes and try again.';
    }
    
    return extractTextFromPDF(imageBase64);
  }
};

// Analyze script for characters and relationships
export const analyzeScript = async (script: string): Promise<CharacterAnalysis[]> => {
  if (!script || !script.trim()) {
    return [];
  }
  
  try {
    // Quick character detection
    const lines = script.split('\n');
    const characters = new Map<string, CharacterAnalysis>();
    let currentCharacter = '';
    let totalLines = 0;
    
    // First pass - detect characters and count lines
    for (const line of lines) {
      const match = line.match(/^([A-Z][A-Z\s\-'.]*?):\s*(.+)?$/);
      if (match) {
        const name = match[1].trim();
        currentCharacter = name;
        
        if (!characters.has(name)) {
          characters.set(name, {
            name,
            description: '',
            traits: [],
            relationships: {},
            lineCount: 0,
            mainCharacter: false
          });
        }
        
        const char = characters.get(name)!;
        char.lineCount++;
        totalLines++;
      }
    }
    
    // Second pass - determine main characters and basic relationships
    const charArray = Array.from(characters.values());
    const avgLines = totalLines / charArray.length;
    
    charArray.forEach(char => {
      // Mark as main character if they have more than average lines
      char.mainCharacter = char.lineCount > avgLines;
      
      // Add basic traits based on line count
      if (char.lineCount > avgLines * 1.5) {
        char.traits = ['Prominent speaker', 'Major role'];
      } else if (char.lineCount > avgLines) {
        char.traits = ['Regular speaker', 'Supporting role'];
      } else {
        char.traits = ['Minor role'];
      }
      
      // Add basic description
      char.description = `Character with ${char.lineCount} lines of dialogue. ${
        char.mainCharacter ? 'Appears to be a main character.' : 'Supporting character.'
      }`;
    });

    return charArray;

  } catch (error) {
    console.error('Script analysis error:', error);
    return [];
  }
};

// Basic text extraction fallback
const extractTextFromPDF = async (imageBase64: string): Promise<string> => {
  try {
    // Use simpler GPT-3.5 model for basic text extraction
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "Extract text from the image, preserving script formatting."
      }, {
        role: "user",
        content: "Please extract and format the text from this script image, maintaining all original formatting and structure."
      }],
      temperature: 0.3,
      max_tokens: 4000
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Text extraction fallback failed:', error);
    return 'Unable to extract text. Please try uploading text directly.';
  }
};