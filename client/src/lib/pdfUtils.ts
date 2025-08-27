import { FolderStructureType } from "./types";
import { PDFDocument, rgb, PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// Helper: unik ID
export const generateId = (): string =>
  "_" + Math.random().toString(36).substr(2, 9);

// Helper: NFC-normalisering for at undgå kombinerede diakritika-problemer
const nfc = (s: string) => (s ?? "").normalize("NFC");

// Indlæs font fra public (serveres via /fonts/...)
const loadUiFontBytes = async (): Promise<ArrayBuffer> => {
  const res = await fetch("/fonts/NotoSans-VariableFont_wdth,wght.ttf");
  if (!res.ok) throw new Error("Kunne ikke hente NotoSans fonten");
  return res.arrayBuffer();
};

// Læs fil som ArrayBuffer
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

// Konverter JPEG til PDF-side (A4, 90% skalering og centreret)
const convertJpegToPdfPage = async (
  jpegFile: File,
  pdfDoc: PDFDocument
): Promise<PDFPage> => {
  const imageBytes = await readFileAsArrayBuffer(jpegFile);
  const image = await pdfDoc.embedJpg(new Uint8Array(imageBytes));

  // A4
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width: pageWidth, height: pageHeight } = page.getSize();

  const imageWidth = image.width;
  const imageHeight = image.height;

  const maxWidth = pageWidth * 0.9;
  const maxHeight = pageHeight * 0.9;

  const scaleX = maxWidth / imageWidth;
  const scaleY = maxHeight / imageHeight;
  const scale = Math.min(scaleX, scaleY);

  const finalWidth = imageWidth * scale;
  const finalHeight = imageHeight * scale;

  const x = (pageWidth - finalWidth) / 2;
  const y = (pageHeight - finalHeight) / 2;

  page.drawImage(image, {
    x,
    y,
    width: finalWidth,
    height: finalHeight,
  });

  return page;
};

