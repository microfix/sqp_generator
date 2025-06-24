import { FolderStructureType } from "./types";
import { PDFDocument, StandardFonts, rgb, PDFPage } from "pdf-lib";

// Function to generate a unique ID
export const generateId = (): string => '_' + Math.random().toString(36).substr(2, 9);

// Edge-specific file processing function
export const processUploadedFilesForEdge = (files: File[]): FolderStructureType => {
  const folderStructure: FolderStructureType = { sections: [] };
  const pathMap = new Map<string, any>();
  
  console.log('Processing files for Edge:', files.length);
  
  files.forEach(file => {
    // @ts-ignore - webkitRelativePath exists but is not in TypeScript definitions
    const relativePath = file.webkitRelativePath || file.name;
    console.log(`Processing file: ${file.name}, relative path: ${relativePath}`);
    
    // Only accept PDF and JPEG files
    if (!file.type.match('application/pdf') && !file.type.match('image/jpeg')) {
      console.warn(`File ignored (not PDF/JPEG): ${file.name}`);
      return;
    }
    
    // Parse the path
    const pathParts = relativePath.split('/');
    console.log(`Path parts for ${file.name}:`, pathParts);
    
    if (pathParts.length === 1) {
      // File without folder structure - create default section
      const defaultSectionTitle = 'Uploadede filer';
      if (!pathMap.has(defaultSectionTitle)) {
        const sectionId = generateId();
        const section = {
          id: sectionId,
          title: defaultSectionTitle,
          files: [],
          subpoints: [],
          showInToc: true
        };
        folderStructure.sections.push(section);
        pathMap.set(defaultSectionTitle, section);
      }
      pathMap.get(defaultSectionTitle)!.files.push(file);
    } else if (pathParts.length >= 2) {
      // File with folder structure
      const topLevelFolder = pathParts[0];
      const secondLevelFolder = pathParts.length > 2 ? pathParts[1] : null;
      
      // Create main section if it doesn't exist
      if (!pathMap.has(topLevelFolder)) {
        const sectionId = generateId();
        const section = {
          id: sectionId,
          title: topLevelFolder,
          files: [],
          subpoints: [],
          showInToc: true
        };
        folderStructure.sections.push(section);
        pathMap.set(topLevelFolder, section);
      }
      
      const section = pathMap.get(topLevelFolder);
      
      // If there's a subfolder, create the subpoint
      if (secondLevelFolder && pathParts.length > 2) {
        const subpointKey = `${topLevelFolder}/${secondLevelFolder}`;
        
        if (!pathMap.has(subpointKey)) {
          const subpointId = generateId();
          const subpoint = {
            id: subpointId,
            title: secondLevelFolder,
            files: [],
            showInToc: true
          };
          section.subpoints.push(subpoint);
          pathMap.set(subpointKey, subpoint);
        }
        
        const subpoint = pathMap.get(subpointKey);
        subpoint.files.push(file);
      } else {
        // File directly in the main folder
        section.files.push(file);
      }
    }
  });
  
  console.log('Final folder structure:', folderStructure);
  return folderStructure;
};

