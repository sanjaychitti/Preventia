'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout, currentUser } from '@/lib/localAuth';
import Link from 'next/link';

// ─── Mock data ────────────────────────────────────────────────────────────────
const COACH = { name: 'SARAH VANE', initials: 'SV', subtitle: 'Integrative Nutrition Health Coach · NBC-HWC Candidate', specialty: 'Gut Health Specialist' };

const PENDING = [
  { id: '1', tag: 'WELLNESS DAY', tagColor: '#7C3AED', time: '2H AGO', patient: 'JANE DOE', desc: 'Requesting on site meal prep & pantry audit for Sat, Nov 4th.' },
  { id: '2', tag: 'PHARMACY DELIVERY', tagColor: '#D97706', time: '5H AGO', patient: 'RICHARD R.', desc: 'Courier pick up for Metformin refill at Main St. Pharmacy.' },
];

const NETWORK_LIST = [
  { id: '1', name: 'JANE DOE',   online: true,  plan: 'ACTIVE PLAN' },
  { id: '2', name: 'RICHARD R.', online: true,  plan: 'ON BREAK' },
];

const SESSIONS = [
  { time: '09:00 AM', patient: 'Michael T.', type: 'Check-in' },
];

const FEED = [
  { tag: 'NOURISHMENT', tagColor: '#0D9488', title: 'PRE-SLEEP ROUTINE FOR GLUCOSE STABILITY', body: 'Try a 10 minute walk after dinner. It helps muscle cells soak up glucose.' },
  { tag: 'MINDSET',     tagColor: '#7C3AED', title: 'NAVIGATING SOCIAL DINNERS',              body: 'Focus on the social connection rather than just the plate.' },
  { tag: 'MOVEMENT',    tagColor: '#2563EB', title: 'MICRO-WORKOUTS: THE 5-MINUTE STRATEGY',  body: 'Brief bursts of activity throughout the day are more effective than one long sedentary block.' },
];

const PAYMENTS = [
  { patient: 'JANE DOE', desc: '1 HOURS COACHING', amount: 1000, paid: true },
];

