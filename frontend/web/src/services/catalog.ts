import api from '@/lib/api';

export type ServiceCategory = 'A_LA_CARTE' | 'STANDARD' | 'TRAVEL';
export type ServiceType = 'TRANSACTIONAL' | 'PROCEDURAL';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  serviceType: ServiceType;
  keyFeatures: string[];
  priceInr: number;
  durationMinutes: number | null;
  sortOrder: number;
  active: boolean;
}

// Static seed — mirrors V3__master_product_table.sql.
// Used as fallback when the backend API is unavailable.
export const STATIC_SERVICES: Service[] = [
  { id: '00000001-0000-0000-0000-000000000001', name: 'E-Prescription',  description: 'Quick Rx Issuance/Renewal', category: 'A_LA_CARTE', serviceType: 'TRANSACTIONAL', keyFeatures: ['Valid Digital Signature', 'Doctor Review', 'Pharmacy Ready'], priceInr: 499,   durationMinutes: null, sortOrder: 1, active: true },
  { id: '00000001-0000-0000-0000-000000000002', name: 'Virtual Consult',  description: '20-min Video Session',      category: 'A_LA_CARTE', serviceType: 'TRANSACTIONAL', keyFeatures: ['Secure Link', 'Digital EMR Integration'],                   priceInr: 999,   durationMinutes: 20,  sortOrder: 2, active: true },
  { id: '00000001-0000-0000-0000-000000000003', name: 'Lab Test',         description: 'Individual Diagnostics',    category: 'A_LA_CARTE', serviceType: 'TRANSACTIONAL', keyFeatures: ['Home Collection', 'Digital Report'],                        priceInr: 799,   durationMinutes: null, sortOrder: 3, active: true },
  { id: '00000001-0000-0000-0000-000000000004', name: 'Sahayak Assist',   description: 'Health Coach Visit',        category: 'A_LA_CARTE', serviceType: 'TRANSACTIONAL', keyFeatures: ['1-hr Home Visit', 'Vitals Check', 'Medication Audit'],      priceInr: 1499,  durationMinutes: 60,  sortOrder: 4, active: true },
  { id: '00000002-0000-0000-0000-000000000001', name: 'Basic',            description: 'Essential Check',           category: 'STANDARD',   serviceType: 'PROCEDURAL',    keyFeatures: ['Vitals', 'CBC', 'Sugar & Lipid', '1 MD Consult'],           priceInr: 4999,  durationMinutes: null, sortOrder: 5, active: true },
  { id: '00000002-0000-0000-0000-000000000002', name: 'Comprehensive',    description: 'Active Prevention',         category: 'STANDARD',   serviceType: 'PROCEDURAL',    keyFeatures: ['Basic Package', 'LFT / KFT', '1 Sahayak Visit'],            priceInr: 9999,  durationMinutes: null, sortOrder: 6, active: true },
  { id: '00000002-0000-0000-0000-000000000003', name: 'Executive',        description: 'Deep Health Insight',       category: 'STANDARD',   serviceType: 'PROCEDURAL',    keyFeatures: ['Comprehensive Package', 'Cardiac Screening', '2 MD Consults'], priceInr: 14999, durationMinutes: null, sortOrder: 7, active: true },
  { id: '00000003-0000-0000-0000-000000000001', name: 'Fit2Fly Lite',     description: 'Parent Travelers',          category: 'TRAVEL',     serviceType: 'PROCEDURAL',    keyFeatures: ['Vitals', 'EKG', 'Lung Screen', 'Mental Health Screen'],    priceInr: 12999, durationMinutes: null, sortOrder: 8, active: true },
  { id: '00000003-0000-0000-0000-000000000002', name: 'Fit2Fly 360',      description: 'Senior Travelers',          category: 'TRAVEL',     serviceType: 'PROCEDURAL',    keyFeatures: ['Fit2Fly Lite Package', 'Colonoscopy', 'DEXA Scan', 'Gender Screening'], priceInr: 18999, durationMinutes: null, sortOrder: 9, active: true },
];

export async function listServices(): Promise<Service[]> {
  try {
    const { data } = await api.get<Service[]>('/services');
    return data;
  } catch {
    return STATIC_SERVICES;
  }
}

export async function listServicesByCategory(category: ServiceCategory): Promise<Service[]> {
  try {
    const { data } = await api.get<Service[]>(`/services/category/${category}`);
    return data;
  } catch {
    return STATIC_SERVICES.filter(s => s.category === category);
  }
}
