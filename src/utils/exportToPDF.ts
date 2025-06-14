// utils/exportToPDF.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const exportToPDF = async (
  elementId: string,
  fileName: string,
  options: {
    scale?: number;
    margin?: number; // Uniform margin
    pageFormat?: [number, number];
  } = {}
): Promise<void> => {
  const {
    scale = 2,
    margin = 10, // mm
    pageFormat = [210, 297], // A4 size (width × height in mm)
  } = options;

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }

    // Hide export button
    const exportBtn = document.getElementById("export-btn");
    if (exportBtn) exportBtn.style.display = "none";

    // Generate canvas
    const canvas = await html2canvas(element, {
      scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF("p", "mm", pageFormat as any);
    const imgWidth = pageFormat[0] - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = pageFormat[1] - margin * 2; // Available height per page
    let currentPosition = 0;

    // First page with proper bottom margin
    pdf.addImage(
      canvas,
      "PNG",
      margin, // x
      margin, // y
      imgWidth,
      imgHeight,
      undefined,
      "FAST"
    );
    currentPosition += pageHeight;

    // Additional pages if needed
    while (currentPosition < imgHeight) {
      pdf.addPage(pageFormat as any);
      pdf.addImage(
        canvas,
        "PNG",
        margin, // x
        margin - currentPosition, // y (negative offset)
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      currentPosition += pageHeight;
    }

    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("PDF export failed:", error);
    throw error;
  } finally {
    // Restore export button
    const exportBtn = document.getElementById("export-btn");
    if (exportBtn) exportBtn.style.display = "block";
  }
};
