import * as pdfjsLib from 'pdfjs-dist';

// Ensure the PDF.js worker is loaded
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

/**
 * Converts a PDF file to an array of base64-encoded JPEG images
 * @param file PDF file to convert
 * @returns Array of base64-encoded strings (without the data:image/jpeg;base64, prefix)
 */
export async function pdfToImages(file: File): Promise<string[]> {
  try {
    console.log('Starting PDF to image conversion');
    const images: string[] = [];
    
    // Read the PDF file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log(`PDF loaded with ${pdf.numPages} pages`);
    
    // Process each page
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        console.log(`Processing page ${i} of ${pdf.numPages}`);
        const page = await pdf.getPage(i);
        
        // Set a higher scale for better OCR results
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        
        // Create a canvas element to render the page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Failed to get canvas context');
        }
        
        // Set canvas dimensions to match the page
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render the PDF page to the canvas
        await page.render({
          canvasContext: context,
          viewport
        }).promise;
        
        // Convert canvas to JPEG base64
        try {
          // Quality of 0.8 gives good results while keeping file size reasonable
          const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(';base64,')[1];
          images.push(base64Image);
        } catch (conversionError) {
          console.error('Error converting page to image:', conversionError);
          throw new Error(`Failed to convert page ${i} to image: ${conversionError.message}`);
        }
      } catch (pageError) {
        console.error(`Error processing page ${i}:`, pageError);
        // Continue with next page instead of failing completely
        continue;
      }
    }
    
    if (images.length === 0) {
      throw new Error('No pages could be processed from the PDF');
    }
    
    console.log(`Successfully converted ${images.length} pages to images`);
    return images;
  } catch (error) {
    console.error('PDF to images conversion failed:', error);
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}