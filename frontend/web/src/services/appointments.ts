import api from '@/lib/api';

export interface Appointment {
  id: string;
  sponsorId: string;
  recipientId: string;
  doctorId: string;
  doctorName: string;
  scheduledAt: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dailyRoomUrl: string | null;
  recipientToken: string | null;
  notes: string | null;
  createdAt: string;
}

export interface BookAppointmentPayload {
  recipientId: string;
  doctorId: string;
  scheduledAt: string;
  notes?: string;
}

export async function bookAppointment(payload: BookAppointmentPayload): Promise<Appointment> {
  const { data } = await api.post<Appointment>('/appointments', payload);
  return data;
}

export async function getAppointment(id: string): Promise<Appointment> {
  const { data } = await api.get<Appointment>(`/appointments/${id}`);
  return data;
}

export async function listMyAppointments(): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>('/appointments/my');
  return data;
}

export async function updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}/status`, null, {
    params: { status },
  });
  return data;
}
