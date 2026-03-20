'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listBidsForPrescription, acceptBid } from '@/services/pharmacyBids';
import type { PharmacyBid } from '@/services/pharmacyBids';

interface Props {
  prescriptionId: string;
}

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  PENDING:    { backgroundColor: '#FEF9C3', border: '2px solid #CA8A04', color: '#92400E' },
  ACCEPTED:   { backgroundColor: '#D1FAE5', border: '2px solid #059669', color: '#065F46' },
  REJECTED:   { backgroundColor: '#FEE2E2', border: '2px solid #DC2626', color: '#991B1B' },
  EXPIRED:    { backgroundColor: '#F3F4F6', border: '2px solid #9CA3AF', color: '#374151' },
  DISPATCHED: { backgroundColor: '#DBEAFE', border: '2px solid #2563EB', color: '#1E3A8A' },
  DELIVERED:  { backgroundColor: '#F0FDF4', border: '2px solid #16A34A', color: '#14532D' },
};

export default function PharmacyBidList({ prescriptionId }: Props) {
  const queryClient = useQueryClient();
  const { data: bids, isLoading } = useQuery({
    queryKey: ['bids', prescriptionId],
    queryFn: () => listBidsForPrescription(prescriptionId),
  });

  const { mutate: accept, isPending } = useMutation({
    mutationFn: (bidId: string) => acceptBid(bidId, 'razorpay_placeholder'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bids', prescriptionId] }),
  });

  if (isLoading) return <p className="font-mono text-sm">LOADING BIDS…</p>;
  if (!bids || bids.length === 0) return <p className="font-mono text-sm text-gray-500">No pharmacy bids yet.</p>;

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <h3 className="font-black uppercase tracking-widest text-sm mb-3 border-b-4 border-black pb-1">
        Pharmacy Bids
      </h3>
      <div className="space-y-3">
        {bids.map((bid: PharmacyBid) => (
          <div
            key={bid.id}
            className="p-4"
            style={{ border: '4px solid #000', boxShadow: '4px 4px 0 #000' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-xl">₹{bid.quotedPriceInr.toLocaleString('en-IN')}</span>
              <span className="text-xs font-bold px-2 py-0.5" style={STATUS_STYLE[bid.status]}>
                {bid.status}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Est. delivery: <strong>{bid.estimatedDeliveryHours}h</strong>
            </p>
            {bid.notes && <p className="text-xs text-gray-500 mt-1">{bid.notes}</p>}

            {bid.status === 'PENDING' && (
              <button
                onClick={() => accept(bid.id)}
                disabled={isPending}
                className="mt-3 w-full font-black uppercase text-sm py-2 px-4 tracking-widest disabled:opacity-50"
                style={{ backgroundColor: '#000', color: '#fff', border: '4px solid #000' }}
              >
                [ACCEPT &amp; PAY]
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
