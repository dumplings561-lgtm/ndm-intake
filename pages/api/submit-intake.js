// pages/api/submit-intake.js
// Merged: Manus v4.2 PDF+email format + v8 service interests + payment plan fields

import { Resend } from "resend";
import { jsPDF } from "jspdf";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFY_EMAILS = (process.env.NOTIFY_EMAILS || "anthony@nightdaymed.net").split(",").map(e => e.trim());

// ========== SERVICE OPTIONS MAP (v8) ==========
const SERVICE_MAP = {
  hormones: "Hormone Optimization",
  weightloss: "Clinical Weight Loss",
  peptides: "Peptide Therapy",
  antiaging: "Anti-Aging & Longevity",
  sexual: "Sexual Health & Wellness",
  immune: "Immune & Recovery Support",
  supplements: "Physician-Directed Supplementation",
  unsure: "Not Sure \u2014 Let the Doctor Guide Me",
};

// ========== PDF GENERATION ==========
function generateIntakePDF(d) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = 612;
  const MARGIN = 50;
  const CONTENT_W = W - MARGIN * 2;
  let y = 0;

  const COLORS = {
    rose: [125, 90, 90],
    sage: [91, 138, 114],
    charcoal: [45, 45, 45],
    gray: [120, 120, 120],
    lightGray: [200, 200, 200],
    cream: [247, 243, 239],
  };

  function newPage() { doc.addPage(); y = MARGIN; }
  function checkSpace(needed) { if (y + needed > 742) newPage(); }

  function drawHeader(title, subtitle) {
    doc.setFillColor(...COLORS.rose);
    doc.rect(0, 0, W, 58, "F");
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("NIGHT & DAY MEDICAL", W / 2, 28, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Patient Intake Record", W / 2, 46, { align: "center" });
    y = 76;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.charcoal);
    doc.text(title, MARGIN, y);
    y += 4;
    doc.setDrawColor(192, 57, 43);
    doc.setLineWidth(2);
    doc.line(MARGIN, y, MARGIN + 40, y);
    y += 14;
    if (subtitle) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.gray);
      doc.text(subtitle, MARGIN, y);
      y += 18;
    }
  }

  function sectionTitle(text) {
    checkSpace(30);
    doc.setFillColor(...COLORS.cream);
    doc.rect(MARGIN, y - 3, CONTENT_W, 20, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.rose);
    doc.text(text.toUpperCase(), MARGIN + 8, y + 10);
    y += 26;
  }

  function fieldRow(label, value, options) {
    var opts = options || {};
    checkSpace(opts.tall ? 50 : 18);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.gray);
    doc.text(label + ":", MARGIN + 8, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.charcoal);
    var val = (value || "\u2014").toString();
    if (opts.tall) {
      var lines = doc.splitTextToSize(val, CONTENT_W - 120);
      doc.text(lines, MARGIN + 120, y);
      y += Math.max(14, lines.length * 11);
    } else {
      doc.text(val, MARGIN + 120, y);
      y += 14;
    }
  }

  function divider() {
    checkSpace(10);
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, W - MARGIN, y);
    y += 8;
  }

  // Symptom label maps
  var SYMPTOMS_MEN = [
    { id: "fatigue", label: "Fatigue / Low energy" },
    { id: "libido", label: "Low libido / Sexual dysfunction" },
    { id: "brainfog", label: "Brain fog / Poor concentration" },
    { id: "weight", label: "Weight gain / Difficulty losing weight" },
    { id: "mood", label: "Mood changes / Irritability / Depression" },
    { id: "sleep", label: "Sleep issues / Insomnia" },
    { id: "muscle", label: "Muscle loss / Weakness" },
    { id: "hair", label: "Hair thinning / Hair loss" },
    { id: "erection", label: "Erectile dysfunction" },
    { id: "recovery", label: "Slow recovery from exercise / injury" },
    { id: "joint", label: "Joint pain / Inflammation" },
    { id: "immune", label: "Frequent illness / Weak immunity" },
    { id: "aging", label: "Accelerated aging / Skin changes" },
  ];
  var SYMPTOMS_WOMEN = [
    { id: "fatigue", label: "Fatigue / Low energy" },
    { id: "libido", label: "Low libido / Sexual dysfunction" },
    { id: "brainfog", label: "Brain fog / Poor concentration" },
    { id: "weight", label: "Weight gain / Difficulty losing weight" },
    { id: "mood", label: "Mood swings / Anxiety / Depression" },
    { id: "sleep", label: "Sleep issues / Insomnia" },
    { id: "hotflash", label: "Hot flashes / Night sweats" },
    { id: "hair", label: "Hair thinning / Hair loss" },
    { id: "irregular", label: "Irregular periods / Menstrual changes" },
    { id: "dryness", label: "Vaginal dryness / Discomfort" },
    { id: "joint", label: "Joint pain / Inflammation" },
    { id: "immune", label: "Frequent illness / Weak immunity" },
    { id: "aging", label: "Accelerated aging / Skin changes" },
  ];

  var symptomList = d.sex === "Female" ? SYMPTOMS_WOMEN : SYMPTOMS_MEN;
  var symptomLabels = (d.symptoms || []).map(function(id) {
    var m = symptomList.find(function(s) { return s.id === id; });
    return m ? m.label : id;
  });

  // v8: service interest labels
  var serviceLabels = (d.serviceInterests || []).map(function(id) {
    return SERVICE_MAP[id] || id;
  });

  var fullName = (d.lastName || "") + ", " + (d.firstName || "");
  var today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // ===== PAGE 1: PATIENT CHART =====
  drawHeader("Patient Chart \u2014 Demographics & Medical History", "Date: " + today);

  sectionTitle("Patient Information");
  fieldRow("Patient Name", fullName);
  fieldRow("Date of Birth", d.dob || "");
  fieldRow("Sex", d.sex || "");
  fieldRow("Email", d.email || "");
  fieldRow("Phone", d.phone || "");
  fieldRow("Preferred Contact", d.contactMethod || "");
  divider();

  sectionTitle("Address");
  fieldRow("Street", d.address || "");
  fieldRow("City / State / Zip", (d.city || "") + ", " + (d.state || "") + " " + (d.zip || ""));
  divider();

  // v8: Service Interests
  if (serviceLabels.length > 0) {
    sectionTitle("Service Interests");
    serviceLabels.forEach(function(s) {
      checkSpace(13);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.charcoal);
      doc.text("\u2022  " + s, MARGIN + 12, y);
      y += 13;
    });
    divider();
  }

  sectionTitle("Referral");
  fieldRow("Source", d.referralSource || "Not provided");
  divider();

  // Embed Photo ID (Manus)
  sectionTitle("Photo ID");
  if (d.idPreview && typeof d.idPreview === "string" && d.idPreview.startsWith("data:image")) {
    try {
      var maxImgW = CONTENT_W - 60;
      var maxImgH = 200;
      var imgProps = null;
      try { imgProps = doc.getImageProperties(d.idPreview); } catch(pe) {}
      var imgW = maxImgW;
      var imgH = maxImgH;
      if (imgProps && imgProps.width && imgProps.height) {
        var ratio = imgProps.width / imgProps.height;
        if (ratio > maxImgW / maxImgH) { imgW = maxImgW; imgH = maxImgW / ratio; }
        else { imgH = maxImgH; imgW = maxImgH * ratio; }
      }
      checkSpace(imgH + 20);
      var imgFormat = d.idPreview.indexOf("data:image/png") === 0 ? "PNG" : "JPEG";
      doc.addImage(d.idPreview, imgFormat, MARGIN + 8, y, imgW, imgH, undefined, "FAST");
      y += imgH + 10;
    } catch (e) {
      fieldRow("Photo ID", "Image could not be embedded \u2014 uploaded with intake");
    }
  } else if (d.idBypassed) {
    fieldRow("Photo ID", "Will provide separately");
  } else if (d.idPreview) {
    fieldRow("Photo ID", "Uploaded: " + d.idPreview);
  } else {
    fieldRow("Photo ID", "Not provided");
  }
  divider();

  // Chief Complaints
  sectionTitle("Chief Complaints / Symptoms");
  if (symptomLabels.length > 0) {
    symptomLabels.forEach(function(s) {
      checkSpace(13);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.charcoal);
      doc.text("\u2022  " + s, MARGIN + 12, y);
      y += 13;
    });
  } else {
    fieldRow("Symptoms", "None reported");
  }
  y += 4;
  fieldRow("Duration", d.symptomDuration || "Not specified");
  if (d.symptomNotes) {
    fieldRow("Additional Notes", d.symptomNotes, { tall: true });
  }
  divider();

  sectionTitle("Allergies");
  if (d.hasAllergies === "Yes") {
    fieldRow("Allergies", d.allergies || "Yes \u2014 details not specified");
  } else {
    fieldRow("Allergies", "NKDA (No Known Drug Allergies)");
  }
  divider();

  sectionTitle("Past / Current Medical Conditions");
  var conditions = d.conditions || [];
  if (conditions.length > 0) {
    for (var i = 0; i < conditions.length; i += 3) {
      checkSpace(13);
      var row = conditions.slice(i, i + 3).join("  \u2022  ");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.charcoal);
      doc.text("\u2022  " + row, MARGIN + 12, y);
      y += 12;
    }
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.charcoal);
    doc.text("None reported", MARGIN + 12, y);
    y += 14;
  }
  y += 4;
  divider();

  sectionTitle("Current Medications");
  fieldRow("Medications", d.medications || "None reported", { tall: true });
  divider();

  sectionTitle("Surgical History");
  fieldRow("Surgeries", d.surgeries || "None reported", { tall: true });
  divider();

  sectionTitle("Family History");
  fieldRow("Family History", d.familyHistory || "None reported", { tall: true });
  divider();

  sectionTitle("Primary Care Physician");
  fieldRow("PCP Name", d.pcpName || "Not provided");
  fieldRow("PCP Phone", d.pcpPhone || "Not provided");

  // ===== PAGE 2: THERAPY MANAGEMENT AGREEMENT =====
  newPage();
  drawHeader("Therapy Management Agreement", "Patient: " + fullName + "  |  DOB: " + (d.dob || ""));

  checkSpace(50);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.charcoal);
  var preamble = 'This agreement between ' + fullName + ' ("Patient") and Night & Day Medical ("NDM") establishes guidelines and conditions for the use of hormone replacement therapy ("HRT") involving DEA "controlled" or "scheduled" medications. NDM and patient agree that these guidelines and conditions are an essential factor in maintaining a successful patient/practitioner relationship.';
  var preambleLines = doc.splitTextToSize(preamble, CONTENT_W - 16);
  doc.text(preambleLines, MARGIN + 8, y);
  y += preambleLines.length * 9 + 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.charcoal);
  doc.text("The patient agrees and accepts the following conditions:", MARGIN + 8, y);
  y += 12;

  var tmaItems = [
    "I understand that the medications I am receiving or will receive are prescribed for me based on diagnoses derived from my submitted medical history, and the results of lab work and a physical examination. The medications are to be used exclusively for treatment of hormonal deficiencies and related medical conditions in accordance with applicable state and Federal law.",
    "I understand and agree that no medical treatment or medication provided to me by Night & Day Medical will be used for the purposes of bodybuilding, performance enhancement or physical appearance.",
    "I certify that the answers I provided to the health questions on the Health History laboratories are accurate and correct to the best of my knowledge and that I have not been coached by any third party nor have I knowingly been deceptive for secondary gain, for medical treatment or prescription of a medication.",
    "I will not attempt to obtain HRT medications from any other health care practitioner without disclosing my current medical usage of HRT or other medications. I understand that it may be against the law to do so.",
    "I have discussed and understand the risks and benefits associated with HRT. I will immediately report any adverse side effect related to the use of my HRT to Night & Day Medical and discontinue use until advised to resume usage by Night & Day Medical. I voluntarily assume any and all possible risks which may be associated with HRT.",
    "I understand that representatives of Night & Day Medical and/or Licensed Physicians Assistant are available for questions and/or concerning during normal business hours throughout the course of my treatment.",
    "I agree that the HRT medications furnished by Night & Day Medical are for my personal use only and for no other purpose. I will not share, sell, or trade my medications. I will safeguard my medications from loss or theft and will be responsible for their safekeeping.",
    "I will be able to purchase the medications from the pharmacy designated by Night & Day Medical and the pharmacy will send medication directly to me. I understand I have the right to purchase my medications from any pharmacy of my choice. If I chose to obtain medications from a pharmacy of my own choice, I must notify Night & Day Medical in writing of my intention to do so and include the name of the pharmacy in my request.",
    "I agree and understand that federal regulations prohibit the return of prescribed medications.",
    "I understand that HRT treatment and medications are not covered by health insurance. I agree that all services and medications provided by Night & Day Medical or its associated providers are to be paid for in advance. I will not seek reimbursement through my health insurance company, Medicare, Medicaid, or other third party payer.",
    "I agree that the Night & Day Medical patient/physician relationship is not intended to replace the existing patient/physician relationship with my current primary care provider (PCP) and the treatment provided by Night & Day Medical will be in conjunction with the care provided by my current PCP.",
    "I agree that I will use my medication at the prescribed rate and dosage and will keep the medication in its respective labeled container.",
    "I understand that Night & Day Medical only treats patients over the age of 30 with documented symptoms of hormone deficiencies (Hypogonadism and Adult Growth Hormone Deficiency). No prescription will be provided unless a clinical need exists based on required lab work, physician consultation, and current health history through either patient's personal physician or a Night & Day Medical - affiliated physician. Agreeing to lab work does not automatically qualify patient to clinically necessity and prescription of HRT.",
    "I understand that Night & Day Medical does not carry Malpractice Insurance.",
    "I understand that once my medical chart is established, I am an active patient for 12 months and may request consultations and place orders throughout that period. Renewed lab work and a physical exam are required annually to maintain active patient status.",
  ];

  tmaItems.forEach(function(item, idx) {
    checkSpace(30);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.sage);
    doc.text((idx + 1) + ".", MARGIN + 8, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.charcoal);
    var lines = doc.splitTextToSize(item, CONTENT_W - 28);
    doc.text(lines, MARGIN + 22, y);
    y += lines.length * 8.5 + 3;
  });

  // SIGNATURE BLOCK
  checkSpace(90);
  y += 6;
  divider();

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.charcoal);
  doc.text("AGREEMENT STATUS:  " + (d.tmaAgreed ? "ACCEPTED" : "NOT ACCEPTED"), MARGIN + 8, y);
  y += 18;

  if (d.tmaAgreed && d.signatureDataUrl) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.gray);
    doc.text("Patient Signature:", MARGIN + 8, y);
    y += 4;
    try {
      doc.addImage(d.signatureDataUrl, "PNG", MARGIN + 8, y, 180, 50);
      y += 55;
    } catch (e) {
      doc.setFont("helvetica", "normal");
      doc.text("[Signature image could not be embedded]", MARGIN + 8, y + 10);
      y += 20;
    }
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.5);
    doc.line(MARGIN + 8, y, MARGIN + 220, y);
    y += 14;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.charcoal);
    doc.text("Printed Name:  " + ((d.firstName || "") + " " + (d.lastName || "")), MARGIN + 8, y);
    y += 12;
    doc.text("Date Signed:  " + today, MARGIN + 8, y);
    y += 12;
    if (d.signatureTimestamp) {
      doc.text("Timestamp:  " + d.signatureTimestamp, MARGIN + 8, y);
      y += 10;
    }
    if (d.signatureUA) {
      var uaShort = d.signatureUA.length > 80 ? d.signatureUA.substring(0, 80) + "..." : d.signatureUA;
      doc.setFontSize(6);
      doc.text("User Agent:  " + uaShort, MARGIN + 8, y);
      y += 10;
    }
    y += 4;
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.gray);
    var legalNote = "This electronic signature constitutes a legally binding agreement under the Electronic Signatures in Global and National Commerce Act (ESIGN Act, 15 U.S.C. \u00A7 7001) and the Uniform Electronic Transactions Act (UETA).";
    var legalLines = doc.splitTextToSize(legalNote, CONTENT_W - 16);
    doc.text(legalLines, MARGIN + 8, y);
    y += legalLines.length * 8 + 4;
  }

  // Footer on every page
  var totalPages = doc.getNumberOfPages();
  for (var p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.gray);
    doc.text("Night & Day Medical \u2014 Confidential Patient Record \u2014 Page " + p + " of " + totalPages, W / 2, 770, { align: "center" });
    doc.text("Generated " + today, W / 2, 780, { align: "center" });
  }

  return doc.output("arraybuffer");
}

