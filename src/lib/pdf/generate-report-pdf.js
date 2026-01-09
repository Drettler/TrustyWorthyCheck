// Small JS helper to avoid TypeScript typechecking 3rd-party PDF libs.
// (keeps TS compiler stable while still bundling the libraries at runtime)

export async function generateReportPdf(reportElement, { filename } = {}) {
  if (!reportElement) throw new Error("Missing report element");
  if (!filename) throw new Error("Missing filename");

  const html2canvas = (await import("html2canvas")).default;
  const jsPDFModule = await import("jspdf");
  const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF || jsPDFModule;

  const canvas = await html2canvas(reportElement, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  
  // Scale image to fit PDF width with some margin
  const margin = 10; // mm
  const usableWidth = pdfWidth - (margin * 2);
  const scaledWidth = usableWidth;
  const scaledHeight = (imgHeight * usableWidth) / imgWidth;
  
  let heightLeft = scaledHeight;
  let position = margin; // Start with top margin
  const usablePageHeight = pdfHeight - (margin * 2);

  // First page
  pdf.addImage(imgData, "PNG", margin, position, scaledWidth, scaledHeight);
  heightLeft -= usablePageHeight;

  // Additional pages if needed
  while (heightLeft > 0) {
    pdf.addPage();
    position = margin - (scaledHeight - heightLeft);
    pdf.addImage(imgData, "PNG", margin, position, scaledWidth, scaledHeight);
    heightLeft -= usablePageHeight;
  }

  pdf.save(filename);
}
