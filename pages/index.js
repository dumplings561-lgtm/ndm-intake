import { useState, useRef, useEffect, useCallback } from "react";

// ============ CONFIGURATION ============
var STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_28EdR2gm1bhP01R4WM3gk00";
var SUBMIT_URL = "/api/submit-intake";
var STORAGE_KEY = "ndm_intake_data";
var STORAGE_STEP_KEY = "ndm_intake_step";

// ============ NDM COLOR SCHEME ============
const C = {
  rose: "#7D5A5A",
  roseDark: "#5E3F3F",
  roseLight: "#A07878",
  sage: "#5B8A72",
  sageDark: "#4A7360",
  sageLight: "#7BAF97",
  cream: "#F7F3EF",
  creamDark: "#EDE7E0",
  warmWhite: "#FDFBF9",
  white: "#FFFFFF",
  charcoal: "#2D2D2D",
  gray100: "#F0ECE8",
  gray200: "#D9D2CA",
  gray300: "#B8AFA5",
  gray400: "#8C8279",
  gray600: "#5C544C",
  gray800: "#3A3530",
  red: "#C0392B",
  green: "#5B8A72",
  redAccent: "#C0392B",
};

const SYMPTOMS_MEN = [
  { id: "fatigue", label: "Fatigue / Low energy", icon: "⚡" },
  { id: "libido", label: "Low libido / Sexual dysfunction", icon: "💔" },
  { id: "brainfog", label: "Brain fog / Poor concentration", icon: "🧠" },
  { id: "weight", label: "Weight gain / Difficulty losing weight", icon: "⚖️" },
  { id: "mood", label: "Mood changes / Irritability / Depression", icon: "😤" },
  { id: "sleep", label: "Sleep issues / Insomnia", icon: "🌙" },
  { id: "muscle", label: "Muscle loss / Weakness", icon: "💪" },
  { id: "hair", label: "Hair thinning / Hair loss", icon: "✂️" },
  { id: "erection", label: "Erectile dysfunction", icon: "🔻" },
  { id: "recovery", label: "Slow recovery from exercise", icon: "🏃" },
];
const SYMPTOMS_WOMEN = [
  { id: "fatigue", label: "Fatigue / Low energy", icon: "⚡" },
  { id: "libido", label: "Low libido / Sexual dysfunction", icon: "💔" },
  { id: "brainfog", label: "Brain fog / Poor concentration", icon: "🧠" },
  { id: "weight", label: "Weight gain / Difficulty losing weight", icon: "⚖️" },
  { id: "mood", label: "Mood swings / Anxiety / Depression", icon: "😤" },
  { id: "sleep", label: "Sleep issues / Insomnia", icon: "🌙" },
  { id: "hotflash", label: "Hot flashes / Night sweats", icon: "🔥" },
  { id: "hair", label: "Hair thinning / Hair loss", icon: "✂️" },
  { id: "irregular", label: "Irregular periods / Menstrual changes", icon: "📅" },
  { id: "dryness", label: "Vaginal dryness / Discomfort", icon: "💧" },
];
const MEDICAL_CONDITIONS = [
  "Heart Disease", "DVT", "Arterial Disease", "Diabetes", "Cancer",
  "High Blood Pressure", "Chest Pain/Tightness", "Shortness of Breath",
  "Swollen Ankles", "Palpitations", "Lightheadedness", "Frequent Urination",
  "Rheumatic Fever", "Asthma", "Bronchitis", "Pneumonia", "Persistent Cough",
  "T.B.", "Hay Fever", "Nausea/Vomiting", "Constipation/Diarrhea",
  "Blood in Stool", "Ulcers", "Change in Bowel Habits", "Unexplained Weight Change",
  "Hemorrhoids", "Gall Bladder Disease", "Colitis", "Hepatitis/Jaundice",
  "Thyroid Disease", "Indigestion", "Headache", "Kidney Stones", "Arthritis",
  "Low Back Problems", "Skin Diseases", "Blood Disorders",
  "Anxiety", "Depression", "Anemia", "Gout"
];
const TMA_TEXT = [
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
  "I understand that Night & Day Medical does not carry Malpractice Insurance."
];
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const NY_STATES = ["NY"];
const TOTAL_STEPS = 7;

