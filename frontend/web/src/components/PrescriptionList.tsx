'use client';

import { getPrescriptionViewUrl, type Prescription } from '@/services/prescriptions';
import { format } from 'date-fns';

interface Props {
  prescriptions: Prescription[];
}

export default function PrescriptionList({ prescriptions }: Props) {
  const handleView = async (id: string) => {
    const url = await getPrescriptionViewUrl(id);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (prescriptions.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Prescriptions</h2>
        <p className="text-sm text-gray-500">No prescriptions yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Prescriptions</h2>
      <ul className="divide-y divide-gray-100">
        {prescriptions.map((p) => (
          <li key={p.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{p.fileName}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {p.diagnosis} · {format(new Date(p.createdAt), 'PPP')}
              </p>
            </div>
            <button
              onClick={() => handleView(p.id)}
              className="text-blue-600 text-sm hover:underline"
            >
              View PDF
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
