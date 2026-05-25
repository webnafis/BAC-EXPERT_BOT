import { getData } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

// Required for pdfjs in Next.js / Windows (avoids missing .next/.../pdf.worker.mjs)
PDFParse.setWorker(getData());

function fileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
}

function isPdfFile(fileName: string, fileType: string): boolean {
  const ext = fileExtension(fileName);
  return (
    ext === ".pdf" ||
    fileType === "application/pdf" ||
    fileType === "application/x-pdf"
  );
}

function isDocxFile(fileName: string, fileType: string): boolean {
  const ext = fileExtension(fileName);
  return (
    ext === ".docx" ||
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

function isDocFile(fileName: string, fileType: string): boolean {
  const ext = fileExtension(fileName);
  return ext === ".doc" || fileType === "application/msword";
}

export async function extractTextFromFile(
  file: File
): Promise<{ text: string; fileName: string; error?: string }> {
  const fileName = file.name;
  const fileType = file.type;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    if (isPdfFile(fileName, fileType)) {
      return await extractFromPDF(buffer, fileName);
    }
    if (isDocxFile(fileName, fileType)) {
      return await extractFromDocx(buffer, fileName);
    }
    if (isDocFile(fileName, fileType)) {
      return {
        text: `[Content from ${fileName} - .doc format detected. Please convert to .docx for best results.]`,
        fileName,
      };
    }
    return {
      text: `[Unsupported file type: ${fileName}]`,
      fileName,
      error: "Unsupported file type",
    };
  } catch (err) {
    return {
      text: `[Error reading ${fileName}]`,
      fileName,
      error: String(err),
    };
  }
}

async function extractFromPDF(
  buffer: Buffer,
  fileName: string
): Promise<{ text: string; fileName: string; error?: string }> {
  let parser: PDFParse | undefined;
  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text?.trim();
    if (!text) {
      return {
        text: `[No text content found in ${fileName}]`,
        fileName,
      };
    }
    return { text, fileName };
  } catch (err) {
    console.error(`PDF extraction failed for ${fileName}:`, err);
    return {
      text: `[Could not extract text from PDF: ${fileName}. The file may be scanned/image-based.]`,
      fileName,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    try {
      await parser?.destroy();
    } catch {
      // ignore cleanup errors
    }
  }
}

async function extractFromDocx(
  buffer: Buffer,
  fileName: string
): Promise<{ text: string; fileName: string }> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value || `[No text content found in ${fileName}]`,
      fileName,
    };
  } catch {
    return {
      text: `[Could not extract text from Word document: ${fileName}]`,
      fileName,
    };
  }
}