// ============ IMAGE PROCESSING UTILITY ============
function processImage(file, maxDim, quality, callback) {
  var reader = new FileReader();
  reader.onload = function(ev) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement("canvas");
      var w = img.width;
      var h = img.height;
      // Scale down if needed
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext("2d");
      // Drawing to canvas auto-corrects EXIF orientation in modern browsers
      ctx.drawImage(img, 0, 0, w, h);
      var dataUrl = canvas.toDataURL("image/jpeg", quality || 0.85);
      callback(dataUrl);
    };
    img.onerror = function() {
      // Fallback: use raw data URL
      callback(ev.target.result);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

// ============ SHARED COMPONENTS ============
function ProgressBar({ step }) {
  const pct = (step / TOTAL_STEPS) * 100;
  return (
    <div style={{ width: "100%", maxWidth: 640, margin: "0 auto 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: C.gray400, fontFamily: "'Lato', sans-serif", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        <span>Step {step} of {TOTAL_STEPS}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 5, background: C.gray200, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: C.sage, borderRadius: 3, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function StepHeader({ title, subtitle }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, color: C.charcoal, margin: 0, fontFamily: "'Merriweather', serif" }}>{title}</h2>
      <div style={{ width: 40, height: 3, background: C.redAccent, margin: "10px auto 0", borderRadius: 2 }} />
      {subtitle && (
        <p style={{ fontSize: 14, color: C.gray400, marginTop: 10, fontFamily: "'Lato', sans-serif", lineHeight: 1.6 }}>{subtitle}</p>
      )}
    </div>
  );
}

function Card({ children, style: s }) {
  return (
    <div style={{ background: C.white, borderRadius: 12, padding: "32px 28px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.03)", border: "1px solid " + C.gray100, ...s }}>
      {children}
    </div>
  );
}

function InputField({ label, type, value, onChange, required, placeholder, options, half, maxLength }) {
  const t = type || "text";
  const base = { width: "100%", padding: "11px 14px", background: C.cream, border: "1px solid " + C.gray200, borderRadius: 8, color: C.gray800, fontSize: 14, fontFamily: "'Lato', sans-serif", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" };
  const focus = function(e) { e.target.style.borderColor = C.sage; e.target.style.boxShadow = "0 0 0 3px rgba(91,138,114,0.15)"; };
  const blur = function(e) { e.target.style.borderColor = C.gray200; e.target.style.boxShadow = "none"; };
  return (
    <div style={{ flex: half ? "1 1 47%" : "1 1 100%", minWidth: half ? 180 : "auto" }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.gray600, marginBottom: 5, fontFamily: "'Lato', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label} {required && <span style={{ color: C.sage }}>*</span>}
      </label>
      {t === "select" ? (
        <select value={value} onChange={function(e) { onChange(e.target.value); }} style={Object.assign({}, base, { cursor: "pointer", appearance: "auto" })} onFocus={focus} onBlur={blur}>
          <option value="">Select...</option>
          {options.map(function(o) { return <option key={o} value={o}>{o}</option>; })}
        </select>
      ) : t === "textarea" ? (
        <textarea value={value} onChange={function(e) { onChange(e.target.value); }} placeholder={placeholder} rows={3} style={Object.assign({}, base, { resize: "vertical" })} onFocus={focus} onBlur={blur} />
      ) : (
        <input type={t} value={value} onChange={function(e) { onChange(e.target.value); }} placeholder={placeholder} maxLength={maxLength} style={base} onFocus={focus} onBlur={blur} />
      )}
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled, style: s }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={Object.assign({ padding: "13px 36px", background: disabled ? C.gray200 : C.rose, color: disabled ? C.gray400 : C.white, border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'Lato', sans-serif", transition: "all 0.25s", letterSpacing: "0.02em", boxShadow: disabled ? "none" : "0 4px 12px rgba(125,90,90,0.3)" }, s || {})}
      onMouseOver={function(e) { if (!disabled) e.target.style.background = C.roseDark; }}
      onMouseOut={function(e) { if (!disabled) e.target.style.background = C.rose; }}>
      {children}
    </button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "13px 24px", background: "transparent", color: C.gray400, border: "1px solid " + C.gray200, borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "'Lato', sans-serif", fontWeight: 600 }}>
      ← Back
    </button>
  );
}

function NavButtons({ onBack, onNext, nextLabel, disabled }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
      {onBack ? <BackBtn onClick={onBack} /> : <div />}
      <PrimaryBtn onClick={onNext} disabled={disabled}>{nextLabel || "Continue →"}</PrimaryBtn>
    </div>
  );
}

function FileUpload({ label, description, preview, onUpload, onRemove, required }) {
  function handleFile(e) {
    var f = e.target.files[0];
    if (!f) return;
    onUpload(f);
  }
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.gray600, marginBottom: 5, fontFamily: "'Lato', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label} {required && <span style={{ color: C.sage }}>*</span>}
      </label>
      {description && <p style={{ fontSize: 12, color: C.gray400, fontFamily: "'Lato', sans-serif", marginBottom: 10, lineHeight: 1.5 }}>{description}</p>}
      {!preview ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label style={{ flex: "1 1 45%", minWidth: 150, padding: "18px 14px", background: C.cream, border: "2px dashed " + C.gray200, borderRadius: 10, cursor: "pointer", textAlign: "center" }}
            onMouseOver={function(e) { e.currentTarget.style.borderColor = C.sage; }}
            onMouseOut={function(e) { e.currentTarget.style.borderColor = C.gray200; }}>
            <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />
            <div style={{ fontSize: 26, marginBottom: 4 }}>📸</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.charcoal, fontFamily: "'Lato', sans-serif" }}>Take Photo</div>
            <div style={{ fontSize: 11, color: C.gray400, fontFamily: "'Lato', sans-serif" }}>Open camera</div>
          </label>
          <label style={{ flex: "1 1 45%", minWidth: 150, padding: "18px 14px", background: C.cream, border: "2px dashed " + C.gray200, borderRadius: 10, cursor: "pointer", textAlign: "center" }}
            onMouseOver={function(e) { e.currentTarget.style.borderColor = C.sage; }}
            onMouseOut={function(e) { e.currentTarget.style.borderColor = C.gray200; }}>
            <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleFile} />
            <div style={{ fontSize: 26, marginBottom: 4 }}>📁</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.charcoal, fontFamily: "'Lato', sans-serif" }}>Upload File</div>
            <div style={{ fontSize: 11, color: C.gray400, fontFamily: "'Lato', sans-serif" }}>JPG, PNG, or PDF</div>
          </label>
        </div>
      ) : (
        <div style={{ position: "relative", display: "inline-block" }}>
          {typeof preview === "string" && preview.startsWith("data:image") ? (
            <img src={preview} alt="Preview" style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 10, border: "2px solid " + C.sage, objectFit: "contain" }} />
          ) : (
            <div style={{ padding: "16px 20px", background: C.cream, border: "1px solid " + C.sage, borderRadius: 10, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 26 }}>📄</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.charcoal, fontFamily: "'Lato', sans-serif" }}>{typeof preview === "string" ? preview : "Uploaded"}</div>
                <div style={{ fontSize: 11, color: C.green, fontFamily: "'Lato', sans-serif" }}>✓ Uploaded</div>
              </div>
            </div>
          )}
          <button onClick={onRemove} style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", background: C.red, color: "#fff", border: "none", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>×</button>
        </div>
      )}
    </div>
  );
}

