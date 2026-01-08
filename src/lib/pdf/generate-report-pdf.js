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
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;

  const pageHeight = pdfHeight / ratio;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", imgX, 0, imgWidth * ratio, imgHeight * ratio);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", imgX, position * ratio, imgWidth * ratio, imgHeight * ratio);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}
