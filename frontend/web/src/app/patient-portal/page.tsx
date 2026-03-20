'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout, currentUser } from '@/lib/localAuth';
import Link from 'next/link';

// ─── Mock data ────────────────────────────────────────────────────────────────
const PATIENT = {
  name: 'JANE DOE', initials: 'JD',
  subtitle: 'PRIMARY ACCOUNT HOLDER · 32Y · FEMALE',
  bloodType: 'O POSITIVE', bmi: 22.7, allergies: 2,
};

const UPCOMING = [
  { date: 'TOMORROW, 14:00', tag: 'NUTRITION COACHING',  tagColor: '#7C3AED', desc: 'Wellness Session - Mike Rose',      action: 'JOIN',  actionBg: '#000' },
  { date: 'OCT 24, 16:15',   tag: 'PHARMACY DELIVERY',   tagColor: '#D97706', desc: 'Arriving via Courier - Metformin',  action: 'TRACK', actionBg: '#000' },
  { date: 'OCT 25, 11:00',   tag: 'HEALTH COACH ASSIST', tagColor: '#0D9488', desc: 'Support Call - Sarah J.',           action: 'JOIN',  actionBg: '#000' },
  { date: 'OCT 26, 14:30',   tag: 'FASTING BLOOD PANEL', tagColor: '#374151', desc: 'Virtual Consultation - Dr. Lee',    action: 'JOIN',  actionBg: '#000' },
];

const VAULT = [
  { name: 'ANNUAL PHYSICAL 2023.PDF' },
  { name: 'BLOOD PANEL OCT.PDF'      },
];

const CHAT_MSGS = [
  { from: 'DR. SMITH', text: 'Any updates on the morning dizziness?', mine: false },
  { from: 'Me',        text: 'Monitoring as requested',               mine: true  },
];

const BILLS = [
  { name: 'PHARMACY_BILL_OCT.PDF', amount: 350,  date: 'OCT 12, 2023', status: 'PROCESSED', statusColor: '#16A34A' },
  { name: 'LAB_INVOICE_092.JPG',   amount: 4250, date: 'SEP 08, 2023', status: 'SCANNING…', statusColor: '#2563EB' },
];

const INSIGHTS = [
  { tag: 'NEW RESEARCH', title: 'ADVANCED GLUCOSE MONITORING TECHNIQUES' },
];

const HISTORY = [
  { condition: 'APPENDECTOMY',  type: 'SURGICAL',  year: 2015 },
  { condition: 'ASTHMA',        type: 'CHRONIC',   year: 2010 },
  { condition: 'HYPERTENSION',  type: 'FAMILY HX', year: null },
];

