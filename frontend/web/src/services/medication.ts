import api from '@/lib/api';

export type VerificationStatus = 'VERIFIED' | 'SELF_REPORTED' | 'SYSTEM_CRON';

export interface MedicationInventory {
  id: string;
  medicationName: string;
  dosageDescription: string | null;
  actualStockCount: number;
  dailyDosage: number;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStockResult {
  inventory: MedicationInventory;
  refill_required: boolean;
  days_remaining: number;
  drastic_change_warning?: string;
}

export async function listMedications(recipientId: string): Promise<MedicationInventory[]> {
  const { data } = await api.get<MedicationInventory[]>(`/medication-inventory/recipient/${recipientId}`);
  return data;
}

export async function updateStock(inventoryId: string, newCount: number, reason?: string): Promise<UpdateStockResult> {
  const { data } = await api.patch<UpdateStockResult>(`/medication-inventory/${inventoryId}/stock`, {
    newCount,
    reason,
  });
  return data;
}