// ============ STEP 0: WELCOME ============
function WelcomeStep({ onNext }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto", animation: "ndmFadeIn 0.6s ease" }}>
      <p style={{ fontSize: 16, color: C.gray600, lineHeight: 1.7, fontFamily: "'Lato', sans-serif", maxWidth: 460, margin: "0 auto" }}>
        Take the first step toward optimizing your health. Complete this confidential assessment and our medical team will create a personalized treatment plan for you.
      </p>
      <Card style={{ textAlign: "left", margin: "28px 0" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.charcoal, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, fontFamily: "'Lato', sans-serif" }}>3 Simple Steps</div>
        {[
          { n: "1", t: "Tell Us About Your Symptoms", d: "Quick 5-minute assessment so our medical team can understand your needs" },
          { n: "2", t: "Get Your Labs Done", d: "We handle everything — just visit a Labcorp near you or our New York location" },
          { n: "3", t: "Start Feeling Like Yourself Again", d: "Meet with our physician, get your personalized plan, and begin treatment" },
        ].map(function(s) {
          return (
            <div key={s.n} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.rose, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontWeight: 700, fontSize: 13, fontFamily: "'Lato', sans-serif" }}>{s.n}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.charcoal, fontFamily: "'Lato', sans-serif" }}>{s.t}</div>
                <div style={{ fontSize: 13, color: C.gray400, fontFamily: "'Lato', sans-serif", lineHeight: 1.4 }}>{s.d}</div>
              </div>
            </div>
          );
        })}
      </Card>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
        {["5-min assessment", "100% confidential", "Doctor reviewed"].map(function(t) {
          return (
            <span key={t} style={{ padding: "6px 16px", background: "rgba(91,138,114,0.08)", border: "1px solid rgba(91,138,114,0.25)", borderRadius: 20, fontSize: 12, color: C.sageDark, fontFamily: "'Lato', sans-serif", fontWeight: 600 }}>✓ {t}</span>
          );
        })}
      </div>
      <PrimaryBtn onClick={onNext} style={{ padding: "16px 48px", fontSize: 16 }}>Begin Assessment →</PrimaryBtn>
    </div>
  );
}

// ============ STEP 1: BASIC INFO (age restriction removed) ============
function BasicInfoStep({ data, setData, onNext, onBack }) {
  var u = function(k, v) { setData(function(p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
  var canProceed = data.firstName && data.lastName && data.email && data.phone && data.dob && data.sex;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", animation: "ndmFadeIn 0.5s ease" }}>
      <ProgressBar step={1} />
      <StepHeader title="About You" subtitle="Let's start with some basic information" />
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          <InputField label="First Name" value={data.firstName || ""} onChange={function(v) { u("firstName", v); }} required half />
          <InputField label="Last Name" value={data.lastName || ""} onChange={function(v) { u("lastName", v); }} required half />
          <InputField label="Email" type="email" value={data.email || ""} onChange={function(v) { u("email", v); }} required half />
          <InputField label="Phone" type="tel" value={data.phone || ""} onChange={function(v) { u("phone", v); }} required half />
          <div style={{ flex: "1 1 47%", minWidth: 180 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.gray600, marginBottom: 5, fontFamily: "'Lato', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>Date of Birth <span style={{ color: C.sage }}>*</span></label>
            <div style={{ position: "relative" }}>
              <input type="text" inputMode="numeric" placeholder="MM/DD/YYYY" maxLength={10} value={data.dob || ""}
                onChange={function(e) {
                  var raw = e.target.value.replace(/[^\d]/g, "");
                  var f = "";
                  for (var i = 0; i < raw.length && i < 8; i++) {
                    if (i === 2 || i === 4) f += "/";
                    f += raw[i];
                  }
                  u("dob", f);
                }}
                style={{ width: "100%", padding: "11px 40px 11px 14px", background: C.cream, border: "1px solid " + C.gray200, borderRadius: 8, color: C.gray800, fontSize: 14, fontFamily: "'Lato', sans-serif", outline: "none" }}
                onFocus={function(e) { e.target.style.borderColor = C.sage; }}
                onBlur={function(e) { e.target.style.borderColor = C.gray200; }} />
              <input type="date" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, opacity: 0.01, cursor: "pointer", padding: 0, border: "none" }}
                onChange={function(e) { if (e.target.value) { var p = e.target.value.split("-"); u("dob", p[1] + "/" + p[2] + "/" + p[0]); } }} />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 18, pointerEvents: "none", color: C.gray400 }}>📅</span>
            </div>
          </div>
          <InputField label="Sex" type="select" value={data.sex || ""} onChange={function(v) { u("sex", v); }} required options={["Male", "Female"]} half />
          <InputField label="Street Address" value={data.address || ""} onChange={function(v) { u("address", v); }} />
          <InputField label="City" value={data.city || ""} onChange={function(v) { u("city", v); }} half />
          <InputField label="State" type="select" value={data.state || ""} onChange={function(v) { u("state", v); }} options={US_STATES} half />
          <InputField label="Zip Code" value={data.zip || ""} onChange={function(v) { u("zip", v); }} half maxLength={5} />
          <InputField label="Preferred Contact" type="select" value={data.contactMethod || ""} onChange={function(v) { u("contactMethod", v); }} options={["Phone Call", "Text Message", "Email"]} half />
          <InputField label="How did you hear about us?" value={data.referralSource || ""} onChange={function(v) { u("referralSource", v); }} placeholder="Referral, online search, etc." />
        </div>
      </Card>
      <NavButtons onBack={onBack} onNext={onNext} disabled={!canProceed} />
    </div>
  );
}

