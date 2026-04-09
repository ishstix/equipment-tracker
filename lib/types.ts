export type EquipmentCondition = 'good' | 'needs_repair' | 'out_of_commission';
export type CheckoutStatus = 'active' | 'returned' | 'overdue';

export interface Equipment {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  total_quantity: number;
  available_quantity: number;
  condition: EquipmentCondition;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckoutRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  checkout_date: string;
  due_date: string;
  status: CheckoutStatus;
  notes: string | null;
  created_at: string;
  items?: CheckoutItem[];
}

export interface CheckoutItem {
  id: string;
  request_id: string;
  equipment_id: string;
  quantity: number;
  returned: boolean;
  return_date: string | null;
  equipment?: Equipment;
}

export interface CartItem {
  equipment: Equipment;
  quantity: number;
}
