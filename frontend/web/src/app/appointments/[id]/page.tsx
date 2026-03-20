'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointment, updateAppointmentStatus } from '@/services/appointments';
import { listPrescriptionsForAppointment } from '@/services/prescriptions';
import { format } from 'date-fns';
import { use } from 'react';
import PrescriptionUpload from '@/components/PrescriptionUpload';
import PrescriptionList from '@/components/PrescriptionList';
import PharmacyBidList from '@/components/PharmacyBidList';

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => getAppointment(id),
  });

  const { data: prescriptions } = useQuery({
    queryKey: ['prescriptions', id],
    queryFn: () => listPrescriptionsForAppointment(id),
    enabled: !!id,
  });

  const { mutate: markComplete } = useMutation({
    mutationFn: () => updateAppointmentStatus(id, 'COMPLETED'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointment', id] }),
  });

  if (isLoading || !appointment) {
    return <div className="p-8 text-center text-gray-500">Loading…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Appointment Details</h1>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Doctor</dt>
            <dd className="font-medium">{appointment.doctorName}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Scheduled</dt>
            <dd className="font-medium">{format(new Date(appointment.scheduledAt), 'PPP p')}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Status</dt>
            <dd className="font-medium">{appointment.status}</dd>
          </div>
          {appointment.dailyRoomUrl && (
            <div>
              <dt className="text-gray-500">Video Room</dt>
              <dd>
                <a
                  href={appointment.dailyRoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Join call
                </a>
              </dd>
            </div>
          )}
        </dl>
        {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
          <button
            onClick={() => markComplete()}
            className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
          >
            Mark Complete
          </button>
        )}
      </div>

      <PrescriptionUpload appointmentId={id} onUploaded={() =>
        queryClient.invalidateQueries({ queryKey: ['prescriptions', id] })
      } />

      <PrescriptionList prescriptions={prescriptions ?? []} />

      {/* Physician split-pane: PRD §6.2 — prescription list on left includes pharmacy bids */}
      {prescriptions && prescriptions.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pharmacy Bids</h2>
          <PharmacyBidList prescriptionId={prescriptions[0].id} />
        </div>
      )}
    </div>
  );
}
