'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TABS = ['NOTES', 'RECORDS & IMAGING', 'INTAKE FORM', 'PLAN & ORDERS', 'CHAT (2)'];

const MOCK = {
  patient: 'JANE DOE',
  recId: 'REC-009845',
  status: 'CONNECTED (HD)',
  vitals: [
    { label: 'HEART RATE', value: '78', bg: '#fff' },
    { label: 'GLUCOSE',    value: '141', bg: '#FFFBEB' },
  ],
  flags: [
    { text: 'BLURRED VISION REPORTED (NEW)', color: '#EF4444' },
    { text: 'TYPE 2 DIABETES (DIAG. 2021)', color: '#374151' },
  ],
};

const S = {
  page: { minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' as const },
  topBar: { backgroundColor: '#fff', borderBottom: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', gap: 16 },
  topLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  exitBtn: { border: '2px solid #000', backgroundColor: '#fff', fontWeight: 700, fontSize: 11, padding: '6px 12px', cursor: 'pointer', letterSpacing: '0.06em' },
  liveTitle: { fontWeight: 800, fontSize: 14, letterSpacing: '0.04em' },
  recBadge: { color: '#EF4444', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' },
  statusBlock: { display: 'flex', gap: 12, alignItems: 'center' },
  statusLabel: { fontSize: 10, color: '#6B7280', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const },
  statusValue: { fontSize: 12, fontWeight: 800, color: '#16A34A', letterSpacing: '0.06em' },
  shareBtn: { backgroundColor: '#000', color: '#fff', border: '2px solid #000', padding: '7px 16px', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em' },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  leftPanel: { width: 300, minWidth: 300, borderRight: '2px solid #000', display: 'flex', flexDirection: 'column' as const, backgroundColor: '#fff' },
  videoArea: { backgroundColor: '#111', position: 'relative' as const, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  videoLabel: { color: '#6B7280', fontSize: 13, fontFamily: 'monospace', letterSpacing: '0.08em' },
  selfView: { position: 'absolute' as const, top: 10, right: 10, width: 64, height: 48, backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#9CA3AF' },
  patientLabel: { backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', position: 'absolute' as const, bottom: 8, left: 8, letterSpacing: '0.06em' },
  controls: { display: 'flex', justifyContent: 'center', gap: 16, padding: '12px 0', borderBottom: '1.5px solid #E5E7EB' },
  ctrlBtn: (red?: boolean): React.CSSProperties => ({ width: 40, height: 40, borderRadius: '50%', border: '2px solid #000', backgroundColor: red ? '#EF4444' : '#fff', color: red ? '#fff' : '#000', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  devDataLabel: { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#374151', padding: '8px 14px 4px', textTransform: 'uppercase' as const },
  vitalsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, margin: '0 14px 10px' },
  vitalCell: (bg: string): React.CSSProperties => ({ border: '1.5px solid #D1D5DB', backgroundColor: bg, padding: '10px 0', textAlign: 'center' as const }),
  vitalLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const },
  vitalValue: { fontSize: 28, fontWeight: 800, fontFamily: 'monospace', display: 'block' },
  flagsBox: { margin: '0 14px', border: '1px solid #E5E7EB', padding: '8px 10px' },
  flagTitle: { fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#6B7280', marginBottom: 5 },
  rightPanel: { flex: 1, display: 'flex', flexDirection: 'column' as const },
  tabBar: { display: 'flex', backgroundColor: '#fff', borderBottom: '2px solid #000' },
  tab: (active: boolean): React.CSSProperties => ({ padding: '10px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', border: 'none', outline: 'none', borderBottom: active ? '2px solid #000' : '2px solid transparent', backgroundColor: '#fff', color: active ? '#000' : '#6B7280', textTransform: 'uppercase' as const }),
  noteArea: { flex: 1, padding: '20px 24px', overflow: 'auto' as const },
  noteTitle: { fontSize: 14, fontWeight: 800, letterSpacing: '0.06em', marginBottom: 4 },
  autoSave: { color: '#22C55E', fontSize: 11, fontWeight: 700 },
  fieldLabel: { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginTop: 18, marginBottom: 6, color: '#374151' },
  textarea: { width: '100%', border: '1.5px solid #D1D5DB', borderRadius: 0, padding: 10, fontSize: 12, resize: 'vertical' as const, outline: 'none', fontFamily: 'system-ui', boxSizing: 'border-box' as const },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 },
  templateRow: { display: 'flex', gap: 10, marginTop: 18 },
  tplBtn: { border: '1.5px solid #000', backgroundColor: '#fff', fontSize: 11, fontWeight: 700, padding: '7px 14px', cursor: 'pointer', letterSpacing: '0.04em' },
  footer: { borderTop: '2px solid #000', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px' },
  footerGroup: { display: 'flex', gap: 10 },
  draftBtn: { border: '2px solid #000', backgroundColor: '#fff', fontWeight: 700, fontSize: 12, padding: '9px 20px', cursor: 'pointer', letterSpacing: '0.06em' },
  signBtn: { backgroundColor: '#000', color: '#fff', border: '2px solid #000', fontWeight: 700, fontSize: 12, padding: '9px 24px', cursor: 'pointer', letterSpacing: '0.06em' },
};

const NOTE_FIELDS = [
  { key: 's', label: 'S: Subjective (CC / HPI)', placeholder: 'Patient reports blurred vision occurring twice this week, specifically in the late afternoon. Denies headache or eye pain...' },
  { key: 'o', label: 'O: Objective (Observations / Vitals)', placeholder: 'Patient appears well-hydrated. Speech is clear. Visual acuity screening via camera reveals no obvious squinting or ptosis...' },
];

export default function EncounterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({ s: '', o: '', a: '', p: '' });

  return (
    <div style={S.page}>
      {/* Top bar */}
      <div style={S.topBar}>
        <div style={S.topLeft}>
          <button style={S.exitBtn} onClick={() => router.back()}>EXIT ROOM</button>
          <span style={S.liveTitle}>LIVE ENCOUNTER: {MOCK.patient}</span>
          <span style={S.recBadge}>● {MOCK.recId}</span>
        </div>
        <div style={S.statusBlock}>
          <div>
            <div style={S.statusLabel}>Status</div>
            <div style={S.statusValue}>{MOCK.status}</div>
          </div>
          <button style={S.shareBtn}>SHARE VIEW</button>
        </div>
      </div>

      <div style={S.body}>
        {/* Left panel */}
        <div style={S.leftPanel}>
          {/* Video */}
          <div style={S.videoArea}>
            <span style={S.videoLabel}>PATIENT LIVE STREAM</span>
            <div style={S.selfView}><span style={{ fontSize: 8, color: '#9CA3AF' }}>SELF</span></div>
            <div style={S.patientLabel}>JANE DOE (PATIENT)</div>
          </div>

          {/* Controls */}
          <div style={S.controls}>
            <button style={S.ctrlBtn()}>🎤</button>
            <button style={S.ctrlBtn()}>📹</button>
            <button style={S.ctrlBtn(true)}>📞</button>
          </div>

          {/* Device data */}
          <div style={{ ...S.devDataLabel, borderTop: '1.5px dashed #D1D5DB', paddingTop: 10 }}>Live Device Data</div>
          <div style={S.vitalsGrid}>
            {MOCK.vitals.map(v => (
              <div key={v.label} style={S.vitalCell(v.bg)}>
                <span style={S.vitalLabel}>{v.label}</span>
                <span style={S.vitalValue}>{v.value}</span>
              </div>
            ))}
          </div>

          {/* Flags */}
          <div style={S.flagsBox}>
            <div style={S.flagTitle}>Flags</div>
            {MOCK.flags.map((f, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 600, color: f.color, marginBottom: 3 }}>
                {i === 0 ? '!' : '·'} {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={S.rightPanel}>
          {/* Tabs */}
          <div style={S.tabBar}>
            {TABS.map((t, i) => (
              <button key={t} style={S.tab(activeTab === i)} onClick={() => setActiveTab(i)}>{t}</button>
            ))}
          </div>

          {/* NOTES tab */}
          {activeTab === 0 && (
            <div style={S.noteArea}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={S.noteTitle}>ENCOUNTER NOTE (SOAP)</span>
                <span style={S.autoSave}>● AUTO-SAVING TO EHR</span>
              </div>

              {NOTE_FIELDS.map(f => (
                <div key={f.key}>
                  <div style={S.fieldLabel}>{f.label}</div>
                  <textarea
                    rows={4}
                    style={S.textarea}
                    placeholder={f.placeholder}
                    value={notes[f.key]}
                    onChange={e => setNotes(n => ({ ...n, [f.key]: e.target.value }))}
                  />
                </div>
              ))}

              <div style={S.twoCol}>
                <div>
                  <div style={S.fieldLabel}>A: Assessment</div>
                  <textarea rows={4} style={S.textarea} placeholder="Hyperglycemic symptoms vs. potential retinal changes..." value={notes.a} onChange={e => setNotes(n => ({ ...n, a: e.target.value }))} />
                </div>
                <div>
                  <div style={S.fieldLabel}>P: Plan</div>
                  <textarea rows={4} style={S.textarea} placeholder="1. Stat HbA1c order. 2. Referral to Ophthalmology. 3. Adjust Metformin..." value={notes.p} onChange={e => setNotes(n => ({ ...n, p: e.target.value }))} />
                </div>
              </div>

              <div style={S.templateRow}>
                <button style={S.tplBtn}>+ SMART TEMPLATE: DIABETES FOLLOW-UP</button>
                <button style={S.tplBtn}>+ DICTATE NOTE</button>
              </div>
            </div>
          )}

          {activeTab !== 0 && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13, fontFamily: 'monospace' }}>
              {TABS[activeTab]} — coming soon
            </div>
          )}

          {/* Footer */}
          <div style={S.footer}>
            <div style={S.footerGroup}>
              <button style={S.draftBtn}>SAVE AS DRAFT</button>
              <button style={S.draftBtn}>VIEW FULL EMR</button>
            </div>
            <button style={S.signBtn}>SIGN &amp; CLOSE ENCOUNTER</button>
          </div>
        </div>
      </div>
    </div>
  );
}
