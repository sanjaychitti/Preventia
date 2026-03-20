'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── Mock data ────────────────────────────────────────────────────────────────
const PATIENT = {
  name: 'JANE DOE',
  initials: 'JD',
  dob: '12-MAY-1992',
  age: 32,
  sex: 'F',
  mrn: '#44920-X',
  bloodType: 'O Positive',
  bmi: 22.7,
  allergies: 2,
  status: 'ACTIVE PATIENT',
  vitals: [
    { label: 'BP (MMHG)',    value: '118/76' },
    { label: 'HEART RATE',  value: '72'     },
    { label: 'TEMP (F)',     value: '98.4'   },
    { label: 'SPO2',         value: '98%'    },
  ],
  vitalSync: '2h ago',
  conditions: [
    { name: 'TYPE 2 DIABETES',  note: 'Diag. 2021',   risk: '' },
    { name: 'SEASONAL ALLERGIES', note: 'Chronic',    risk: '' },
    { name: 'HYPERTENSION',      note: '',            risk: 'LOW RISK' },
  ],
  prescriptions: [
    { drug: 'METFORMIN', dose: '500MG', sig: '1 tab twice daily with meals', status: 'ACTIVE' },
  ],
  intake: {
    reason: 'Follow-up on recent blood sugar spikes and fatigue.',
    symptoms: 'Mild dizziness and blurred vision twice this week.',
    alert: 'Patient flags "blurred vision" as a new symptom.',
  },
  vault: [
    { name: 'HbA1c_Oct2023.pdf'   },
    { name: 'Lipid_Panel_Sept.pdf' },
  ],
};

