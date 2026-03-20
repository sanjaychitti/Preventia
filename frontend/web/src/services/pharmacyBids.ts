import api from '@/lib/api';

export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'DISPATCHED' | 'DELIVERED';

export interface PharmacyBid {
  id: string;
  prescriptionId: string;
  pharmacyId: string;
  quotedPriceInr: number;
  estimatedDeliveryHours: number;
  status: BidStatus;
  razorpayPaymentId: string | null;
  acceptedAt: string | null;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  notes: string | null;
  createdAt: string;
}

export async function listBidsForPrescription(prescriptionId: string): Promise<PharmacyBid[]> {
  const { data } = await api.get<PharmacyBid[]>(`/pharmacy-bids/prescription/${prescriptionId}`);
  return data;
}

export async function acceptBid(bidId: string, razorpayPaymentId: string): Promise<PharmacyBid> {
  const { data } = await api.post<PharmacyBid>(`/pharmacy-bids/${bidId}/accept`, { razorpayPaymentId });
  return data;
}