// Function to process uploaded files into a structured format
export const processUploadedFiles = (files: File[]): FolderStructureType => {
  const folderStructure: FolderStructureType = { sections: [] };
  const pathMap = new Map();
  
  // Sort files by path to ensure consistent processing
  files.sort((a, b) => {
    // @ts-ignore - webkitRelativePath exists but is not in TypeScript definitions
    return a.webkitRelativePath.localeCompare(b.webkitRelativePath);
  });
  
  // Process each file
  files.forEach(file => {
    // @ts-ignore - webkitRelativePath exists but is not in TypeScript definitions
    const path = file.webkitRelativePath;
    const pathParts = path.split('/');
    
    // Only accept PDF and JPEG files
    if (!file.type.match('application/pdf') && !file.type.match('image/jpeg')) {
      console.warn(`File ignored (not PDF/JPEG): ${path}`);
      return;
    }
    
    // We only need maximum two levels (main point/subpoint)
    if (pathParts.length > 1) {
      const topLevelFolder = pathParts[0];
      const secondLevelFolder = pathParts.length > 2 ? pathParts[1] : null;
      
      // Create main point if it doesn't exist
      if (!pathMap.has(topLevelFolder)) {
        const sectionId = generateId();
        const section = {
          id: sectionId,
          title: topLevelFolder,
          files: [],
          subpoints: [],
          showInToc: true
        };
        folderStructure.sections.push(section);
        pathMap.set(topLevelFolder, section);
      }
      
      const section = pathMap.get(topLevelFolder);
      
      // If there's a subfolder, create the subpoint
      if (secondLevelFolder && pathParts.length > 2) {
        const subpointKey = `${topLevelFolder}/${secondLevelFolder}`;
        
        if (!pathMap.has(subpointKey)) {
          const subpointId = generateId();
          const subpoint = {
            id: subpointId,
            title: secondLevelFolder,
            files: [],
            showInToc: true
          };
          section.subpoints.push(subpoint);
          pathMap.set(subpointKey, subpoint);
        }
        
        // Add the file to the subpoint
        if (pathParts.length > 2) {
          pathMap.get(subpointKey).files.push(file);
        }
      } 
      // If the file is directly in the main folder (no subfolder)
      else if (pathParts.length == 2) {
        section.files.push(file);
      }
    }
  });
  
  // Sort sections and subsections alphabetically
  folderStructure.sections.sort((a, b) => a.title.localeCompare(b.title));
  folderStructure.sections.forEach(section => {
    section.subpoints.sort((a, b) => a.title.localeCompare(b.title));
  });
  
  return folderStructure;
};

// Function to read a file as an ArrayBuffer
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Function to convert JPEG to PDF page
const convertJpegToPdfPage = async (jpegFile: File, pdfDoc: PDFDocument): Promise<PDFPage> => {
  const imageBytes = await readFileAsArrayBuffer(jpegFile);
  const image = await pdfDoc.embedJpg(new Uint8Array(imageBytes));
  const imageDims = image.scale(1);
  
  // Create a page with the same dimensions as the image
  const page = pdfDoc.addPage([imageDims.width, imageDims.height]);
  
  // Draw the image to fill the page
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: imageDims.width,
    height: imageDims.height,
  });
  
  return page;
};