// ========== HTML EMAIL TEMPLATE (Manus format + v8 fields) ==========
function generateEmailHTML(d) {
  var fullName = (d.lastName || "") + ", " + (d.firstName || "");
  var symptomList = d.sex === "Female" ? [
    { id: "fatigue", label: "Fatigue / Low energy" }, { id: "libido", label: "Low libido / Sexual dysfunction" },
    { id: "brainfog", label: "Brain fog / Poor concentration" }, { id: "weight", label: "Weight gain / Difficulty losing weight" },
    { id: "mood", label: "Mood swings / Anxiety / Depression" }, { id: "sleep", label: "Sleep issues / Insomnia" },
    { id: "hotflash", label: "Hot flashes / Night sweats" }, { id: "hair", label: "Hair thinning / Hair loss" },
    { id: "irregular", label: "Irregular periods / Menstrual changes" }, { id: "dryness", label: "Vaginal dryness / Discomfort" },
    { id: "joint", label: "Joint pain / Inflammation" }, { id: "immune", label: "Frequent illness / Weak immunity" },
    { id: "aging", label: "Accelerated aging / Skin changes" },
  ] : [
    { id: "fatigue", label: "Fatigue / Low energy" }, { id: "libido", label: "Low libido / Sexual dysfunction" },
    { id: "brainfog", label: "Brain fog / Poor concentration" }, { id: "weight", label: "Weight gain / Difficulty losing weight" },
    { id: "mood", label: "Mood changes / Irritability / Depression" }, { id: "sleep", label: "Sleep issues / Insomnia" },
    { id: "muscle", label: "Muscle loss / Weakness" }, { id: "hair", label: "Hair thinning / Hair loss" },
    { id: "erection", label: "Erectile dysfunction" }, { id: "recovery", label: "Slow recovery from exercise / injury" },
    { id: "joint", label: "Joint pain / Inflammation" }, { id: "immune", label: "Frequent illness / Weak immunity" },
    { id: "aging", label: "Accelerated aging / Skin changes" },
  ];
  var symptoms = (d.symptoms || []).map(function(id) {
    var m = symptomList.find(function(s) { return s.id === id; });
    return m ? m.label : id;
  });
  var conditions = d.conditions || [];
  var idStatus = d.idBypassed ? "Will provide separately" : (d.idPreview ? "Uploaded (embedded in PDF)" : "Not provided");
  var serviceLabels = (d.serviceInterests || []).map(function(id) { return SERVICE_MAP[id] || id; });
  var paymentLabel = d.paymentPlan === "consult" ? "$99 \u2014 Initial Consultation" : "$299 \u2014 Complete Wellness Evaluation";

  return '<!DOCTYPE html><html><head><style>' +
    'body{font-family:Arial,sans-serif;background:#f7f3ef;margin:0;padding:20px}' +
    '.container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)}' +
    '.header{background:#7D5A5A;padding:20px;text-align:center;color:#fff}' +
    '.header h1{margin:0;font-size:18px;letter-spacing:1px}' +
    '.header p{margin:4px 0 0;font-size:12px;opacity:0.85}' +
    '.patient-bar{background:#5B8A72;padding:12px 20px;color:#fff;display:flex;justify-content:space-between}' +
    '.patient-bar span{font-size:13px}' +
    '.content{padding:20px}' +
    '.section{margin-bottom:16px}' +
    '.section-title{font-size:11px;font-weight:bold;color:#7D5A5A;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f0ece8;padding-bottom:6px;margin-bottom:10px}' +
    '.row{display:flex;padding:4px 0;font-size:13px;border-bottom:1px solid #f8f5f2}' +
    '.label{width:140px;color:#8c8279;font-weight:bold;flex-shrink:0;font-size:11px;text-transform:uppercase}' +
    '.value{color:#2d2d2d;flex:1}' +
    '.tag{display:inline-block;background:#f0ece8;padding:3px 8px;border-radius:4px;font-size:11px;margin:2px;color:#5c544c}' +
    '.status-bar{background:#f7f3ef;padding:12px 20px;text-align:center;font-size:11px;color:#8c8279}' +
    '.alert{background:#fff5f5;border:1px solid #fed7d7;border-radius:6px;padding:10px;margin:10px 0;color:#c53030;font-size:12px;font-weight:bold}' +
    '</style></head><body>' +
    '<div class="container">' +
    '<div class="header"><h1>NIGHT & DAY MEDICAL</h1><p>New Patient Intake</p></div>' +
    '<div class="patient-bar"><span><strong>' + fullName + '</strong></span><span>DOB: ' + (d.dob || "N/A") + ' | ' + (d.sex || "N/A") + '</span></div>' +
    '<div class="content">' +

    // Service Interests (v8)
    (serviceLabels.length > 0 ?
      '<div class="section"><div class="section-title">Service Interests</div>' +
      serviceLabels.map(function(s) { return '<span class="tag">' + s + '</span>'; }).join(" ") +
      '</div>' : '') +

    // Contact
    '<div class="section"><div class="section-title">Contact Information</div>' +
    '<div class="row"><div class="label">Email</div><div class="value">' + (d.email || "") + '</div></div>' +
    '<div class="row"><div class="label">Phone</div><div class="value">' + (d.phone || "") + '</div></div>' +
    '<div class="row"><div class="label">Address</div><div class="value">' + (d.address || "") + ', ' + (d.city || "") + ', ' + (d.state || "") + ' ' + (d.zip || "") + '</div></div>' +
    '<div class="row"><div class="label">Preferred</div><div class="value">' + (d.contactMethod || "Not specified") + '</div></div>' +
    '<div class="row"><div class="label">Referral</div><div class="value">' + (d.referralSource || "Not specified") + '</div></div>' +
    '</div>' +

    // Symptoms
    '<div class="section"><div class="section-title">Chief Complaints</div>' +
    (symptoms.length > 0 ? symptoms.map(function(s) { return '<span class="tag">' + s + '</span>'; }).join(" ") : '<div class="value">None reported</div>') +
    '<div class="row" style="margin-top:8px"><div class="label">Duration</div><div class="value">' + (d.symptomDuration || "Not specified") + '</div></div>' +
    (d.symptomNotes ? '<div class="row"><div class="label">Notes</div><div class="value">' + d.symptomNotes + '</div></div>' : '') +
    '</div>' +

    // Allergies
    '<div class="section"><div class="section-title">Allergies</div>' +
    (d.hasAllergies === "Yes"
      ? '<div class="alert">\u26A0\uFE0F ALLERGIES: ' + (d.allergies || "Yes \u2014 details not specified") + '</div>'
      : '<div class="row"><div class="value">NKDA (No Known Drug Allergies)</div></div>') +
    '</div>' +

    // Conditions
    '<div class="section"><div class="section-title">Medical Conditions</div>' +
    (conditions.length > 0 ? conditions.map(function(c) { return '<span class="tag">' + c + '</span>'; }).join(" ") : '<div class="value">None reported</div>') +
    '</div>' +

    // Medications, Surgeries, Family Hx
    '<div class="section"><div class="section-title">Medications & History</div>' +
    '<div class="row"><div class="label">Medications</div><div class="value">' + (d.medications || "None") + '</div></div>' +
    '<div class="row"><div class="label">Surgeries</div><div class="value">' + (d.surgeries || "None") + '</div></div>' +
    '<div class="row"><div class="label">Family Hx</div><div class="value">' + (d.familyHistory || "None") + '</div></div>' +
    '<div class="row"><div class="label">PCP</div><div class="value">' + (d.pcpName || "N/A") + (d.pcpPhone ? ' \u2014 ' + d.pcpPhone : '') + '</div></div>' +
    '</div>' +

    // TMA + Payment Status
    '<div class="section"><div class="section-title">Agreement & Status</div>' +
    '<div class="row"><div class="label">TMA Signed</div><div class="value">' + (d.tmaAgreed ? '\u2705 Yes \u2014 Drawn signature captured' : '\u274C No') + '</div></div>' +
    '<div class="row"><div class="label">Photo ID</div><div class="value">' + idStatus + '</div></div>' +
    '<div class="row"><div class="label">Payment Plan</div><div class="value">' + paymentLabel + '</div></div>' +
    '<div class="row"><div class="label">Payment</div><div class="value">\u23F3 Pending Stripe confirmation</div></div>' +
    '</div>' +

    '</div>' +
    '<div class="status-bar">Submitted ' + new Date().toLocaleString("en-US", { timeZone: "America/New_York" }) + ' ET \u2014 Full intake packet attached as PDF (print-ready chart)</div>' +
    '</div></body></html>';
}