// ============ STEP 2: SYMPTOMS ============
function SymptomsStep({ data, setData, onNext, onBack }) {
  var symptoms = data.sex === "Female" ? SYMPTOMS_WOMEN : SYMPTOMS_MEN;
  var selected = data.symptoms || [];
  var toggle = function(id) {
    setData(function(p) {
      var cur = p.symptoms || [];
      return Object.assign({}, p, { symptoms: cur.includes(id) ? cur.filter(function(x) { return x !== id; }) : cur.concat([id]) });
    });
  };
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", animation: "ndmFadeIn 0.5s ease" }}>
      <ProgressBar step={2} />
      <StepHeader title="Symptom Assessment" subtitle="Select all symptoms you are currently experiencing" />
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {symptoms.map(function(s) {
            var on = selected.includes(s.id);
            return (
              <div key={s.id} onClick={function() { toggle(s.id); }}
                style={{ padding: "14px 12px", background: on ? "rgba(91,138,114,0.06)" : C.cream, border: "1.5px solid " + (on ? C.sage : C.gray200), borderRadius: 8, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <span style={{ fontSize: 13, color: on ? C.charcoal : C.gray600, fontFamily: "'Lato', sans-serif", fontWeight: on ? 700 : 400, lineHeight: 1.3 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 14 }}>
          <InputField label="How long have you experienced these symptoms?" type="select" value={data.symptomDuration || ""} onChange={function(v) { setData(function(p) { return Object.assign({}, p, { symptomDuration: v }); }); }} options={["Less than 3 months", "3-6 months", "6-12 months", "1-2 years", "2+ years"]} />
          <InputField label="Additional details (optional)" type="textarea" value={data.symptomNotes || ""} onChange={function(v) { setData(function(p) { return Object.assign({}, p, { symptomNotes: v }); }); }} placeholder="Anything else you'd like us to know..." />
        </div>
      </Card>
      <NavButtons onBack={onBack} onNext={onNext} disabled={selected.length === 0} />
    </div>
  );
}

// ============ STEP 3: MEDICAL HISTORY ============
function MedicalHistoryStep({ data, setData, onNext, onBack }) {
  var conditions = data.conditions || [];
  var toggleC = function(c) {
    setData(function(p) {
      var cur = p.conditions || [];
      return Object.assign({}, p, { conditions: cur.includes(c) ? cur.filter(function(x) { return x !== c; }) : cur.concat([c]) });
    });
  };
  var u = function(k, v) { setData(function(p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", animation: "ndmFadeIn 0.5s ease" }}>
      <ProgressBar step={3} />
      <StepHeader title="Medical History" subtitle="This helps our physicians provide safe, effective care" />
      <Card>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8, display: "block", fontFamily: "'Lato', sans-serif" }}>Allergies to medications or other substances?</label>
          <div style={{ display: "flex", gap: 10 }}>
            {["No", "Yes"].map(function(o) {
              return (
                <div key={o} onClick={function() { u("hasAllergies", o); }} style={{ padding: "9px 24px", background: data.hasAllergies === o ? "rgba(91,138,114,0.06)" : C.cream, border: "1.5px solid " + (data.hasAllergies === o ? C.sage : C.gray200), borderRadius: 6, cursor: "pointer", color: data.hasAllergies === o ? C.charcoal : C.gray400, fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: 600 }}>{o}</div>
              );
            })}
          </div>
          {data.hasAllergies === "Yes" && <div style={{ marginTop: 10 }}><InputField label="List allergies & reactions" type="textarea" value={data.allergies || ""} onChange={function(v) { u("allergies", v); }} /></div>}
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10, display: "block", fontFamily: "'Lato', sans-serif" }}>Past & current conditions (select all that apply)</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
            {MEDICAL_CONDITIONS.map(function(c) {
              var on = conditions.includes(c);
              return (
                <div key={c} onClick={function() { toggleC(c); }} style={{ padding: "7px 8px", background: on ? "rgba(91,138,114,0.06)" : "transparent", border: "1px solid " + (on ? C.sage : C.gray200), borderRadius: 5, cursor: "pointer", fontSize: 11, color: on ? C.sageDark : C.gray400, fontFamily: "'Lato', sans-serif", fontWeight: on ? 700 : 400, textAlign: "center", lineHeight: 1.3 }}>{c}</div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          <InputField label="Current medications" type="textarea" value={data.medications || ""} onChange={function(v) { u("medications", v); }} placeholder="Prescription, OTC, vitamins, herbs + dosages..." />
          <InputField label="Past surgeries / hospitalizations" type="textarea" value={data.surgeries || ""} onChange={function(v) { u("surgeries", v); }} placeholder="Include approximate dates..." />
          <InputField label="Family history" type="textarea" value={data.familyHistory || ""} onChange={function(v) { u("familyHistory", v); }} placeholder="Cancer, heart disease, diabetes, strokes..." />
          <InputField label="Primary Care Physician" value={data.pcpName || ""} onChange={function(v) { u("pcpName", v); }} half placeholder="Name" />
          <InputField label="PCP Phone" value={data.pcpPhone || ""} onChange={function(v) { u("pcpPhone", v); }} half placeholder="Phone" />
        </div>
      </Card>
       <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

// ============ STEP 4: ID UPLOAD (with image processing) ============
function IDUploadStep({ data, setData, onNext, onBack }) {
  var u = function(k, v) { setData(function(p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
  var bypass = data.idBypassed || false;
  var canProceed = data.idPreview || bypass;

  function handleIDUpload(f) {
    if (f.type.startsWith("image/")) {
      // Process image: resize, correct orientation, compress
      processImage(f, 1200, 0.85, function(dataUrl) {
        u("idPreview", dataUrl);
      });
    } else {
      u("idPreview", f.name);
    }
  }

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", animation: "ndmFadeIn 0.5s ease" }}>
      <ProgressBar step={4} />
      <StepHeader title="Photo ID Verification" subtitle="Upload a clear photo of your government-issued ID" />
      <Card>
        {!bypass && (
          <FileUpload
            label="Driver's License / Photo ID"
            description="Please upload the front of your driver's license or government-issued photo ID."
            required
            preview={data.idPreview}
            onUpload={handleIDUpload}
            onRemove={function() { u("idPreview", null); }}
          />
        )}
        <div style={{ marginTop: bypass ? 0 : 20 }}>
          <div onClick={function() { setData(function(p) { return Object.assign({}, p, { idBypassed: !p.idBypassed }); }); }}
            style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 14, background: bypass ? "rgba(91,138,114,0.05)" : C.cream, border: "1.5px solid " + (bypass ? C.sage : C.gray200), borderRadius: 8, cursor: "pointer" }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, border: "2px solid " + (bypass ? C.sage : C.gray200), background: bypass ? C.sage : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              {bypass && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: bypass ? C.charcoal : C.gray400, fontFamily: "'Lato', sans-serif", lineHeight: 1.5 }}>I have already provided my ID or will send it separately to my clinical advisor.</span>
          </div>
        </div>
      </Card>
      <NavButtons onBack={onBack} onNext={onNext} disabled={!canProceed} />
    </div>
  );
}

// ============ STEP 5: TMA + CANVAS E-SIGNATURE ============
function TMAStep({ data, setData, onNext, onBack }) {
  var agreed = data.tmaAgreed || false;
  var fullName = (data.firstName || "") + " " + (data.lastName || "");
  var canvasRef = useRef(null);
  var isDrawingRef = useRef(false);
  var hasDrawnRef = useRef(false);
  var _hs = useState(!!data.signatureDataUrl);
  var hasSigned = _hs[0];
  var setHasSigned = _hs[1];

  useEffect(function() {
    if (!agreed) return;
    var canvas = canvasRef.current;
    if (!canvas) return;

    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = 240;
    var ctx = canvas.getContext("2d");
    ctx.scale(2, 2);

    ctx.strokeStyle = C.gray200;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 95);
    ctx.lineTo(rect.width - 20, 95);
    ctx.stroke();

    if (data.signatureDataUrl) {
      var img = new Image();
      img.onload = function() { ctx.drawImage(img, 0, 0, rect.width, 120); };
      img.src = data.signatureDataUrl;
      hasDrawnRef.current = true;
    }

    function getPos(e) {
      var r = canvas.getBoundingClientRect();
      var clientX, clientY;
      if (e.touches) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
      else { clientX = e.clientX; clientY = e.clientY; }
      return { x: clientX - r.left, y: clientY - r.top };
    }

    function startDraw(e) {
      e.preventDefault();
      isDrawingRef.current = true;
      hasDrawnRef.current = true;
      var pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = C.charcoal;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }

    function draw(e) {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      var pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    function endDraw() {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      var sigData = canvas.toDataURL("image/png");
      setData(function(p) {
        return Object.assign({}, p, {
          signatureDataUrl: sigData,
          signatureTimestamp: new Date().toISOString(),
          signatureUA: navigator.userAgent,
        });
      });
      setHasSigned(true);
    }

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDraw);
    canvas.addEventListener("mouseleave", endDraw);
    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", endDraw);

    return function() {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", endDraw);
      canvas.removeEventListener("mouseleave", endDraw);
      canvas.removeEventListener("touchstart", startDraw);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", endDraw);
    };
  }, [agreed]);

  function clearSignature() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = C.gray200;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 95);
    ctx.lineTo(canvas.width - 20, 95);
    ctx.stroke();
    hasDrawnRef.current = false;
    setHasSigned(false);
    setData(function(p) { return Object.assign({}, p, { signatureDataUrl: null, signatureTimestamp: null, signatureUA: null }); });
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", animation: "ndmFadeIn 0.5s ease" }}>
      <ProgressBar step={5} />
      <StepHeader title="Therapy Management Agreement" subtitle="Please read carefully and sign below" />
      <Card>
        <div style={{ background: C.cream, border: "1px solid " + C.gray200, borderRadius: 8, padding: 20, maxHeight: 320, overflowY: "auto", marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: C.gray600, lineHeight: 1.7, marginBottom: 14, fontFamily: "'Lato', sans-serif" }}>
            This agreement between <strong style={{ color: C.charcoal }}>{fullName}</strong> ("Patient") and <strong style={{ color: C.charcoal }}>Night & Day Medical</strong> ("NDM") establishes guidelines and conditions for the use of hormone replacement therapy ("HRT") involving DEA "controlled" or "scheduled" medications. NDM and patient agree that these guidelines and conditions are an essential factor in maintaining a successful patient/practitioner relationship. Adverse side effects and/or physical/psychological dependence may develop after repeated use of these medications and, therefore, these agents are prescribed with caution.
          </p>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.charcoal, marginBottom: 10, fontFamily: "'Lato', sans-serif" }}>The patient agrees and accepts the following conditions:</p>
          {TMA_TEXT.map(function(t, i) {
            return (
              <p key={i} style={{ fontSize: 12, color: C.gray600, lineHeight: 1.65, marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>
                <strong style={{ color: C.sage }}>{i + 1}.</strong> {t}
              </p>
            );
          })}
        </div>
        <div onClick={function() { setData(function(p) { return Object.assign({}, p, { tmaAgreed: !p.tmaAgreed }); }); }}
          style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 14, background: agreed ? "rgba(91,138,114,0.05)" : C.cream, border: "1.5px solid " + (agreed ? C.sage : C.gray200), borderRadius: 8, cursor: "pointer", marginBottom: 20 }}>
          <div style={{ width: 20, height: 20, borderRadius: 4, border: "2px solid " + (agreed ? C.sage : C.gray200), background: agreed ? C.sage : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
            {agreed && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ fontSize: 13, color: agreed ? C.charcoal : C.gray400, fontFamily: "'Lato', sans-serif", lineHeight: 1.5 }}>I have read and agree to the terms of this Therapy Management Agreement.</span>
        </div>
        {agreed && (
          <div style={{ animation: "ndmFadeIn 0.3s ease" }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6, display: "block", fontFamily: "'Lato', sans-serif" }}>E-Signature — Draw your signature below</label>
            <div style={{ position: "relative", border: "1px solid " + (hasSigned ? C.sage : C.gray200), borderRadius: 8, overflow: "hidden", background: "#fff", touchAction: "none" }}>
              <canvas ref={canvasRef} style={{ width: "100%", height: 120, cursor: "crosshair", display: "block" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <div style={{ fontSize: 11, color: hasSigned ? C.green : C.gray300, fontFamily: "'Lato', sans-serif" }}>
                {hasSigned ? "✓ Signature captured — you're all set" : "Please draw your signature above using your finger or mouse"}
              </div>
              <button onClick={clearSignature} style={{ padding: "4px 12px", background: "transparent", border: "1px solid " + C.gray200, borderRadius: 4, fontSize: 11, color: C.gray400, cursor: "pointer", fontFamily: "'Lato', sans-serif" }}>Clear</button>
            </div>
            {hasSigned && (
              <div style={{ marginTop: 10, padding: 10, background: C.cream, borderRadius: 6, fontSize: 10, color: C.gray400, fontFamily: "'Lato', sans-serif", lineHeight: 1.5 }}>
                <strong>Audit Trail:</strong> Signed by {fullName} on {new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET. This electronic signature constitutes a legally binding agreement under the ESIGN Act (15 U.S.C. § 7001) and UETA.
              </div>
            )}
          </div>
        )}
      </Card>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Proceed to Payment →" disabled={!agreed || !hasSigned} />
    </div>
  );
}

// ============ STEP 6: PAYMENT ============
function PaymentStep({ data, setData, onNext, onBack }) {
  var processing = data._processing || false;
  var isNY = NY_STATES.includes(data.state);

  var handlePayment = function() {
    setData(function(p) { return Object.assign({}, p, { _processing: true }); });

    var stripeUrl = STRIPE_PAYMENT_LINK + "?prefilled_email=" + encodeURIComponent(data.email || "");
    var stripeWindow = window.open(stripeUrl, "_blank");
    var popupBlocked = !stripeWindow || stripeWindow.closed;

    fetch(SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(function(response) {
      if (!response.ok) {
        return response.json().then(function(err) { throw new Error(err.details || "Server error " + response.status); });
      }
      return response.json();
    }).then(function(result) {
      console.log("Intake submitted successfully:", result);
      if (popupBlocked) { window.location.href = stripeUrl; return; }
      setData(function(p) { return Object.assign({}, p, { _processing: false, paymentComplete: true, paymentDate: new Date().toISOString() }); });
      try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(STORAGE_STEP_KEY); } catch(e) {}
      onNext();
    }).catch(function(err) {
      console.error("Submission error:", err);
      alert("There was an issue submitting your information. Your payment page should still be open. Please contact Anthony at (561) 427-9635 if the problem persists.");
      if (popupBlocked) { window.location.href = stripeUrl; return; }
      setData(function(p) { return Object.assign({}, p, { _processing: false, paymentComplete: true }); });
      try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(STORAGE_STEP_KEY); } catch(e) {}
      onNext();
    });
  };

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", animation: "ndmFadeIn 0.5s ease" }}>
      <ProgressBar step={6} />
      <StepHeader title="Initial Consultation & Lab Work" subtitle="One-time payment to get started" />
      <Card>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 42, fontWeight: 700, color: C.charcoal, fontFamily: "'Merriweather', serif" }}>$299</div>
          <div style={{ fontSize: 13, color: C.gray400, fontFamily: "'Lato', sans-serif", marginTop: 4 }}>One-time initial payment</div>
        </div>
        <div style={{ background: C.cream, borderRadius: 8, padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.charcoal, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, fontFamily: "'Lato', sans-serif" }}>What's Included</div>
          {["Comprehensive hormone lab panel (Labcorp)", "Initial physician telehealth consultation", "Personalized treatment plan review", "Ongoing clinical support during onboarding"].map(function(item, i) {
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ color: C.sage, fontSize: 16, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 13, color: C.gray600, fontFamily: "'Lato', sans-serif" }}>{item}</span>
              </div>
            );
          })}
        </div>
        {isNY && (
          <div style={{ background: "rgba(91,138,114,0.06)", border: "1px solid rgba(91,138,114,0.25)", borderRadius: 8, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.sageDark, fontFamily: "'Lato', sans-serif", marginBottom: 6 }}>📍 Local Appointment Available</div>
            <p style={{ fontSize: 12, color: C.gray600, fontFamily: "'Lato', sans-serif", margin: 0, lineHeight: 1.5 }}>As a New York client, you may be able to complete your lab work and physical at one of our local offices. Your clinical advisor Anthony will coordinate with you after payment.</p>
          </div>
        )}
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: 14, marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: "#92400E", fontFamily: "'Lato', sans-serif", margin: 0, lineHeight: 1.5 }}>
            <strong>Note:</strong> You will not have to pay Labcorp directly — the provided requisition form is prepaid and covered by your initial onboarding payment. In addition, all proposed therapies are not covered by health insurance. By proceeding, you acknowledge that all services are to be paid out-of-pocket per the Therapy Management Agreement you signed.
          </p>
        </div>
        <PrimaryBtn onClick={handlePayment} disabled={processing} style={{ width: "100%", padding: "16px", fontSize: 16, textAlign: "center" }}>
          {processing ? "Processing..." : "Proceed to Secure Payment →"}
        </PrimaryBtn>
        <div style={{ textAlign: "center", marginTop: 12 }}><span style={{ fontSize: 11, color: C.gray400, fontFamily: "'Lato', sans-serif" }}>🔒 You'll be redirected to our secure payment page powered by Stripe</span></div>
      </Card>
      <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 28 }}><BackBtn onClick={onBack} /></div>
    </div>
  );
}

