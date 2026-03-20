'use client';

import { useQuery } from '@tanstack/react-query';
import { listServices } from '@/services/catalog';
import type { Service, ServiceCategory } from '@/services/catalog';

// ─── Design System (PRD §2 Brutalist Mandate) ───────────────────────────────
// High-contrast monochromatic palette, 4px solid black borders, 0px radius,
// hard offset shadows, monospace typography for all clinical/inventory data.
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  A_LA_CARTE: 'A-la-Carte',
  STANDARD: 'Standard',
  TRAVEL: 'Travel',
};

const CATEGORY_ORDER: ServiceCategory[] = ['A_LA_CARTE', 'STANDARD', 'TRAVEL'];

const CATEGORY_ACCENT: Record<ServiceCategory, string> = {
  A_LA_CARTE: '#ffffff',
  STANDARD:   '#F0F9FF',
  TRAVEL:     '#F0FDF4',
};

function PriceTag({ price }: { price: number }) {
  const formatted = price.toLocaleString('en-IN');
  return (
    <span className="font-mono font-black text-xl">
      ₹{formatted}
    </span>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <div
      style={{
        border: '4px solid #000',
        boxShadow: '4px 4px 0 #000000',
        backgroundColor: CATEGORY_ACCENT[service.category],
        borderRadius: 0,
      }}
      className="p-5 flex flex-col gap-3"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-mono font-black text-lg uppercase tracking-wide leading-tight">
            {service.name}
          </h3>
          <p className="font-mono text-xs text-gray-600 mt-0.5">{service.description}</p>
        </div>
        <div className="text-right shrink-0">
          <PriceTag price={service.priceInr} />
          {service.durationMinutes && (
            <p className="font-mono text-xs text-gray-500 mt-0.5">{service.durationMinutes} min</p>
          )}
        </div>
      </div>

      {/* Key features */}
      {service.keyFeatures && service.keyFeatures.length > 0 && (
        <ul className="mt-1 space-y-1">
          {service.keyFeatures.map((f, i) => (
            <li key={i} className="font-mono text-xs flex items-center gap-2">
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  backgroundColor: '#000',
                  flexShrink: 0,
                }}
              />
              {f}
            </li>
          ))}
        </ul>
      )}

      {/* Action */}
      <button
        style={{
          border: '3px solid #000',
          backgroundColor: '#000',
          color: '#fff',
          borderRadius: 0,
          fontFamily: 'monospace',
          fontWeight: 900,
          fontSize: 12,
          letterSpacing: '0.1em',
          padding: '8px 16px',
          cursor: 'pointer',
          marginTop: 'auto',
          textTransform: 'uppercase',
        }}
      >
        SELECT →
      </button>
    </div>
  );
}

function CategorySection({
  category,
  services,
}: {
  category: ServiceCategory;
  services: Service[];
}) {
  if (services.length === 0) return null;
  return (
    <section>
      <div
        style={{ borderBottom: '4px solid #000', marginBottom: 16, paddingBottom: 8 }}
        className="flex items-baseline gap-4"
      >
        <h2
          style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: '0.12em' }}
        >
          {CATEGORY_LABELS[category]}
        </h2>
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#6B7280' }}>
          {services.length} product{services.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(s => <ServiceCard key={s.id} service={s} />)}
      </div>
    </section>
  );
}

// Summary table matching the "Master Product Table" layout from the product image
function ProductTable({ services }: { services: Service[] }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 48 }}>
      <table
        style={{
          width: '100%',
          border: '4px solid #000',
          borderCollapse: 'collapse',
          fontFamily: 'monospace',
          fontSize: 13,
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#000', color: '#fff' }}>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 900, letterSpacing: '0.08em' }}>CATEGORY</th>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 900, letterSpacing: '0.08em' }}>PRODUCT</th>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 900, letterSpacing: '0.08em' }}>DESCRIPTION</th>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 900, letterSpacing: '0.08em' }}>KEY FEATURES</th>
            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 900, letterSpacing: '0.08em' }}>PRICE (INR)</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s, i) => (
            <tr
              key={s.id}
              style={{
                backgroundColor: i % 2 === 0 ? '#fff' : '#F9FAFB',
                borderBottom: '2px solid #000',
              }}
            >
              <td style={{ padding: '10px 14px', fontWeight: 700 }}>
                {CATEGORY_LABELS[s.category]}
              </td>
              <td style={{ padding: '10px 14px', fontWeight: 900 }}>{s.name}</td>
              <td style={{ padding: '10px 14px', color: '#374151' }}>{s.description}</td>
              <td style={{ padding: '10px 14px', color: '#374151' }}>
                {s.keyFeatures?.join(', ')}
              </td>
              <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 900 }}>
                ₹{s.priceInr.toLocaleString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ServicesPage() {
  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: listServices,
  });

  if (isLoading) {
    return (
      <div style={{ fontFamily: 'monospace', padding: 32, textAlign: 'center' }}>
        LOADING SERVICES…
      </div>
    );
  }

  if (error || !services) {
    return (
      <div style={{ fontFamily: 'monospace', padding: 32, color: '#DC2626', textAlign: 'center' }}>
        FAILED TO LOAD SERVICES
      </div>
    );
  }

  const byCategory = CATEGORY_ORDER.reduce<Record<ServiceCategory, Service[]>>(
    (acc, cat) => {
      acc[cat] = services.filter(s => s.category === cat);
      return acc;
    },
    { A_LA_CARTE: [], STANDARD: [], TRAVEL: [] }
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', fontFamily: 'monospace' }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontWeight: 900,
            fontSize: 28,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            borderBottom: '6px solid #000',
            paddingBottom: 10,
            marginBottom: 4,
          }}
        >
          Master Product Table
        </h1>
        <p style={{ fontSize: 12, color: '#6B7280', letterSpacing: '0.05em' }}>
          INTEGRATED ECOSYSTEM · ALL PRICES IN INR · USD CONVERSION VIA GEO-IP
        </p>
      </div>

      {/* Summary table */}
      <ProductTable services={services} />

      {/* Cards by category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {CATEGORY_ORDER.map(cat => (
          <CategorySection key={cat} category={cat} services={byCategory[cat]} />
        ))}
      </div>
    </div>
  );
}

