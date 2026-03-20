'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { currentUser, logout } from '@/lib/localAuth';
import Link from 'next/link';

// ─── Static mock data (mirrors backend once live) ───────────────────────────
const DOCTOR = {
  name: 'DR. SARAH VANE',
  suffix: 'MD',
  specialty: 'Internal Medicine',
  license: '#882910',
  initials: 'SV',
};

const VIRTUAL_REQUESTS = [
  { id: '1', patient: 'JOHN DOE', type: 'Video Consult', badge: 'New', date: 'Tomorrow, 10:00 AM', note: 'Follow up on bloodwork.' },
];

const NETWORK = [
  { id: '1', name: 'JANE DOE',   online: true  },
  { id: '2', name: 'RICHARD R.', online: true  },
  { id: '3', name: 'EMMA S.',    online: false },
];

const SCHEDULE = [
  { id: '1', time: '09:00 AM', patient: 'Michael T.', mode: 'Video' },
];

const FEED_POSTS = [
  { id: '1', tag: 'NUTRITION', tagColor: '#0D9488', title: 'MANAGING SODIUM', postedAt: 'Posted Today, 08:00 AM', body: 'Check labels for hidden sodium in processed foods. Aim for fresh ingredients whenever possible to maintain healthy blood pressure levels.' },
  { id: '2', tag: 'ACTIVITY',  tagColor: '#2563EB', title: 'WALKING FOR LONGEVITY', postedAt: 'Posted Oct 28', body: 'Just 30 minutes of brisk walking daily significantly improves cardiovascular health and metabolic function.' },
];

const PAYMENTS = [
  { id: '1', patient: 'JANE DOE', amount: 2500, label: 'CONSULTATION', date: 'OCT 28', paid: true },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ borderLeft: '4px solid #000', paddingLeft: 10, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
        {title}
      </span>
    </div>
  );
}