const S = {
  page: { minHeight: '100vh', backgroundColor: '#fff', fontFamily: 'system-ui, sans-serif' },
  nav: { backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' },
  navLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { border: '1.5px solid #fff', color: '#fff', backgroundColor: 'transparent', padding: '5px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em' },
  patientName: { fontSize: 16, fontWeight: 800, letterSpacing: '0.04em' },
  activeBadge: { border: '1.5px solid #22C55E', color: '#22C55E', fontSize: 10, fontWeight: 700, padding: '3px 10px', letterSpacing: '0.06em' },
  navRight: { display: 'flex', gap: 10 },
  joinBtn: { backgroundColor: '#000', color: '#fff', border: '2px solid #fff', padding: '8px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em' },
  editBtn: { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em' },
  countdown: { fontSize: 11, color: '#EF4444', fontWeight: 700, textAlign: 'center' as const, padding: '6px 0', borderBottom: '1px solid #E5E7EB', letterSpacing: '0.08em' },
  body: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, padding: 20, gap2: 20 },
  sectionHeader: { borderLeft: '4px solid #000', paddingLeft: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const },
  sideNote: { fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' },
  metaRow: { display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' as const },
  metaBadge: { border: '1.5px solid #000', padding: '4px 12px', fontSize: 11, fontWeight: 700 },
  vitalBox: { border: '1.5px solid #D1D5DB', padding: '14px 0', textAlign: 'center' as const, marginBottom: 8 },
  vitalValue: { fontSize: 26, fontWeight: 800, fontFamily: 'monospace', display: 'block' },
  vitalLabel: { fontSize: 10, color: '#9CA3AF', letterSpacing: '0.08em', fontWeight: 600 },
  conditionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #E5E7EB' },
  conditionName: { fontSize: 12, fontWeight: 700 },
  conditionNote: { fontSize: 11, color: '#6B7280' },
  lowRisk: { fontSize: 11, fontWeight: 700, color: '#16A34A' },
  rxBox: { border: '1.5px solid #D1D5DB', padding: 14, marginTop: 10 },
  rxDrug: { fontWeight: 700, fontSize: 14, fontFamily: 'monospace' },
  rxDose: { fontWeight: 700, fontSize: 14, fontFamily: 'monospace', color: '#374151', marginLeft: 8 },
  rxStatus: { border: '1.5px solid #16A34A', color: '#16A34A', fontSize: 10, fontWeight: 700, padding: '2px 8px', float: 'right' as const },
  rxSig: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  refillBtn: { width: '100%', border: '1.5px solid #000', backgroundColor: '#fff', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', padding: '9px 0', cursor: 'pointer', marginTop: 10, textTransform: 'uppercase' as const },
  intakeBox: { border: '1.5px solid #E5E7EB', padding: 16, marginBottom: 12 },
  intakeQ: { fontSize: 11, color: '#6B7280', marginBottom: 4, fontStyle: 'italic' },
  intakeA: { fontSize: 13, fontWeight: 600, marginBottom: 0 },
  alertBox: { backgroundColor: '#FFFBEB', border: '1.5px solid #F59E0B', padding: '8px 12px', fontSize: 12, color: '#92400E', fontWeight: 600, marginTop: 10 },
  vaultRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1.5px solid #E5E7EB', padding: '10px 14px', marginBottom: 6 },
  vaultName: { fontSize: 12, fontFamily: 'monospace', fontWeight: 600 },
  viewBtn: { border: '1.5px solid #000', backgroundColor: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.04em' },
  obsTextarea: { width: '100%', border: '1.5px solid #D1D5DB', borderRadius: 0, padding: 10, fontSize: 12, minHeight: 120, resize: 'vertical' as const, outline: 'none', fontFamily: 'system-ui', boxSizing: 'border-box' as const },
  saveBtn: { width: '100%', backgroundColor: '#000', color: '#fff', border: '2px solid #000', padding: '10px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 8, letterSpacing: '0.06em' },
};

export default function PatientDetailPage() {
  const router = useRouter();

  return (
    <div style={S.page}>
      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.navLeft}>
          <button style={S.backBtn} onClick={() => router.back()}>← BACK</button>
          <span style={S.patientName}>{PATIENT.name}</span>
          <span style={S.activeBadge}>{PATIENT.status}</span>
        </div>
        <div>
          <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 700, fontFamily: 'monospace', marginRight: 16 }}>STARTS IN: 00:12:45</span>
        </div>
        <div style={S.navRight}>
          <Link href="/encounter/1">
            <button style={S.joinBtn}>JOIN VIRTUAL CONSULTATION</button>
          </Link>
          <button style={S.editBtn}>EDIT RECORDS</button>
        </div>
      </nav>

      {/* Profile strip */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, backgroundColor: '#1F2937', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
          {PATIENT.initials}
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.02em' }}>{PATIENT.name}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            DOB: {PATIENT.dob} ({PATIENT.age}Y) · MRN: {PATIENT.mrn} · SEX: {PATIENT.sex}
          </div>
          <div style={S.metaRow}>
            <span style={S.metaBadge}>{PATIENT.bloodType}</span>
            <span style={S.metaBadge}>BMI: {PATIENT.bmi}</span>
            <span style={S.metaBadge}>ALLERGIES: {PATIENT.allergies} ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Three columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, padding: 20 }}>

        {/* Column 1 — Vitals + Conditions + Rx */}
        <div>
          <div style={{ ...S.sectionHeader, display: 'flex', alignItems: 'center' }}>
            <span style={S.sectionTitle}>Current Vitals</span>
            <span style={{ ...S.sideNote, marginLeft: 'auto', fontSize: 11, color: '#9CA3AF' }}>Recorded: {PATIENT.vitalSync}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {PATIENT.vitals.map(v => (
              <div key={v.label} style={S.vitalBox}>
                <span style={S.vitalValue}>{v.value}</span>
                <span style={S.vitalLabel}>{v.label}</span>
              </div>
            ))}
          </div>

          <div style={S.sectionHeader}>
            <span style={S.sectionTitle}>Active Conditions</span>
          </div>
          <div style={{ border: '1.5px solid #E5E7EB', marginBottom: 20 }}>
            {PATIENT.conditions.map((c, i) => (
              <div key={i} style={{ ...S.conditionRow, padding: '10px 14px', borderBottom: i < PATIENT.conditions.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                <span style={S.conditionName}>{c.name}</span>
                {c.risk ? <span style={S.lowRisk}>{c.risk}</span> : <span style={S.conditionNote}>{c.note}</span>}
              </div>
            ))}
          </div>

          <div style={S.sectionHeader}>
            <span style={S.sectionTitle}>Active Prescriptions</span>
          </div>
          {PATIENT.prescriptions.map((rx, i) => (
            <div key={i} style={S.rxBox}>
              <div>
                <span style={S.rxStatus}>{rx.status}</span>
                <span style={S.rxDrug}>{rx.drug}</span>
                <span style={S.rxDose}>{rx.dose}</span>
              </div>
              <div style={S.rxSig}>{rx.sig}</div>
              <button style={S.refillBtn}>Request Refill</button>
            </div>
          ))}
        </div>

        {/* Column 2 — Patient Q&A / Intake */}
        <div>
          <div style={S.sectionHeader}>
            <span style={S.sectionTitle}>Patient Q&A (Intake)</span>
          </div>
          <div style={S.intakeBox}>
            <div style={S.intakeQ}>Reason for today&apos;s visit?</div>
            <div style={S.intakeA}>{PATIENT.intake.reason}</div>
          </div>
          <div style={S.intakeBox}>
            <div style={S.intakeQ}>Any new symptoms?</div>
            <div style={S.intakeA}>{PATIENT.intake.symptoms}</div>
            <div style={S.alertBox}>Alert: {PATIENT.intake.alert}</div>
          </div>
        </div>

        {/* Column 3 — Records + Provider Notes */}
        <div>
          <div style={S.sectionHeader}>
            <span style={S.sectionTitle}>Medical Records Vault</span>
          </div>
          <div style={{ marginBottom: 20 }}>
            {PATIENT.vault.map((f, i) => (
              <div key={i} style={S.vaultRow}>
                <span style={S.vaultName}>{f.name}</span>
                <button style={S.viewBtn}>VIEW</button>
              </div>
            ))}
          </div>

          <div style={S.sectionHeader}>
            <span style={S.sectionTitle}>Provider Observations</span>
          </div>
          <textarea style={S.obsTextarea} placeholder="Private provider notes..." />
          <button style={S.saveBtn}>Save Note</button>
        </div>
      </div>
    </div>
  );
}