const S = {
  page: { minHeight: '100vh', backgroundColor: '#fff', fontFamily: 'system-ui, sans-serif' },
  nav: { backgroundColor: '#fff', borderBottom: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' },
  navTitle: { fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' },
  logoutBtn: { border: '1.5px solid #000', backgroundColor: '#fff', fontWeight: 700, fontSize: 11, padding: '5px 14px', cursor: 'pointer', letterSpacing: '0.06em' },
  profile: { padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #E5E7EB', justifyContent: 'space-between' },
  avatar: { width: 60, height: 60, border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, flexShrink: 0 },
  name: { fontSize: 24, fontWeight: 800, letterSpacing: '0.02em' },
  subtitle: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  badgeRow: { display: 'flex', gap: 8, marginTop: 8 },
  badge: { border: '1.5px solid #000', padding: '3px 12px', fontSize: 11, fontWeight: 700 },
  editBtn: { backgroundColor: '#000', color: '#fff', border: '2px solid #000', fontWeight: 700, fontSize: 12, padding: '8px 16px', cursor: 'pointer', letterSpacing: '0.04em', flexShrink: 0 },
  emergencyBtn: { border: '1.5px solid #EF4444', color: '#EF4444', backgroundColor: '#fff', fontWeight: 700, fontSize: 11, padding: '5px 12px', cursor: 'pointer', marginBottom: 8, display: 'block' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, padding: 20 },
  secHeader: { borderLeft: '4px solid #000', paddingLeft: 10, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  secTitle: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const },
  secLink: { fontSize: 11, fontWeight: 700, color: '#000', textDecoration: 'underline', cursor: 'pointer' },
  videoBox: { backgroundColor: '#111', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  videoLabel: { color: '#6B7280', fontSize: 12, fontFamily: 'monospace' },
  nextAppt: { border: '1.5px solid #D1D5DB', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  joinBtn: { backgroundColor: '#000', color: '#fff', border: '2px solid #000', fontWeight: 700, fontSize: 11, padding: '6px 14px', cursor: 'pointer' },
  bookingBtn: { width: '100%', border: '1.5px dashed #000', backgroundColor: '#fff', fontWeight: 700, fontSize: 11, padding: '9px 0', cursor: 'pointer', letterSpacing: '0.06em', marginTop: 4 },
  upcomingItem: (i: number): React.CSSProperties => ({ borderBottom: i < UPCOMING.length - 1 ? '1px solid #E5E7EB' : 'none', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }),
  upcomingTag: (color: string): React.CSSProperties => ({ backgroundColor: color, color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', letterSpacing: '0.06em', display: 'inline-block', marginBottom: 3 }),
  upcomingDate: { fontSize: 10, color: '#9CA3AF', marginBottom: 2, fontWeight: 600 },
  upcomingDesc: { fontSize: 12, color: '#374151' },
  actionBtn: (bg: string): React.CSSProperties => ({ backgroundColor: bg, color: '#fff', border: `1.5px solid ${bg}`, fontWeight: 700, fontSize: 11, padding: '5px 12px', cursor: 'pointer', flexShrink: 0, alignSelf: 'center' }),
  viewAllBtn: { width: '100%', border: '1.5px solid #000', backgroundColor: '#fff', fontWeight: 700, fontSize: 11, padding: '8px 0', cursor: 'pointer', marginTop: 10, letterSpacing: '0.06em' },
  chatBox: { border: '1.5px solid #E5E7EB', display: 'flex', flexDirection: 'column' as const, height: 200 },
  chatTabRow: { display: 'flex', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' },
  chatTab: (active: boolean): React.CSSProperties => ({ padding: '6px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer', border: 'none', backgroundColor: active ? '#fff' : 'transparent', borderBottom: active ? '2px solid #000' : 'none', letterSpacing: '0.06em' }),
  chatOnCallBadge: { fontSize: 9, fontWeight: 700, color: '#16A34A', border: '1px solid #16A34A', padding: '1px 6px', marginLeft: 6 },
  messages: { flex: 1, overflow: 'auto' as const, padding: '8px 12px', display: 'flex', flexDirection: 'column' as const, gap: 6 },
  bubble: (mine: boolean): React.CSSProperties => ({ alignSelf: mine ? 'flex-end' : 'flex-start', backgroundColor: mine ? '#000' : '#F3F4F6', color: mine ? '#fff' : '#000', padding: '6px 10px', fontSize: 12, maxWidth: '80%' }),
  senderLabel: { fontSize: 10, fontWeight: 700, color: '#9CA3AF', marginBottom: 2 },
  chatInput: { display: 'flex', borderTop: '1px solid #E5E7EB' },
  chatInputField: { flex: 1, border: 'none', outline: 'none', padding: '8px 10px', fontSize: 12 },
  sendBtn: { backgroundColor: '#000', color: '#fff', border: 'none', fontWeight: 700, fontSize: 11, padding: '8px 14px', cursor: 'pointer' },
  totalSpend: { fontSize: 26, fontFamily: 'monospace', fontWeight: 800, border: '1.5px solid #000', padding: '12px 16px', marginBottom: 12 },
  uploadBox: { border: '1.5px dashed #D1D5DB', padding: '16px', textAlign: 'center' as const, marginBottom: 12, cursor: 'pointer' },
  uploadIcon: { fontSize: 20, display: 'block', marginBottom: 4 },
  uploadLabel: { fontSize: 11, color: '#6B7280' },
  uploadSub: { fontSize: 10, color: '#9CA3AF' },
  billRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB', padding: '7px 0' },
  billName: { fontSize: 11, fontFamily: 'monospace', fontWeight: 600 },
  billDate: { fontSize: 10, color: '#9CA3AF' },
  billStatus: (color: string): React.CSSProperties => ({ fontSize: 10, fontWeight: 700, color }),
  billAmount: { fontSize: 12, fontFamily: 'monospace', fontWeight: 700 },
  reviewBtn: { width: '100%', backgroundColor: '#000', color: '#fff', border: '2px solid #000', fontWeight: 700, fontSize: 11, padding: '9px 0', cursor: 'pointer', marginTop: 10, letterSpacing: '0.06em' },
  insightBox: { border: '1.5px solid #E5E7EB', padding: '12px 14px', marginBottom: 8 },
  insightTag: { fontSize: 9, fontWeight: 700, color: '#6B7280', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 4 },
  insightTitle: { fontSize: 13, fontWeight: 700 },
  readLink: { fontSize: 11, fontWeight: 700, color: '#000', textDecoration: 'underline', cursor: 'pointer', display: 'block', marginTop: 4 },
  historyItem: { borderBottom: '1px solid #E5E7EB', padding: '8px 0' },
  histName: { fontSize: 12, fontWeight: 700 },
  histDetail: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  updateHistBtn: { width: '100%', border: '1.5px solid #000', backgroundColor: '#fff', fontWeight: 700, fontSize: 11, padding: '8px 0', cursor: 'pointer', marginTop: 10, letterSpacing: '0.06em' },
};

export default function PatientPortalPage() {
  const router = useRouter();
  const user = currentUser();
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState(CHAT_MSGS);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  function sendMsg() {
    if (!chatMsg.trim()) return;
    setMessages(m => [...m, { from: 'Me', text: chatMsg.trim(), mine: true }]);
    setChatMsg('');
  }

  return (
    <div style={S.page}>
      {/* Nav */}
      <nav style={S.nav}>
        <span style={S.navTitle}>PATIENT PORTAL</span>
        <button style={S.logoutBtn} onClick={handleLogout}>LOG OUT</button>
      </nav>

      {/* Profile */}
      <div style={S.profile}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={S.avatar}>{PATIENT.initials}</div>
          <div>
            <div style={S.name}>{user?.name?.toUpperCase() ?? PATIENT.name}</div>
            <div style={S.subtitle}>{PATIENT.subtitle}</div>
            <div style={S.badgeRow}>
              <span style={S.badge}>{PATIENT.bloodType}</span>
              <span style={S.badge}>BMI: {PATIENT.bmi}</span>
              <span style={S.badge}>ALLERGIES: {PATIENT.allergies} ACTIVE</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <button style={S.emergencyBtn}>+ EMERGENCY SOS</button>
          <button style={S.editBtn}>BOOK PROVIDER</button>
        </div>
      </div>

      {/* Main grid */}
      <div style={S.grid}>

        {/* Left col */}
        <div>
          {/* Virtual Call */}
          <div style={{ ...S.secHeader, marginBottom: 10 }}>
            <span style={S.secTitle}>Virtual Consultation</span>
            <span style={S.secLink}>HISTORY ↗</span>
          </div>
          <div style={S.videoBox}>
            <span style={S.videoLabel}>[ VIRTUAL CALL FEED ]</span>
          </div>
          <div style={{ border: '1.5px solid #D1D5DB', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>NEXT: DR. SARAH VANE</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>Starts in 12 Minutes</div>
            </div>
            <Link href="/encounter/1"><button style={S.joinBtn}>JOIN MEETING</button></Link>
          </div>
          <button style={S.bookingBtn}>+ NEW VIRTUAL BOOKING</button>

          {/* Vault */}
          <div style={{ ...S.secHeader, marginTop: 24 }}>
            <span style={S.secTitle}>Vaulted Records</span>
            <span style={S.secLink}>FILE MANAGER ↗</span>
          </div>
          {VAULT.map((f, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1.5px solid #E5E7EB', padding: '8px 12px', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{f.name}</span>
              <button style={{ border: '1.5px solid #000', backgroundColor: '#fff', fontWeight: 700, fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}>VIEW</button>
            </div>
          ))}
          <button style={{ ...S.bookingBtn, marginTop: 8 }}>ADD RECORD (SCAN REPORT)</button>
          <button style={{ ...S.viewAllBtn, marginTop: 6 }}>SEE ALL RECORDS</button>
        </div>

        {/* Center col */}
        <div>
          {/* Upcoming */}
          <div style={S.secHeader}>
            <span style={S.secTitle}>Upcoming Sessions</span>
            <span style={S.secLink}>SCHEDULE ↗</span>
          </div>
          <div style={{ border: '1.5px solid #E5E7EB', padding: '0 14px', marginBottom: 20 }}>
            {UPCOMING.map((u, i) => (
              <div key={i} style={S.upcomingItem(i)}>
                <div>
                  <div style={S.upcomingDate}>{u.date}</div>
                  <span style={S.upcomingTag(u.tagColor)}>{u.tag}</span>
                  <div style={S.upcomingDesc}>{u.desc}</div>
                </div>
                <button style={S.actionBtn(u.actionBg)}>{u.action}</button>
              </div>
            ))}
          </div>
          <button style={S.viewAllBtn}>VIEW ALL APPOINTMENTS</button>

          {/* Provider Chat */}
          <div style={{ ...S.secHeader, marginTop: 24 }}>
            <span style={S.secTitle}>Provider Chat</span>
            <span style={S.secLink}>FULL SCREEN CHAT ↗</span>
          </div>
          <div style={S.chatBox}>
            <div style={S.chatTabRow}>
              <button style={S.chatTab(true)}>CARE TEAM</button>
              <button style={S.chatTab(false)}>ON-CALL SUPPORT</button>
            </div>
            <div style={{ padding: '4px 12px', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#6B7280' }}>ON-CALL</span>
              <span style={S.chatOnCallBadge}>ON CALL</span>
            </div>
            <div style={S.messages}>
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.mine ? 'flex-end' as const : 'flex-start' as const }}>
                  {!m.mine && <div style={S.senderLabel}>{m.from}</div>}
                  <div style={S.bubble(m.mine)}>{m.text}</div>
                </div>
              ))}
            </div>
            <div style={S.chatInput}>
              <input style={S.chatInputField} placeholder="Type here..." value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} />
              <button style={S.sendBtn} onClick={sendMsg}>SEND</button>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div>
          {/* Billing */}
          <div style={S.secHeader}>
            <span style={S.secTitle}>Medical Billing</span>
            <span style={S.secLink}>FINANCIALS ↗</span>
          </div>
          <div style={S.totalSpend}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>TOTAL ANNUAL SPEND (YTD)</div>
            ₹ 14,200.00
          </div>
          <div style={S.uploadBox}>
            <span style={S.uploadIcon}>↑</span>
            <span style={S.uploadLabel}>DROP PDF OR IMAGES</span>
            <span style={S.uploadSub}>Max 10MB per file</span>
          </div>
          {BILLS.map((b, i) => (
            <div key={i} style={S.billRow}>
              <div>
                <div style={S.billName}>{b.name}</div>
                <div style={S.billDate}>{b.date}</div>
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <div style={S.billAmount}>₹ {b.amount.toLocaleString('en-IN')}</div>
                <div style={S.billStatus(b.statusColor)}>{b.status}</div>
              </div>
            </div>
          ))}
          <button style={S.reviewBtn}>REVIEW ALL STATEMENTS</button>

          {/* Health Insights */}
          <div style={{ ...S.secHeader, marginTop: 24 }}>
            <span style={S.secTitle}>Health Insights</span>
            <span style={S.secLink}>NEWSROOM ↗</span>
          </div>
          {INSIGHTS.map((ins, i) => (
            <div key={i} style={S.insightBox}>
              <div style={S.insightTag}>{ins.tag}</div>
              <div style={S.insightTitle}>{ins.title}</div>
              <span style={S.readLink}>READ FULL ARTICLE</span>
            </div>
          ))}

          {/* Clinical History */}
          <div style={{ ...S.secHeader, marginTop: 24 }}>
            <span style={S.secTitle}>Clinical History</span>
            <span style={S.secLink}>FULL HISTORY ↗</span>
          </div>
          <div style={{ border: '1.5px solid #E5E7EB' }}>
            {HISTORY.map((h, i) => (
              <div key={i} style={{ ...S.historyItem, padding: '10px 14px', borderBottom: i < HISTORY.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                <div style={S.histName}>{h.condition}</div>
                <div style={S.histDetail}>{h.type}{h.year ? ` · ${h.year}` : ''}</div>
              </div>
            ))}
          </div>
          <button style={S.updateHistBtn}>UPDATE HISTORY</button>
        </div>

      </div>
    </div>
  );
}