// ========== API HANDLER ==========
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    var d = req.body;
    var fullName = (d.lastName || "") + ", " + (d.firstName || "");
    var planLabel = d.paymentPlan === "consult" ? "[$99 Consult]" : "[$299 Full]";
    var subject = fullName + " \u2014 DOB: " + (d.dob || "N/A") + " \u2014 New Patient Intake " + planLabel;

    // Generate PDF
    var pdfBuffer = generateIntakePDF(d);
    var pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    // Generate email HTML
    var html = generateEmailHTML(d);

    // File name for PDF
    var safeName = (d.lastName || "Patient").replace(/[^a-zA-Z]/g, "") + "_" + (d.firstName || "").replace(/[^a-zA-Z]/g, "");
    var fileName = "NDM_Intake_" + safeName + "_" + new Date().toISOString().split("T")[0] + ".pdf";

    // Build attachments - always include PDF
    var attachments = [
      { filename: fileName, content: pdfBase64, type: "application/pdf" },
    ];

    // Attach driver's license image separately if available (Manus feature)
    if (d.idPreview && typeof d.idPreview === "string" && d.idPreview.startsWith("data:image")) {
      try {
        var idBase64 = d.idPreview.split(",")[1];
        var idMime = d.idPreview.match(/data:(.*?);/);
        var idType = idMime ? idMime[1] : "image/jpeg";
        var idExt = idType.includes("png") ? "png" : "jpg";
        attachments.push({
          filename: "PhotoID_" + safeName + "." + idExt,
          content: idBase64,
          type: idType,
        });
      } catch (imgErr) {
        console.warn("Could not attach ID image:", imgErr.message);
      }
    }

    // Send email via Resend
    var result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Night & Day Medical <intake@resend.dev>",
      to: NOTIFY_EMAILS,
      subject: subject,
      html: html,
      attachments: attachments,
    });

    console.log("Email sent:", result);
    return res.status(200).json({ success: true, id: result.data?.id });

  } catch (error) {
    console.error("Submit intake error:", error);
    return res.status(500).json({ error: "Failed to process submission", details: error.message });
  }
}