// ============ STEP 7: CONFIRMATION (simplified) ============
function ConfirmationStep({ data, setData }) {
  var isNY = NY_STATES.includes(data.state);
  var labcorpUrl = data.zip ? "https://www.labcorp.com/labs-and-appointments?zip=" + data.zip : "https://www.labcorp.com/labs-and-appointments";
  var editingEmail = data._editingEmail || false;
  var tempEmail = data._tempEmail || data.email;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", animation: "ndmFadeIn 0.6s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.sage, margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(91,138,114,0.35)" }}>
          <span style={{ fontSize: 34, color: "#fff" }}>✓</span>
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: C.charcoal, margin: 0, fontFamily: "'Merriweather', serif" }}>You're All Set, {data.firstName}!</h2>
        <div style={{ width: 40, height: 3, background: C.redAccent, margin: "10px auto 0", borderRadius: 2 }} />
        <p style={{ fontSize: 14, color: C.gray400, fontFamily: "'Lato', sans-serif", marginTop: 10 }}>Payment received. Here's what happens next.</p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.rose, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>1</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, fontFamily: "'Lato', sans-serif", marginBottom: 6 }}>Lab Work</div>
            <p style={{ fontSize: 13, color: C.gray600, fontFamily: "'Lato', sans-serif", lineHeight: 1.6, margin: "0 0 8px" }}>
              We will send your lab requisition form to{" "}
              {editingEmail ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <input type="email" value={tempEmail}
                    onChange={function(e) { setData(function(p) { return Object.assign({}, p, { _tempEmail: e.target.value }); }); }}
                    style={{ padding: "4px 8px", border: "1px solid " + C.sage, borderRadius: 4, fontSize: 13, fontFamily: "'Lato', sans-serif", outline: "none", width: 220 }} />
                  <button onClick={function() { setData(function(p) { return Object.assign({}, p, { email: p._tempEmail || p.email, _editingEmail: false }); }); }}
                    style={{ padding: "4px 10px", background: C.sage, color: "#fff", border: "none", borderRadius: 4, fontSize: 11, cursor: "pointer", fontWeight: 700 }}>Save</button>
                  <button onClick={function() { setData(function(p) { return Object.assign({}, p, { _tempEmail: p.email, _editingEmail: false }); }); }}
                    style={{ padding: "4px 8px", background: "transparent", color: C.gray400, border: "1px solid " + C.gray200, borderRadius: 4, fontSize: 11, cursor: "pointer" }}>Cancel</button>
                </span>
              ) : (
                <span>
                  <strong style={{ color: C.charcoal }}>{data.email}</strong>{" "}
                  <button onClick={function() { setData(function(p) { return Object.assign({}, p, { _editingEmail: true, _tempEmail: p.email }); }); }}
                    style={{ background: "transparent", border: "none", color: C.sage, fontSize: 12, cursor: "pointer", fontWeight: 700, textDecoration: "underline", padding: 0 }}>edit</button>
                </span>
              )}
              {" "}within 24 hours. Take it to any Labcorp location to have your blood drawn.
            </p>
            <div style={{ background: "#FFF5F5", border: "1px solid #FED7D7", borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <p style={{ fontSize: 13, color: "#C53030", fontFamily: "'Lato', sans-serif", fontWeight: 700, margin: 0, lineHeight: 1.5 }}>⚠️ FASTING A MINIMUM OF 12 HOURS IS RECOMMENDED TO ENSURE ACCURATE LAB RESULTS. WATER AND BLACK COFFEE/TEA ARE OK PRIOR TO DRAW.</p>
              <p style={{ fontSize: 12, color: "#C53030", fontFamily: "'Lato', sans-serif", fontWeight: 600, margin: "6px 0 0" }}>(Inform Labcorp you've fasted or they will not perform the draw)</p>
            </div>
            {isNY ? (
              <div style={{ background: "rgba(91,138,114,0.06)", border: "1px solid rgba(91,138,114,0.25)", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.sageDark, fontFamily: "'Lato', sans-serif", marginBottom: 4 }}>🏥 In-Person Option Available</div>
                <p style={{ fontSize: 12, color: C.gray600, margin: 0, fontFamily: "'Lato', sans-serif", lineHeight: 1.5 }}>Your clinical advisor Anthony will reach out to coordinate scheduling and provide location details.</p>
              </div>
            ) : (
              <div>
                <a href={labcorpUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "10px 20px", background: C.cream, border: "1px solid " + C.gray200, borderRadius: 6, color: C.charcoal, fontSize: 13, fontWeight: 600, textDecoration: "none", fontFamily: "'Lato', sans-serif" }}>🔍 Find a Labcorp Near {data.zip || "You"} →</a>
                <p style={{ fontSize: 11, color: C.gray400, fontFamily: "'Lato', sans-serif", marginTop: 8, fontStyle: "italic" }}>Enter your zip code and select "Routine Lab Work" when booking your appointment.</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.rose, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>2</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, fontFamily: "'Lato', sans-serif", marginBottom: 6 }}>Physical Examination</div>
            <p style={{ fontSize: 13, color: C.gray600, fontFamily: "'Lato', sans-serif", lineHeight: 1.6, margin: "0 0 10px" }}>A completed physical exam is required to proceed with treatment. Options:</p>
            <div style={{ fontSize: 12, color: C.gray600, fontFamily: "'Lato', sans-serif", lineHeight: 1.6, marginBottom: 12 }}>
              <div style={{ marginBottom: 6 }}><strong style={{ color: C.charcoal }}>✓ Recent Physical</strong> — If you have a physical within the last 12 months signed by a physician, email it to <a href="mailto:Anthony@nightdaymed.net" style={{ color: C.sage, fontWeight: 700 }}>Anthony@nightdaymed.net</a></div>
              <div style={{ marginBottom: 6 }}><strong style={{ color: C.charcoal }}>✓ Walk-In Clinic</strong> — Visit any clinic that offers basic wellness physicals. Your clinical advisor can provide the required form.</div>
              {isNY && <div><strong style={{ color: C.charcoal }}>✓ Local Office (New York)</strong> — Anthony will coordinate with you to schedule at our office.</div>}
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.rose, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>3</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, fontFamily: "'Lato', sans-serif", marginBottom: 6 }}>Physician Consultation</div>
            <p style={{ fontSize: 13, color: C.gray600, fontFamily: "'Lato', sans-serif", lineHeight: 1.6, margin: 0 }}>Once your lab results are in, we'll schedule a telehealth consultation with one of our physicians to review your results and discuss treatment options.</p>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.sage, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>4</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, fontFamily: "'Lato', sans-serif", marginBottom: 6 }}>Treatment Plan Review</div>
            <p style={{ fontSize: 13, color: C.gray600, fontFamily: "'Lato', sans-serif", lineHeight: 1.6, margin: 0 }}>Your Wellness Coordinator will walk you through personalized therapy options. Once you select your plan, medication ships directly to you from our compounding pharmacy for self-administration.</p>
          </div>
        </div>
      </Card>

      <Card style={{ textAlign: "center", background: C.rose }}>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: "0 0 8px", fontFamily: "'Lato', sans-serif" }}>Questions? We're here for you.</p>
        <a href="mailto:Anthony@nightdaymed.net" style={{ color: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none", fontFamily: "'Lato', sans-serif" }}>Anthony@nightdaymed.net</a>
        <div style={{ marginTop: 10 }}>
          <a href="tel:5614279635" style={{ color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", fontFamily: "'Lato', sans-serif" }}>Call or Text: (561) 427-9635</a>
        </div>
      </Card>
    </div>
  );
}

// ============ MAIN APP (with localStorage persistence) ============
export default function NDMIntake() {
  var _s = useState(0);
  var step = _s[0];
  var setStep = _s[1];
  var _d = useState({});
  var data = _d[0];
  var setData = _d[1];
  var _loaded = useState(false);
  var loaded = _loaded[0];
  var setLoaded = _loaded[1];

  useEffect(function() {
    try {
      var savedData = localStorage.getItem(STORAGE_KEY);
      var savedStep = localStorage.getItem(STORAGE_STEP_KEY);
      if (savedData) {
        var parsed = JSON.parse(savedData);
        var restoredStep = savedStep ? parseInt(savedStep, 10) : 0;
        if (restoredStep >= 7) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_STEP_KEY);
        } else {
          setData(parsed);
          setStep(restoredStep);
        }
      }
    } catch (e) {}
    setLoaded(true);
  }, []);

  useEffect(function() {
    if (!loaded) return;
    if (step >= 7) return;
    try {
      var toSave = Object.assign({}, data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      localStorage.setItem(STORAGE_STEP_KEY, step.toString());
    } catch (e) {}
  }, [data, step, loaded]);

  var handleSubmit = function() { setStep(7); };

  var goNext = function() {
    if (step === 6) { handleSubmit(); return; }
    setStep(function(s) { return s + 1; });
    try { window.scrollTo(0, 0); } catch (e) {}
  };
  var goBack = function() {
    setStep(function(s) { return s - 1; });
    try { window.scrollTo(0, 0); } catch (e) {}
  };

  if (!loaded) return null;

  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "32px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.rose, fontFamily: "'Merriweather', serif", letterSpacing: "0.04em" }}>NIGHT <span style={{ color: C.sage }}>&</span> DAY MEDICAL</div>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {step === 0 && <WelcomeStep onNext={goNext} />}
        {step === 1 && <BasicInfoStep data={data} setData={setData} onNext={goNext} onBack={goBack} />}
        {step === 2 && <SymptomsStep data={data} setData={setData} onNext={goNext} onBack={goBack} />}
        {step === 3 && <MedicalHistoryStep data={data} setData={setData} onNext={goNext} onBack={goBack} />}
        {step === 4 && <IDUploadStep data={data} setData={setData} onNext={goNext} onBack={goBack} />}
        {step === 5 && <TMAStep data={data} setData={setData} onNext={goNext} onBack={goBack} />}
        {step === 6 && <PaymentStep data={data} setData={setData} onNext={goNext} onBack={goBack} />}
        {step === 7 && <ConfirmationStep data={data} setData={setData} />}
      </div>
      <div style={{ textAlign: "center", marginTop: 48, paddingTop: 20, borderTop: "1px solid " + C.gray200 }}>
        <p style={{ fontSize: 11, color: C.gray400, fontFamily: "'Lato', sans-serif" }}>© 2026 Night & Day Medical. All information is confidential and protected.</p>
      </div>
    </div>
  );
}
