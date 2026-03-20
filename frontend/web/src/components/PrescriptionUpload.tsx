'use client';

import { useMutation } from '@tanstack/react-query';
import { createPrescription } from '@/services/prescriptions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRef } from 'react';

const schema = z.object({
  diagnosis: z.string().min(5, 'Diagnosis must be at least 5 characters'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  appointmentId: string;
  onUploaded: () => void;
}

export default function PrescriptionUpload({ appointmentId, onUploaded }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: async (values: FormValues) => {
      const file = fileRef.current?.files?.[0];
      if (!file) throw new Error('Please select a PDF file');
      const buffer = await file.arrayBuffer();
      const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      return createPrescription({
        appointmentId,
        diagnosis: values.diagnosis,
        pdfBase64,
        fileName: file.name,
      });
    },
    onSuccess: () => {
      reset();
      if (fileRef.current) fileRef.current.value = '';
      onUploaded();
    },
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Prescription</h2>
      <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis / Notes</label>
          <textarea
            {...register('diagnosis')}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.diagnosis && <p className="text-red-600 text-xs mt-1">{errors.diagnosis.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prescription PDF</label>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="text-sm text-gray-600"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Uploading…' : 'Upload Prescription'}
        </button>
        {isSuccess && <p className="text-green-600 text-sm">Prescription uploaded successfully.</p>}
      </form>
    </div>
  );
}
