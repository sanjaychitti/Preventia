import api from '@/lib/api';

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  fileName: string;
  createdAt: string;
}

export interface CreatePrescriptionPayload {
  appointmentId: string;
  diagnosis: string;
  /** Base64-encoded PDF */
  pdfBase64: string;
  fileName?: string;
}

export async function createPrescription(payload: CreatePrescriptionPayload): Promise<Prescription> {
  const { data } = await api.post<Prescription>('/prescriptions', payload);
  return data;
}

export async function getPrescription(id: string): Promise<Prescription> {
  const { data } = await api.get<Prescription>(`/prescriptions/${id}`);
  return data;
}

/** Returns the 15-minute pre-signed S3 URL for the prescription PDF. */
export async function getPrescriptionViewUrl(id: string): Promise<string> {
  const { data } = await api.get<string>(`/prescriptions/${id}/view`);
  return data;
}

export async function listPrescriptionsForAppointment(appointmentId: string): Promise<Prescription[]> {
  const { data } = await api.get<Prescription[]>(`/prescriptions/appointment/${appointmentId}`);
  return data;
}
