import jsPDF from "jspdf";

export interface IncidentReportParams {
  id: string;
  category: string;
  riskScore: number;
  verdict: string;
  content: string;
  flags: string[];
  action: string;
  suspectDetails?: string;
}

export function exportForensicIncidentPdf(data: IncidentReportParams) {
  const doc = new jsPDF();
  const width = doc.internal.pageSize.getWidth();

  // Dark Header
  doc.setFillColor(7, 7, 7);
  doc.rect(0, 0, width, 40, "F");

  doc.setTextColor(249, 115, 22);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("SCAMSHIELD BHARAT | FORENSIC INCIDENT LOG", 14, 20);

  doc.setTextColor(170, 170, 170);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")} | Tracking ID: #${data.id}`, 14, 29);
  doc.text("Authority Action: National Cyber Crime Reporting Portal (1930 / cybercrime.gov.in)", 14, 34);

  // Divider
  doc.setDrawColor(249, 115, 22);
  doc.setLineWidth(0.5);
  doc.line(14, 42, width - 14, 42);

  // Verdict Section
  const isDanger = data.riskScore >= 60;
  doc.setTextColor(isDanger ? 220 : 16, isDanger ? 38 : 185, isDanger ? 38 : 129);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Risk Severity: ${data.riskScore}/100 [${data.verdict}]`, 14, 54);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(11);
  doc.text(`Incident Category: ${data.category}`, 14, 62);

  // Payload Content Box
  doc.setTextColor(249, 115, 22);
  doc.setFontSize(10);
  doc.text("Analyzed Payload / Evidence Body:", 14, 74);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(70, 70, 70);
  doc.setFontSize(9);
  const splitBody = doc.splitTextToSize(data.content, width - 28);
  doc.text(splitBody, 14, 82);

  let currentY = 82 + splitBody.length * 5 + 8;

  // Red Flags List
  doc.setFont("helvetica", "bold");
  doc.setTextColor(249, 115, 22);
  doc.setFontSize(10);
  doc.text("Identified Forensic Red Flags:", 14, currentY);
  currentY += 7;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8.5);
  data.flags.forEach((flag) => {
    doc.text(`• ${flag}`, 16, currentY);
    currentY += 6;
  });

  currentY += 8;

  // Golden Hour Response Instructions
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(14, currentY, width - 28, 42, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(185, 28, 28);
  doc.text("CRITICAL CITIZEN ACTIONS (GOLDEN HOUR RECOVERY):", 18, currentY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  doc.text("1. Call 1930 immediately to place an operational hold on beneficiary merchant/bank accounts.", 18, currentY + 16);
  doc.text("2. Retain the 12-digit transaction UTR number from your bank debit SMS alert.", 18, currentY + 23);
  doc.text("3. Submit this forensic PDF when filing an official complaint on cybercrime.gov.in.", 18, currentY + 30);
  doc.text("4. Block the sender phone number and report the associated UPI ID inside your UPI app.", 18, currentY + 37);

  doc.save(`ScamShield_Incident_${data.id}.pdf`);
}
