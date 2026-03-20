'use client';

import { useQuery } from '@tanstack/react-query';
import { listMedications } from '@/services/medication';
import type { MedicationInventory } from '@/services/medication';

interface Props {
  recipientId: string;
}

function MedCard({ med }: { med: MedicationInventory }) {
  const daysRemaining = med.actualStockCount / med.dailyDosage;
  const refillRequired = daysRemaining <= 7;
  const isVerified = med.verificationStatus === 'VERIFIED';

  return (
    <div
      className="p-4 font-mono"
      style={{
        border: '4px solid #000',
        boxShadow: '4px 4px 0 #000',
        backgroundColor: refillRequired ? '#FEF08A' : '#fff',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-black text-base uppercase">{med.medicationName}</span>
        <span
          className="text-xs font-bold px-2 py-0.5"
          style={{
            border: '2px solid',
            borderColor: isVerified ? '#000' : '#9CA3AF',
            color: isVerified ? '#000' : '#9CA3AF',
          }}
        >
          {isVerified ? 'VERIFIED' : 'SELF-REPORTED'}
        </span>
      </div>

      {med.dosageDescription && (
        <p className="text-xs text-gray-600 mt-1">{med.dosageDescription}</p>
      )}

      <div className="mt-3 flex items-end gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Stock</p>
          <p className="text-2xl font-black">{med.actualStockCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Days Left</p>
          <p className={`text-2xl font-black ${refillRequired ? 'text-red-700' : ''}`}>
            {daysRemaining.toFixed(1)}
          </p>
        </div>
      </div>

      {refillRequired && (
        <p className="mt-2 text-xs font-black uppercase tracking-widest text-red-700">
          ⚠ REFILL REQUIRED
        </p>
      )}
    </div>
  );
}

export default function MedicationDashboard({ recipientId }: Props) {
  const { data: meds, isLoading } = useQuery({
    queryKey: ['medications', recipientId],
    queryFn: () => listMedications(recipientId),
  });

  if (isLoading) return <p className="font-mono text-sm">LOADING MEDICATIONS…</p>;

  const refillMeds = meds?.filter(m => m.actualStockCount / m.dailyDosage <= 7) ?? [];

  return (
    <div>
      {refillMeds.length > 0 && (
        <div
          className="p-3 mb-4 font-mono text-sm font-black uppercase"
          style={{ backgroundColor: '#000', color: '#FACC15' }}
        >
          ⚠ {refillMeds.length} MEDICATION(S) NEED REFILL
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {meds?.map(m => <MedCard key={m.id} med={m} />)}
      </div>

      {meds?.length === 0 && (
        <p className="font-mono text-gray-500 text-sm">No medication records.</p>
      )}
    </div>
  );
}
