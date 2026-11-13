export interface EquipmentItem {
  id: string;
  name: string;
  department: string;
  category: string;
  description: string | null;
  status: string;
  condition: string | null;
  serialNumber: string | null;
  location: string | null;
  imageUrl: string | null;
  currentBorrower: string | null;
  borrowerPhone: string | null;
  availableQuantity: number;
  totalQuantity: number;
  quantity: number;
  myBorrowId?: string | null;
  createdAt: string;
  transactionType?: string;
}

export interface BorrowTx {
  id: string; 
  equipmentId: string; 
  borrowQuantity: number; 
  status: string;
  borrowDate: string; 
  dueDate: string; 
  returnDate?: string | null;
  pickupLocation: string | null;
  transactionType: string;
  equipment: { name: string; imageUrl: string | null; category?: string; serialNumber?: string | null };
  borrower?: { fullName: string; username: string; phone: string | null; department?: string | null; image?: string | null };
}

export interface UserData {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  status?: string;
  image?: string | null;
  department: string;
  borrowedCount: number;
  borrows?: BorrowTx[];
}
