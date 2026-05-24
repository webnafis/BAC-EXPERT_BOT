export async function extractTextFromFile(
  file: File
): Promise<{ text: string; fileName: string; error?: string }> {
  const fileName = file.name;
  const fileType = file.type;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    if (
      fileType === "application/pdf" ||
      fileName.toLowerCase().endsWith(".pdf")
    ) {
      return await extractFromPDF(buffer, fileName);
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.toLowerCase().endsWith(".docx")
    ) {
      return await extractFromDocx(buffer, fileName);
    } else if (
      fileType === "application/msword" ||
      fileName.toLowerCase().endsWith(".doc")
    ) {
      return {
        text: `[Content from ${fileName} - .doc format detected. Please convert to .docx for best results.]`,
        fileName,
      };
    } else {
      return {
        text: `[Unsupported file type: ${fileName}]`,
        fileName,
        error: "Unsupported file type",
      };
    }
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
): Promise<{ text: string; fileName: string }> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return {
      text: data.text || `[No text content found in ${fileName}]`,
      fileName,
    };
  } catch {
    return {
      text: `[Could not extract text from PDF: ${fileName}. The file may be scanned/image-based.]`,
      fileName,
    };
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