// Edge-specifik filbehandling (uændret)
export const processUploadedFilesForEdge = (files: File[]): FolderStructureType => {
  const folderStructure: FolderStructureType = { sections: [] };
  const pathMap = new Map<string, any>();

  console.log("Processing files for Edge:", files.length);

  files.sort((a, b) => {
    const pathA = (a as any).path || a.name;
    const pathB = (b as any).path || b.name;
    return pathA.localeCompare(pathB, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  files.forEach((file) => {
    // @ts-ignore
    const relativePath = file.webkitRelativePath || file.name;
    console.log(`Processing file: ${file.name}, relative path: ${relativePath}`);

    // Kun PDF/JPEG
    if (
      !file.type.match("application/pdf") &&
      !file.type.match("image/jpeg")
    ) {
      console.warn(`File ignored (not PDF/JPEG): ${file.name}`);
      return;
    }

    const pathParts = relativePath.split("/");
    console.log(`Path parts for ${file.name}:`, pathParts);

    if (pathParts.length === 1) {
      const defaultSectionTitle = "Uploadede filer";
      if (!pathMap.has(defaultSectionTitle)) {
        const sectionId = generateId();
        const section = {
          id: sectionId,
          title: defaultSectionTitle,
          files: [],
          subpoints: [],
          showInToc: true,
        };
        folderStructure.sections.push(section);
        pathMap.set(defaultSectionTitle, section);
      }
      pathMap.get(defaultSectionTitle)!.files.push(file);
    } else if (pathParts.length >= 2) {
      const folderPath = pathParts.slice(0, -1);

      let currentContainer = folderStructure.sections;
      let currentPath = "";

      for (let i = 0; i < folderPath.length; i++) {
        const folderName = folderPath[i];
        currentPath += (currentPath ? "/" : "") + folderName;

        let foundContainer = currentContainer.find(
          (item) => item.title === folderName
        );

        if (!foundContainer) {
          const containerId = generateId();
          const newContainer = {
            id: containerId,
            title: folderName,
            files: [],
            subpoints: [],
            showInToc: true,
            level: i,
          };

          currentContainer.push(newContainer);
          foundContainer = newContainer;
          pathMap.set(currentPath, foundContainer);
        }

        if (i < folderPath.length - 1) {
          currentContainer = foundContainer.subpoints;
        } else {
          foundContainer.files.push(
            // sidste element i pathParts er filnavnet – vi har allerede filen
            files.find((f) => f.name === pathParts[pathParts.length - 1]) || file
          );
        }
      }
    }
  });

  const sortSections = (sections: any[]) => {
    sections.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
    sections.forEach((section) => {
      if (section.subpoints?.length) sortSections(section.subpoints);
    });
  };

  sortSections(folderStructure.sections);
  console.log("Final folder structure:", folderStructure);
  return folderStructure;
};

// Simpel 2-niveau struktur (uændret)
export const processUploadedFiles = (files: File[]): FolderStructureType => {
  const folderStructure: FolderStructureType = { sections: [] };
  const pathMap = new Map();

  files.sort((a, b) => {
    // @ts-ignore
    return a.webkitRelativePath.localeCompare(b.webkitRelativePath);
  });

  files.forEach((file) => {
    // @ts-ignore
    const path = file.webkitRelativePath;
    const pathParts = path.split("/");

    if (
      !file.type.match("application/pdf") &&
      !file.type.match("image/jpeg")
    ) {
      console.warn(`File ignored (not PDF/JPEG): ${path}`);
      return;
    }

    if (pathParts.length > 1) {
      const topLevelFolder = pathParts[0];
      const secondLevelFolder = pathParts.length > 2 ? pathParts[1] : null;

      if (!pathMap.has(topLevelFolder)) {
        const sectionId = generateId();
        const section = {
          id: sectionId,
          title: topLevelFolder,
          files: [],
          subpoints: [],
          showInToc: true,
        };
        folderStructure.sections.push(section);
        pathMap.set(topLevelFolder, section);
      }

      const section = pathMap.get(topLevelFolder);

      if (secondLevelFolder && pathParts.length > 2) {
        const subpointKey = `${topLevelFolder}/${secondLevelFolder}`;
        if (!pathMap.has(subpointKey)) {
          const subpointId = generateId();
          const subpoint = {
            id: subpointId,
            title: secondLevelFolder,
            files: [],
            showInToc: true,
          };
          section.subpoints.push(subpoint);
          pathMap.set(subpointKey, subpoint);
        }
        pathMap.get(subpointKey).files.push(file);
      } else if (pathParts.length == 2) {
        section.files.push(file);
      }
    }
  });

  folderStructure.sections.sort((a, b) => a.title.localeCompare(b.title));
  folderStructure.sections.forEach((section) => {
    section.subpoints.sort((a, b) => a.title.localeCompare(b.title));
  });

  return folderStructure;
};

// Hovedfunktion: generér kombineret PDF
export const generatePDF = async (
  coverFile: File | null,
  folderStructure: FolderStructureType,
  outputName: string,
  documentNumberLeft: string = "",
  documentNumberCenter: string = ""
): Promise<void> => {
  try {
    // 1) Opret PDF + embed UI-font
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = new Uint8Array(await loadUiFontBytes());
    const uiFont = await pdfDoc.embedFont(fontBytes, { subset: true });
    // Brug samme font som "bold" (variations understøttes ikke direkte af pdf-lib)
    const boldFont = uiFont;

    let currentPage = 0;
    const tocEntries: {
      title: string;
      page: number;
      level: number;
      showPage: boolean;
    }[] = [];

    // 2) Standard forside fra server
    try {
      const standardCoverResponse = await fetch("/standard_forside.pdf");
      if (standardCoverResponse.ok) {
        const standardCoverArrayBuffer =
          await standardCoverResponse.arrayBuffer();
        const standardCoverPdf = await PDFDocument.load(
          new Uint8Array(standardCoverArrayBuffer)
        );

        const form = standardCoverPdf.getForm();
        const fields = form.getFields();

        if (fields.length > 0) {
          const unitName = nfc(outputName.replace(/ SQP$/, ""));
          const d = new Date();
          const dateString = `${d.getFullYear()}.${String(
            d.getMonth() + 1
          ).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;

          fields.forEach((field) => {
            const fieldName = field.getName();
            if (fieldName === "unitname") {
              const textField = form.getTextField("unitname");
              textField.setText(unitName);
              textField.setAlignment(1);
            } else if (fieldName === "date") {
              const textField = form.getTextField("date");
              textField.setText(dateString);
              textField.setAlignment(1);
            }
          });

          form.flatten();
        }

        const standardCoverPages = await pdfDoc.copyPages(
          standardCoverPdf,
          standardCoverPdf.getPageIndices()
        );
        standardCoverPages.forEach((p) => pdfDoc.addPage(p));
        currentPage += standardCoverPages.length;
        console.log(`Added ${standardCoverPages.length} standard cover page(s)`);
      } else {
        console.log("No standard cover found, skipping");
      }
    } catch (error) {
      console.log("Could not load standard cover:", error);
    }

    // 3) Ekstra forside (optionel) – A4-resize
    if (coverFile) {
      const extraBytes = await readFileAsArrayBuffer(coverFile);
      const extraPdf = await PDFDocument.load(new Uint8Array(extraBytes));
      const extraPages = await pdfDoc.copyPages(
        extraPdf,
        extraPdf.getPageIndices()
      );
      extraPages.forEach((page) => {
        const { width: originalWidth, height: originalHeight } = page.getSize();
        const a4Width = 595.28;
        const a4Height = 841.89;

        const widthDiff = Math.abs(originalWidth - a4Width) / a4Width;
        const heightDiff = Math.abs(originalHeight - a4Height) / a4Height;

        if (widthDiff >= 0.1 || heightDiff >= 0.1) {
          const scaleX = a4Width / originalWidth;
          const scaleY = a4Height / originalHeight;
          const scale = Math.min(scaleX, scaleY) * 0.9;

          page.scaleContent(scale, scale);
          page.setSize(a4Width, a4Height);

          const scaledWidth = originalWidth * scale;
          const scaledHeight = originalHeight * scale;
          const offsetX = (a4Width - scaledWidth) / 2;
          const offsetY = (a4Height - scaledHeight) / 2;

          page.translateContent(offsetX, offsetY);
        }

        pdfDoc.addPage(page);
      });
      currentPage += extraPages.length;
      console.log(`Added ${extraPages.length} extra page(s)`);
    }

    // 4) Forbered TOC-plads
    const initialPageHeight = 841.89; // A4
    const startY = initialPageHeight - 80;
    const entryH0 = 25;
    const entryH1 = 20;
    const bottomMargin = 50;

    let estimatedTocEntryCount = 0;
    const tempTocEntries: {
      title: string;
      page: number;
      level: number;
      showPage: boolean;
    }[] = [];

    const estimateNestedSection = (section: any, level: number = 0) => {
      if (section.showInToc) {
        tempTocEntries.push({
          title: section.title,
          page: 0,
          level,
          showPage: section.showInToc,
        });
        estimatedTocEntryCount++;
      }
      for (const subpoint of section.subpoints || []) {
        estimateNestedSection(subpoint, level + 1);
      }
    };
    for (const section of folderStructure.sections) {
      estimateNestedSection(section, 0);
    }

    let currentEstimatedY = startY;
    let estimatedTocPagesNeeded = 1;
    for (const entry of tempTocEntries) {
      const entryHeight = entry.level === 0 ? entryH0 : entryH1;
      if (currentEstimatedY - entryHeight < bottomMargin) {
        estimatedTocPagesNeeded++;
        currentEstimatedY = initialPageHeight - 50;
      }
      currentEstimatedY -= entryHeight;
    }
    console.log("Estimated TOC pages needed:", estimatedTocPagesNeeded);

    const tocStartPage = currentPage;
    for (let i = 0; i < estimatedTocPagesNeeded; i++) {
      pdfDoc.insertPage(tocStartPage + i, [595.28, 841.89]);
      currentPage++;
    }

    // 5) Rekursiv behandling af sektioner
    const processNestedSection = async (section: any, level: number = 0) => {
      const sectionStartPage = currentPage;
      tocEntries.push({
        title: section.title,
        page: sectionStartPage,
        level,
        showPage: section.showInToc,
      });

      // Filer i den aktuelle sektion
      for (const file of section.files) {
        if (file.type === "application/pdf") {
          const fileBytes = await readFileAsArrayBuffer(file);
          const pdf = await PDFDocument.load(new Uint8Array(fileBytes));
          const originalPages = await pdfDoc.copyPages(
            pdf,
            pdf.getPageIndices()
          );

          originalPages.forEach((originalPage) => {
            const { width: originalWidth, height: originalHeight } =
              originalPage.getSize();

            const a4Width = 595.28;
            const a4Height = 841.89;
            const widthDiff = Math.abs(originalWidth - a4Width) / a4Width;
            const heightDiff = Math.abs(originalHeight - a4Height) / a4Height;

            if (widthDiff < 0.1 && heightDiff < 0.1) {
              pdfDoc.addPage(originalPage);
            } else {
              const scaleX = a4Width / originalWidth;
              const scaleY = a4Height / originalHeight;
              const scale = Math.min(scaleX, scaleY) * 0.9;

              originalPage.scaleContent(scale, scale);
              originalPage.setSize(a4Width, a4Height);

              const scaledWidth = originalWidth * scale;
              const scaledHeight = originalHeight * scale;
              const offsetX = (a4Width - scaledWidth) / 2;
              const offsetY = (a4Height - scaledHeight) / 2;

              originalPage.translateContent(offsetX, offsetY);
              pdfDoc.addPage(originalPage);
            }
          });

          currentPage += originalPages.length;
        } else if (
          file.type === "image/jpeg" ||
          file.type === "image/jpg"
        ) {
          await convertJpegToPdfPage(file, pdfDoc);
          currentPage++;
        }
      }

      // Subpoints i den nuværende rækkefølge (bevarer DnD)
      for (const subpoint of section.subpoints) {
        await processNestedSection(subpoint, level + 1);
      }
    };

    for (const section of folderStructure.sections) {
      await processNestedSection(section, 0);
    }

    // 6) TOC-rendering
    const totalPages = pdfDoc.getPageCount();
    let currentTocPageIndex = 0;
    let tocPage = pdfDoc.getPages()[tocStartPage + currentTocPageIndex];
    let yPosition = tocPage.getHeight() - 80;

    tocPage.drawText(nfc("Indholdsfortegnelse"), {
      x: 50,
      y: tocPage.getHeight() - 50,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    for (const entry of tocEntries) {
      entry.page += estimatedTocPagesNeeded - 1;

      if (yPosition < 50) {
        currentTocPageIndex++;
        if (currentTocPageIndex < estimatedTocPagesNeeded) {
          tocPage = pdfDoc.getPages()[tocStartPage + currentTocPageIndex];
          yPosition = tocPage.getHeight() - 50;
        } else {
          tocPage = pdfDoc.addPage();
          yPosition = tocPage.getHeight() - 50;
        }
      }

      const indent = entry.level * 15;
      const leftMargin = 50 + indent;

      if (entry.showPage) {
        const titleText = nfc(entry.title);
        const pageNumberText = `${entry.page + 1}`;
        const pageNumberWidth = uiFont.widthOfTextAtSize(pageNumberText, 12);
        const titleWidth = (entry.level === 0 ? boldFont : uiFont).widthOfTextAtSize(
          titleText,
          12
        );
        const availableSpace =
          tocPage.getWidth() - leftMargin - titleWidth - pageNumberWidth - 100;
        const dotCount = Math.max(0, Math.floor(availableSpace / 3));

        tocPage.drawText(titleText, {
          x: leftMargin,
          y: yPosition,
          size: 12,
          font: entry.level === 0 ? boldFont : uiFont,
          color: rgb(0, 0, 0),
        });

        if (dotCount > 0) {
          const dotsText = ".".repeat(dotCount);
          tocPage.drawText(dotsText, {
            x: leftMargin + titleWidth + 5,
            y: yPosition,
            size: 12,
            font: uiFont,
            color: rgb(0, 0, 0),
          });
        }

        tocPage.drawText(pageNumberText, {
          x: tocPage.getWidth() - pageNumberWidth - 50,
          y: yPosition,
          size: 12,
          font: uiFont,
          color: rgb(0, 0, 0),
        });
      } else {
        tocPage.drawText(nfc(entry.title), {
          x: leftMargin,
          y: yPosition,
          size: 12,
          font: entry.level === 0 ? boldFont : uiFont,
          color: rgb(0, 0, 0),
        });
      }

      yPosition -= entry.level === 0 ? 25 : 20;
    }

    // 7) Footer/headers på alle sider
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      const pageText = nfc(`Page ${i + 1} of ${totalPages}`);
      page.drawText(pageText, {
        x: 50,
        y: 15,
        size: 10,
        font: uiFont,
        color: rgb(0, 0, 0),
      });

      if (documentNumberLeft) {
        page.drawText(nfc(documentNumberLeft), {
          x: 50,
          y: height - 15,
          size: 10,
          font: uiFont,
          color: rgb(0, 0, 0),
        });
      }

      if (documentNumberCenter) {
        const text = nfc(documentNumberCenter);
        const textWidth = uiFont.widthOfTextAtSize(text, 10);
        page.drawText(text, {
          x: width - textWidth - 50,
          y: height - 15,
          size: 10,
          font: uiFont,
          color: rgb(0, 0, 0),
        });
      }
    }

    // 8) Gem og download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${outputName}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
