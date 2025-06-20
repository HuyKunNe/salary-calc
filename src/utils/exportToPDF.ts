// utils/exportToPDF.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const exportToPDF = async (
  elementId: string,
  fileName: string,
  options: {
    scale?: number;
  } = {}
): Promise<void> => {
  const { scale = 2 } = options;

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }

    // Hide export button
    const exportBtn = document.getElementById("export-btn");
    if (exportBtn) exportBtn.style.display = "none";
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Generate canvas
    // const canvas = await html2canvas(element, {
    //   scale,
    //   logging: false,
    //   useCORS: true,
    //   allowTaint: true,
    //   backgroundColor: "#ffffff",
    // });

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      onclone: (clonedDoc) => {
        // Inject Naive UI CSS
        const naiveStyles = Array.from(document.querySelectorAll("style"))
          .filter((style) => style.innerHTML.includes("n-"))
          .map((style) => style.innerHTML)
          .join("\n");

        const style = clonedDoc.createElement("style");
        style.innerHTML = naiveStyles;
        clonedDoc.head.appendChild(style);
        const styles = `
          .duplicate-row {
            background-color: #ff4d4f !important;
          }
          .n-card-header__main {
            color:  #f0f0f0;
          }
        `;
        const styleEl = clonedDoc.createElement("style");
        styleEl.innerHTML = styles;
        clonedDoc.head.appendChild(styleEl);
      },
    });

    canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const paddingTop = 20; // mm
    const paddingBottom = 20; // mm
    const contentHeight = pageHeight - paddingTop - paddingBottom;

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let remainingHeight = imgHeight;
    let position = 0;

    while (remainingHeight > 0) {
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = (contentHeight * canvas.height) / imgHeight;

      const ctx = pageCanvas.getContext("2d");

      ctx?.drawImage(
        canvas,
        0,
        (position * canvas.height) / imgHeight,
        canvas.width,
        pageCanvas.height,
        0,
        0,
        canvas.width,
        pageCanvas.height
      );

      const pageImgData = pageCanvas.toDataURL("image/png");
      if (position > 0) pdf.addPage();

      pdf.addImage(
        pageImgData,
        "PNG",
        0,
        paddingTop, // Apply padding top
        imgWidth,
        (pageCanvas.height * imgWidth) / canvas.width
      );

      position += contentHeight;
      remainingHeight -= contentHeight;
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