function BtnPrimary({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#000',
        color: '#fff',
        border: '2px solid #000',
        borderRadius: 0,
        padding: '7px 14px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.05em',
        cursor: 'pointer',
        textTransform: 'uppercase' as const,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function BtnOutline({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#fff',
        color: '#000',
        border: '2px solid #000',
        borderRadius: 0,
        padding: '7px 14px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.05em',
        cursor: 'pointer',
        textTransform: 'uppercase' as const,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Column panels ───────────────────────────────────────────────────────────

function LeftPanel() {
  const [requests, setRequests] = useState(VIRTUAL_REQUESTS);

  function dismiss(id: string) {
    setRequests(r => r.filter(x => x.id !== id));
  }

  return (
    <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Virtual Requests */}
      <div>
        <SectionHeader title="Virtual Requests" />
        {requests.length === 0 && (
          <p style={{ fontSize: 12, color: '#6B7280' }}>No pending requests.</p>
        )}
        {requests.map(req => (
          <div
            key={req.id}
            style={{ border: '1.5px solid #D1D5DB', backgroundColor: '#fff', padding: 14, marginBottom: 10 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{req.patient}</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                  {req.type}
                  <span
                    style={{
                      marginLeft: 6,
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 6px',
                      border: '1px solid #D97706',
                    }}
                  >
                    {req.badge}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '8px 10px', marginBottom: 10, fontSize: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>{req.date}</div>
              <div style={{ color: '#374151' }}>{req.note}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <BtnPrimary style={{ flex: 1 }} onClick={() => dismiss(req.id)}>Accept</BtnPrimary>
              <BtnOutline style={{ flex: 1 }} onClick={() => dismiss(req.id)}>Decline</BtnOutline>
            </div>
          </div>
        ))}
      </div>

      {/* Network */}
      <div>
        <SectionHeader title="Network" />
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input
            placeholder="Search network..."
            style={{
              width: '100%',
              border: '1.5px solid #D1D5DB',
              borderRadius: 0,
              padding: '7px 32px 7px 10px',
              fontSize: 12,
              outline: 'none',
              boxSizing: 'border-box' as const,
            }}
          />
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#6B7280' }}>⌕</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {NETWORK.map(person => (
            <div
              key={person.id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    backgroundColor: person.online ? '#22C55E' : '#9CA3AF',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{person.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <Link href={`/patients/${person.id}`}>
                  <button style={{ border: '1.5px solid #D1D5DB', background: '#fff', width: 24, height: 24, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📋</button>
                </Link>
                {['📞', '🎥', '✉'].map((icon, i) => (
                  <button
                    key={i}
                    style={{ border: '1.5px solid #D1D5DB', background: '#fff', width: 24, height: 24, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BtnOutline style={{ width: '100%', marginTop: 'auto' }}>Open Full Inbox</BtnOutline>
    </div>
  );
}

function CenterPanel() {
  const [insight, setInsight] = useState('');

  return (
    <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Create post */}
      <div>
        <SectionHeader title="Health Insights Feed" />
        <textarea
          value={insight}
          onChange={e => setInsight(e.target.value)}
          placeholder="Share professional medical advice or updates..."
          rows={4}
          style={{
            width: '100%',
            border: '1.5px dashed #9CA3AF',
            borderRadius: 0,
            padding: 10,
            fontSize: 12,
            resize: 'vertical' as const,
            outline: 'none',
            boxSizing: 'border-box' as const,
            fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 10 }}>
          {['📹 Video', '🖼 Images', '🔗 Browse'].map(label => (
            <BtnOutline key={label} style={{ fontSize: 10, padding: '5px 10px' }}>{label}</BtnOutline>
          ))}
        </div>
        <BtnPrimary style={{ width: '100%' }}>Publish Insight</BtnPrimary>
      </div>

      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {FEED_POSTS.map(post => (
          <div
            key={post.id}
            style={{ border: '1.5px solid #E5E7EB', backgroundColor: '#fff', padding: 16 }}
          >
            <div style={{ marginBottom: 6 }}>
              <span
                style={{
                  backgroundColor: post.tagColor,
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  letterSpacing: '0.08em',
                }}
              >
                {post.tag}
              </span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{post.title}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>{post.postedAt}</div>
            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{post.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RightPanel() {
  const [consultRate, setConsultRate] = useState('2500');
  const [acceptingNew, setAcceptingNew] = useState(true);
  const [chatConsults, setChatConsults] = useState(true);

  const totalMonth = PAYMENTS.reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Today's Schedule */}
      <div>
        <SectionHeader title="Today's Schedule" />
        {SCHEDULE.map(appt => (
          <div
            key={appt.id}
            style={{ border: '1.5px solid #D1D5DB', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, fontFamily: 'monospace' }}>{appt.time}</div>
              <div style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>{appt.patient} ({appt.mode})</div>
            </div>
            <Link href="/encounter/1"><BtnPrimary style={{ padding: '6px 14px' }}>Join</BtnPrimary></Link>
          </div>
        ))}
      </div>

      {/* Fee Schedule */}
      <div>
        <SectionHeader title="Fee Schedule" />
        <div style={{ border: '1.5px solid #D1D5DB', padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
            Virtual Consultation
          </div>
          <div style={{ display: 'flex', border: '1.5px solid #D1D5DB', marginBottom: 12 }}>
            <span style={{ padding: '8px 12px', backgroundColor: '#F9FAFB', borderRight: '1.5px solid #D1D5DB', fontSize: 14, fontWeight: 700 }}>₹</span>
            <input
              value={consultRate}
              onChange={e => setConsultRate(e.target.value)}
              style={{ flex: 1, border: 'none', padding: '8px 10px', fontSize: 14, fontWeight: 600, outline: 'none' }}
            />
          </div>
          <BtnPrimary style={{ width: '100%' }}>Save Rate</BtnPrimary>
        </div>
      </div>

      {/* Payments Received */}
      <div>
        <SectionHeader title="Payments Received" />
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
            Total (This Month)
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'monospace', marginTop: 4 }}>
            ₹{totalMonth.toLocaleString('en-IN')}
          </div>
        </div>
        {PAYMENTS.map(p => (
          <div
            key={p.id}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: 10 }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{p.patient}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{p.label} · {p.date}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>₹{p.amount.toLocaleString('en-IN')}</span>
              {p.paid && (
                <span style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: 10, fontWeight: 700, padding: '2px 8px', border: '1px solid #86EFAC' }}>
                  PAID
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Availability */}
      <div>
        <SectionHeader title="Availability" />
        <div style={{ border: '1.5px solid #D1D5DB' }}>
          {[
            { label: 'Accepting New', value: acceptingNew, set: setAcceptingNew },
            { label: 'Chat Consults', value: chatConsults, set: setChatConsults },
          ].map(({ label, value, set }, i) => (
            <label
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: i === 0 ? '1px solid #E5E7EB' : 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{label}</span>
              <input
                type="checkbox"
                checked={value}
                onChange={e => set(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#000', cursor: 'pointer' }}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const user = currentUser();

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Nav bar */}
      <nav style={{ backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px' }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>
          PROVIDER PORTAL: {user.name.toUpperCase()}
        </span>
        <BtnOutline style={{ borderColor: '#fff', color: '#fff', backgroundColor: 'transparent', padding: '5px 16px' }} onClick={handleLogout}>
          Log Out
        </BtnOutline>
      </nav>

      {/* Profile */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* Avatar */}
          <div style={{ width: 64, height: 64, backgroundColor: '#1F2937', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
            {user.name.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase()}
          </div>
          {/* Info */}
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '0.02em' }}>
              {user.name.toUpperCase()}, {DOCTOR.suffix}
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
              {DOCTOR.specialty} · License {DOCTOR.license}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <span style={{ border: '1.5px solid #D1D5DB', padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>Telehealth Only</span>
              <span style={{ border: '1.5px solid #D1D5DB', padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>Status: Accepting Patients</span>
            </div>
          </div>
        </div>
        <BtnOutline style={{ padding: '8px 16px' }}>Edit Profile Page</BtnOutline>
      </div>

      {/* Three-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: '#fff', margin: '20px 16px', border: '1px solid #E5E7EB' }}>
        <div style={{ borderRight: '1px solid #E5E7EB' }}><LeftPanel /></div>
        <div style={{ borderRight: '1px solid #E5E7EB' }}><CenterPanel /></div>
        <div><RightPanel /></div>
      </div>

    </div>
  );
}