const S = {
  page: { minHeight: '100vh', backgroundColor: '#fff', fontFamily: 'system-ui, sans-serif' },
  nav: { backgroundColor: '#fff', borderBottom: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' },
  navLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  onlineDot: { width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22C55E' },
  navTitle: { fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' },
  signoutBtn: { border: '1.5px solid #000', backgroundColor: '#fff', fontWeight: 700, fontSize: 11, padding: '5px 14px', cursor: 'pointer', letterSpacing: '0.06em' },
  profile: { padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #E5E7EB', justifyContent: 'space-between' },
  avatar: { width: 60, height: 60, border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, flexShrink: 0 },
  editBtn: { backgroundColor: '#000', color: '#fff', border: '2px solid #000', fontWeight: 700, fontSize: 12, padding: '8px 16px', cursor: 'pointer', letterSpacing: '0.04em' },
  badge: { border: '1.5px solid #000', padding: '3px 12px', fontSize: 11, fontWeight: 700, display: 'inline-block', marginTop: 8 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, padding: 20 },
  secHeader: { borderLeft: '4px solid #000', paddingLeft: 10, marginBottom: 12 },
  secTitle: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const },
  reqCard: { border: '1.5px solid #E5E7EB', padding: 14, marginBottom: 12 },
  reqTagRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  reqTag: (color: string): React.CSSProperties => ({ backgroundColor: color, color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 10px', letterSpacing: '0.06em' }),
  reqTime: { fontSize: 10, color: '#9CA3AF', fontWeight: 600 },
  reqName: { fontWeight: 700, fontSize: 13, marginBottom: 4 },
  reqDesc: { fontSize: 12, color: '#374151', marginBottom: 10 },
  btnRow: { display: 'flex', gap: 8 },
  approveBtn: { flex: 1, backgroundColor: '#000', color: '#fff', border: '2px solid #000', fontWeight: 700, fontSize: 11, padding: '7px 0', cursor: 'pointer', textTransform: 'uppercase' as const },
  declineBtn: { flex: 1, backgroundColor: '#fff', color: '#000', border: '2px solid #000', fontWeight: 700, fontSize: 11, padding: '7px 0', cursor: 'pointer', textTransform: 'uppercase' as const },
  searchBar: { position: 'relative' as const, marginBottom: 10 },
  searchInput: { width: '100%', border: '1.5px solid #D1D5DB', borderRadius: 0, padding: '7px 32px 7px 10px', fontSize: 12, outline: 'none', boxSizing: 'border-box' as const },
  networkItem: { border: '1.5px solid #000', marginBottom: 8, padding: '8px 12px' },
  netName: { fontSize: 12, fontWeight: 700, marginBottom: 2 },
  netPlan: (active: boolean): React.CSSProperties => ({ fontSize: 10, fontWeight: 700, color: '#fff', backgroundColor: active ? '#16A34A' : '#6B7280', padding: '2px 8px', display: 'inline-block' }),
  netActions: { display: 'flex', gap: 4, marginTop: 6 },
  netIcon: { border: '1.5px solid #D1D5DB', background: '#fff', width: 26, height: 26, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  expandBtn: { width: '100%', border: '1.5px solid #000', backgroundColor: '#fff', fontWeight: 700, fontSize: 11, padding: '8px 0', cursor: 'pointer', marginTop: 8, letterSpacing: '0.06em' },
  feedCard: { border: '1.5px solid #E5E7EB', padding: 16, marginBottom: 12 },
  feedTag: (color: string): React.CSSProperties => ({ color, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: 4 }),
  feedTitle: { fontSize: 13, fontWeight: 700, marginBottom: 6 },
  feedBody: { fontSize: 12, color: '#374151', lineHeight: 1.6, marginBottom: 10 },
  feedActions: { display: 'flex', gap: 8 },
  likeBtn: { border: '1.5px solid #D1D5DB', backgroundColor: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 12px', cursor: 'pointer' },
  sessionBox: { border: '1.5px solid #D1D5DB', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sessionTime: { fontWeight: 700, fontSize: 13, fontFamily: 'monospace' },
  sessionPatient: { fontSize: 12, color: '#374151', marginTop: 2 },
  startBtn: { backgroundColor: '#000', color: '#fff', border: '2px solid #000', fontWeight: 700, fontSize: 11, padding: '6px 14px', cursor: 'pointer' },
  rateBox: { border: '1.5px solid #D1D5DB', padding: 14 },
  rateLabel: { fontSize: 10, fontWeight: 600, color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 8 },
  rateInput: { display: 'flex', border: '1.5px solid #D1D5DB', marginBottom: 10 },
  rateSymbol: { padding: '8px 12px', backgroundColor: '#F9FAFB', borderRight: '1.5px solid #D1D5DB', fontSize: 14, fontWeight: 700 },
  rateField: { flex: 1, border: 'none', padding: '8px 10px', fontSize: 14, fontWeight: 600, outline: 'none' },
  updateRateBtn: { width: '100%', backgroundColor: '#000', color: '#fff', border: '2px solid #000', fontWeight: 700, fontSize: 11, padding: '9px 0', cursor: 'pointer', letterSpacing: '0.06em' },
  earningsBox: { border: '2px dashed #D1D5DB', padding: '12px 14px', marginBottom: 12 },
  earningsLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 },
  earningsAmt: { fontSize: 26, fontFamily: 'monospace', fontWeight: 800 },
  earningsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTop: '1px solid #E5E7EB', paddingTop: 8 },
  paidBadge: { backgroundColor: '#DCFCE7', color: '#166534', fontSize: 10, fontWeight: 700, padding: '2px 8px', border: '1px solid #86EFAC' },
  availBox: { border: '1.5px solid #E5E7EB' },
  availRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer' },
  availLabel: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
};

export default function CoachPortalPage() {
  const router = useRouter();
  const user = currentUser();
  const [rate, setRate] = useState('2500');
  const [requests, setRequests] = useState(PENDING);
  const [accepting, setAccepting] = useState(true);

  function dismiss(id: string) { setRequests(r => r.filter(x => x.id !== id)); }

  function handleLogout() {
    logout();
    router.push('/login');
  }

  const totalMTD = PAYMENTS.reduce((s, p) => s + p.amount, 0) + 81500;

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.navLeft}>
          <div style={S.onlineDot} />
          <span style={S.navTitle}>COACH PORTAL: {user?.name?.toUpperCase() ?? COACH.name}, INHC</span>
        </div>
        <button style={S.signoutBtn} onClick={handleLogout}>SIGN OUT</button>
      </nav>

      {/* Profile */}
      <div style={S.profile}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={S.avatar}>{COACH.initials}</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.02em' }}>{user?.name?.toUpperCase() ?? COACH.name}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{COACH.subtitle}</div>
            <span style={S.badge}>{COACH.specialty}</span>
          </div>
        </div>
        <button style={S.editBtn}>EDIT PROFILE</button>
      </div>

      {/* Grid */}
      <div style={S.grid}>

        {/* Left */}
        <div>
          <div style={S.secHeader}><span style={S.secTitle}>Pending Requests</span></div>
          {requests.length === 0 && <p style={{ fontSize: 12, color: '#9CA3AF' }}>No pending requests.</p>}
          {requests.map(r => (
            <div key={r.id} style={S.reqCard}>
              <div style={S.reqTagRow}>
                <span style={S.reqTag(r.tagColor)}>{r.tag}</span>
                <span style={S.reqTime}>{r.time}</span>
              </div>
              <div style={S.reqName}>{r.patient}</div>
              <div style={S.reqDesc}>{r.desc}</div>
              <div style={S.btnRow}>
                <button style={S.approveBtn} onClick={() => dismiss(r.id)}>Approve</button>
                <button style={S.declineBtn} onClick={() => dismiss(r.id)}>Decline</button>
              </div>
            </div>
          ))}

          <div style={{ ...S.secHeader, marginTop: 20 }}><span style={S.secTitle}>My Network</span></div>
          <div style={S.searchBar}>
            <input style={S.searchInput} placeholder="Search network..." />
            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 14 }}>⌕</span>
          </div>
          {NETWORK_LIST.map(n => (
            <div key={n.id} style={S.networkItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: n.online ? '#22C55E' : '#9CA3AF', flexShrink: 0, display: 'inline-block' }} />
                <span style={S.netName}>{n.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={S.netPlan(n.plan === 'ACTIVE PLAN')}>{n.plan}</span>
                <div style={S.netActions}>
                  {['📞', '🎥', '✉'].map((ic, i) => <button key={i} style={S.netIcon}>{ic}</button>)}
                </div>
              </div>
            </div>
          ))}
          <button style={S.expandBtn}>EXPAND NETWORK</button>
        </div>

        {/* Center — Feed */}
        <div>
          <div style={S.secHeader}><span style={S.secTitle}>Lifestyle Insights</span></div>
          {FEED.map((f, i) => (
            <div key={i} style={S.feedCard}>
              <span style={S.feedTag(f.tagColor)}>{f.tag}</span>
              <div style={S.feedTitle}>{f.title}</div>
              <div style={S.feedBody}>{f.body}</div>
              <div style={S.feedActions}>
                <button style={S.likeBtn}>👍 LIKE</button>
                <button style={S.likeBtn}>↗ SHARE</button>
              </div>
            </div>
          ))}
        </div>

        {/* Right */}
        <div>
          <div style={S.secHeader}><span style={S.secTitle}>Today&apos;s Coaching Sessions</span></div>
          {SESSIONS.map((s, i) => (
            <div key={i} style={S.sessionBox}>
              <div>
                <div style={S.sessionTime}>{s.time}</div>
                <div style={S.sessionPatient}>{s.patient} ({s.type})</div>
              </div>
              <Link href="/encounter/1"><button style={S.startBtn}>START</button></Link>
            </div>
          ))}

          <div style={{ ...S.secHeader, marginTop: 24 }}><span style={S.secTitle}>Hourly Rate</span></div>
          <div style={S.rateBox}>
            <div style={S.rateLabel}>Professional Fee (per hour)</div>
            <div style={S.rateInput}>
              <span style={S.rateSymbol}>₹</span>
              <input style={S.rateField} value={rate} onChange={e => setRate(e.target.value)} />
            </div>
            <button style={S.updateRateBtn}>UPDATE HOURLY RATE</button>
          </div>

          <div style={{ ...S.secHeader, marginTop: 24 }}><span style={S.secTitle}>Coaching Revenue</span></div>
          <div style={S.earningsBox}>
            <div style={S.earningsLabel}>EARNINGS (MTD)</div>
            <div style={S.earningsAmt}>₹{totalMTD.toLocaleString('en-IN')}</div>
            {PAYMENTS.map((p, i) => (
              <div key={i} style={S.earningsRow}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{p.patient}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>{p.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>₹{p.amount.toLocaleString('en-IN')}</span>
                  {p.paid && <span style={S.paidBadge}>PAID</span>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...S.secHeader, marginTop: 20 }}><span style={S.secTitle}>Availability Settings</span></div>
          <div style={S.availBox}>
            <label style={S.availRow}>
              <span style={S.availLabel}>Accepting Requests</span>
              <input type="checkbox" checked={accepting} onChange={e => setAccepting(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#000', cursor: 'pointer' }} />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
