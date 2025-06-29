import { FolderStructureType } from "./types";
import { PDFDocument, StandardFonts, rgb, PDFPage } from "pdf-lib";

// Function to generate a unique ID
export const generateId = (): string => '_' + Math.random().toString(36).substr(2, 9);

// Edge-specific file processing function
export const processUploadedFilesForEdge = (files: File[]): FolderStructureType => {
  const folderStructure: FolderStructureType = { sections: [] };
  const pathMap = new Map<string, any>();
  
  console.log('Processing files for Edge:', files.length);
  
  // Sort files by path to ensure consistent processing order
  files.sort((a, b) => {
    const pathA = (a as any).path || a.name;
    const pathB = (b as any).path || b.name;
    return pathA.localeCompare(pathB, undefined, { 
      numeric: true, 
      sensitivity: 'base' 
    });
  });
  
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
      // File with nested folder structure - handle unlimited levels
      const fileName = pathParts[pathParts.length - 1];
      const folderPath = pathParts.slice(0, -1); // Remove filename
      
      let currentContainer = folderStructure.sections;
      let currentPath = '';
      
      // Navigate/create the nested structure
      for (let i = 0; i < folderPath.length; i++) {
        const folderName = folderPath[i];
        currentPath += (currentPath ? '/' : '') + folderName;
        
        // Find existing container at this level
        let foundContainer = currentContainer.find(item => item.title === folderName);
        
        if (!foundContainer) {
          // Create new container
          const containerId = generateId();
          const newContainer = {
            id: containerId,
            title: folderName,
            files: [],
            subpoints: [],
            showInToc: true,
            level: i
          };
          
          currentContainer.push(newContainer);
          foundContainer = newContainer;
          pathMap.set(currentPath, foundContainer);
        }
        
        // Move to subpoints for next level (except for top-level sections)
        if (i < folderPath.length - 1) {
          currentContainer = foundContainer.subpoints;
        } else {
          // This is the final container for the file
          foundContainer.files.push(file);
        }
      }
    }
  });
  
  // Sort all sections and subpoints numerically after creation
  const sortSections = (sections: any[]) => {
    sections.sort((a, b) => {
      return a.title.localeCompare(b.title, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      });
    });
    
    // Recursively sort subpoints
    sections.forEach(section => {
      if (section.subpoints && section.subpoints.length > 0) {
        sortSections(section.subpoints);
      }
    });
  };
  
  sortSections(folderStructure.sections);
  
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
  documentNumberCenter: string = "",
  smartTextPlacement: boolean = false
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
    
    // Step 1: Add standard cover page from server
    try {
      const standardCoverResponse = await fetch('/standard_forside.pdf');
      if (standardCoverResponse.ok) {
        const standardCoverArrayBuffer = await standardCoverResponse.arrayBuffer();
        const standardCoverPdf = await PDFDocument.load(standardCoverArrayBuffer);
        
        // Fill form fields in standard cover if they exist
        const form = standardCoverPdf.getForm();
        const fields = form.getFields();
        
        if (fields.length > 0) {
          console.log('Found form fields:', fields.map(f => f.getName()));
          console.log('Looking for fields: unitname, date');
          
          // Use the PDF name without "SQP" suffix for unitname
          const unitName = outputName.replace(/ SQP$/, '');
          console.log('Will fill unitname with:', unitName);
          
          const currentDate = new Date();
          const dateString = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${String(currentDate.getDate()).padStart(2, '0')}`;
          console.log('Will fill date with:', dateString);
          
          fields.forEach(field => {
            const fieldName = field.getName();
            console.log(`Processing field: ${fieldName}`);
            if (fieldName === 'unitname') {
              const textField = form.getTextField('unitname');
              textField.setText(unitName);
              textField.setAlignment(1); // Center align
              console.log(`✓ Filled and centered unitname field with: ${unitName}`);
            } else if (fieldName === 'date') {
              const textField = form.getTextField('date');
              textField.setText(dateString);
              textField.setAlignment(1); // Center align
              console.log(`✓ Filled and centered date field with: ${dateString}`);
            }
          });
          
          form.flatten();
        }
        
        // Copy all pages from standard cover PDF
        const standardCoverPages = await pdfDoc.copyPages(standardCoverPdf, standardCoverPdf.getPageIndices());
        standardCoverPages.forEach((page) => pdfDoc.addPage(page));
        currentPage += standardCoverPages.length;
        
        console.log(`Added ${standardCoverPages.length} standard cover page(s)`);
      } else {
        console.log('No standard cover found, skipping');
      }
    } catch (error) {
      console.log('Could not load standard cover:', error);
    }

    // Step 2: Add extra page if provided (between cover and TOC)
    if (coverFile) {
      const extraBytes = await readFileAsArrayBuffer(coverFile);
      const extraPdf = await PDFDocument.load(new Uint8Array(extraBytes));
      
      const extraPages = await pdfDoc.copyPages(extraPdf, extraPdf.getPageIndices());
      extraPages.forEach(page => pdfDoc.addPage(page));
      currentPage += extraPages.length;
      
      console.log(`Added ${extraPages.length} extra page(s)`);
    }
    
    // Create TOC placeholder (we'll fill this later)
    let tocPage = pdfDoc.addPage();
    const tocStartPage = currentPage;
    currentPage++;
    
    // Recursive function to process nested structure
    const processNestedSection = async (section: any, level: number = 0) => {
      const sectionStartPage = currentPage;
      tocEntries.push({ 
        title: section.title, 
        page: sectionStartPage, 
        level: level, 
        showPage: section.showInToc 
      });
      
      // First: Add files in this section (files in current folder come first)
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
      
      // Process subpoints in their current order (respects drag-and-drop reorganization)
      // No additional sorting here - use the order from folderStructure
      for (const subpoint of section.subpoints) {
        await processNestedSection(subpoint, level + 1);
      }
    };

    // Process all top-level sections in their current order (respects drag-and-drop)
    for (const section of folderStructure.sections) {
      await processNestedSection(section, 0);
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
    
    // Draw TOC entries with improved formatting
    let yPosition = height - 80;
    for (const entry of tocEntries) {
      if (yPosition < 50) {
        // Add a new TOC page if we've run out of space
        tocPage = pdfDoc.addPage();
        yPosition = height - 50;
        currentPage++;
      }
      
      const indent = entry.level * 15; // Reduced indent for cleaner look
      const leftMargin = 50 + indent;
      
      if (entry.showPage) {
        // Calculate available space for dots
        const pageNumberText = `${entry.page + 1}`;
        const pageNumberWidth = font.widthOfTextAtSize(pageNumberText, 12);
        const titleWidth = (entry.level === 0 ? boldFont : font).widthOfTextAtSize(entry.title, 12);
        const availableSpace = width - leftMargin - titleWidth - pageNumberWidth - 100; // 100 for margins
        const dotCount = Math.max(0, Math.floor(availableSpace / 3)); // Each dot is ~3 units wide
        
        // Draw title
        tocPage.drawText(entry.title, {
          x: leftMargin,
          y: yPosition,
          size: 12,
          font: entry.level === 0 ? boldFont : font,
          color: rgb(0, 0, 0),
        });
        
        // Draw dots
        if (dotCount > 0) {
          const dotsText = '.'.repeat(dotCount);
          tocPage.drawText(dotsText, {
            x: leftMargin + titleWidth + 5,
            y: yPosition,
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
          });
        }
        
        // Draw page number (right aligned)
        tocPage.drawText(pageNumberText, {
          x: width - pageNumberWidth - 50,
          y: yPosition,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      } else {
        // Just draw title without page number
        tocPage.drawText(entry.title, {
          x: leftMargin,
          y: yPosition,
          size: 12,
          font: entry.level === 0 ? boldFont : font,
          color: rgb(0, 0, 0),
        });
      }
      
      yPosition -= entry.level === 0 ? 25 : 20; // More space after main sections
    }
    
    // Add page numbers to all pages and document numbers in header
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      
      // Format: "Page X of Y" at bottom left
      const pageText = `Page ${i + 1} of ${totalPages}`;
      
      page.drawText(pageText, {
        x: 50, // Left margin
        y: 15, // Bottom margin (moved lower)
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