// Main function to generate the combined PDF
export const generatePDF = async (
  coverFile: File | null,
  folderStructure: FolderStructureType,
  outputName: string,
  documentNumberLeft: string = "",
  documentNumberCenter: string = ""
): Promise<void> => {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed the standard font for TOC
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Track page numbers for TOC creation
    let currentPage = 0;
    const tocEntries: { title: string, page: number, level: number, showPage: boolean }[] = [];
    
    // Add cover page if available and fill form fields
    if (coverFile) {
      const coverBytes = await readFileAsArrayBuffer(coverFile);
      const coverPdf = await PDFDocument.load(new Uint8Array(coverBytes));
      
      // Try to fill form fields in the cover page
      try {
        const form = coverPdf.getForm();
        
        // Get current date in format YYYY.MM.DD
        const currentDate = new Date();
        const day = currentDate.getDate().toString().padStart(2, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear();
        const dateString = `${year}.${month}.${day}`;
        
        // Get unit name (PDF name without " SQP")
        const unitName = outputName.replace(/ SQP$/, '');
        
        // Fill the form fields
        const fields = form.getFields();
        console.log('Found form fields:', fields.map(f => f.getName()));
        console.log('Looking for fields: unitname, date');
        console.log('Will fill unitname with:', unitName);
        console.log('Will fill date with:', dateString);
        
        fields.forEach(field => {
          const fieldName = field.getName();
          console.log(`Processing field: ${fieldName}`);
          if (fieldName === 'unitname') {
            const textField = form.getTextField('unitname');
            textField.setText(unitName);
            textField.setAlignment(1); // 0 = left, 1 = center, 2 = right
            console.log(`✓ Filled and centered unitname field with: ${unitName}`);
          } else if (fieldName === 'date') {
            const textField = form.getTextField('date');
            textField.setText(dateString);
            textField.setAlignment(1); // Center align
            console.log(`✓ Filled and centered date field with: ${dateString}`);
          }
        });
        
        // Flatten the form to make fields non-editable
        form.flatten();
        
      } catch (error) {
        console.log('No form fields found in cover page or error filling them:', error);
        // Continue without form filling if there are no fields or an error occurs
      }
      
      const coverPages = await pdfDoc.copyPages(coverPdf, coverPdf.getPageIndices());
      coverPages.forEach(page => pdfDoc.addPage(page));
      currentPage += coverPages.length;
    }
    
    // Create TOC placeholder (we'll fill this later)
    let tocPage = pdfDoc.addPage();
    const tocStartPage = currentPage;
    currentPage++;
    
    // Process each section and its files/subpoints
    for (const section of folderStructure.sections) {
      const sectionStartPage = currentPage;
      tocEntries.push({ 
        title: section.title, 
        page: sectionStartPage, 
        level: 0, 
        showPage: section.showInToc 
      });
      
      // Add files directly in the section
      for (const file of section.files) {
        if (file.type === 'application/pdf') {
          const fileBytes = await readFileAsArrayBuffer(file);
          const pdf = await PDFDocument.load(new Uint8Array(fileBytes));
          const pages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
          pages.forEach(page => pdfDoc.addPage(page));
          currentPage += pages.length;
        } else if (file.type === 'image/jpeg') {
          await convertJpegToPdfPage(file, pdfDoc);
          currentPage++;
        }
      }
      
      // Process subpoints
      for (const subpoint of section.subpoints) {
        const subpointStartPage = currentPage;
        tocEntries.push({ 
          title: subpoint.title, 
          page: subpointStartPage, 
          level: 1, 
          showPage: subpoint.showInToc 
        });
        
        // Add files in the subpoint
        for (const file of subpoint.files) {
          if (file.type === 'application/pdf') {
            const fileBytes = await readFileAsArrayBuffer(file);
            const pdf = await PDFDocument.load(new Uint8Array(fileBytes));
            const pages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => pdfDoc.addPage(page));
            currentPage += pages.length;
          } else if (file.type === 'image/jpeg') {
            await convertJpegToPdfPage(file, pdfDoc);
            currentPage++;
          }
        }
      }
    }
    
    // Calculate total number of pages
    const totalPages = pdfDoc.getPageCount();
    
    // Fill in the TOC page
    const { width, height } = tocPage.getSize();
    tocPage.drawText('Indholdsfortegnelse', {
      x: 50,
      y: height - 50,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    // Draw TOC entries
    let yPosition = height - 80;
    for (const entry of tocEntries) {
      if (yPosition < 50) {
        // Add a new TOC page if we've run out of space
        tocPage = pdfDoc.addPage();
        yPosition = height - 50;
        currentPage++;
      }
      
      const indent = entry.level * 20;
      const entryText = entry.showPage 
        ? `${entry.title}${'.'.repeat(Math.max(0, 50 - entry.title.length - indent))}${entry.page + 1}`
        : entry.title;
      
      tocPage.drawText(entryText, {
        x: 50 + indent,
        y: yPosition,
        size: 12,
        font: entry.level === 0 ? boldFont : font,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 20;
    }
    
    // Add page numbers to all pages and document numbers in header
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      
      // Format: "Page X of Y" at bottom left
      const pageText = `Page ${i + 1} of ${totalPages}`;
      
      page.drawText(pageText, {
        x: 50, // Left margin
        y: 30, // Bottom margin
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      // Add document number in left header if provided
      if (documentNumberLeft) {
        page.drawText(documentNumberLeft, {
          x: 50, // Left margin
          y: height - 15, // Moved higher up (was -30)
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
      }
      
      // Add document number in right header if provided
      if (documentNumberCenter) {
        const textWidth = font.widthOfTextAtSize(documentNumberCenter, 10);
        page.drawText(documentNumberCenter, {
          x: width - textWidth - 50, // Right aligned with margin
          y: height - 15, // Moved higher up (was -30)
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
      }
    }
    
    // Create PDF bytes and trigger download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger it
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${outputName}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
