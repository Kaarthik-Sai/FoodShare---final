export interface User {
  id: string;
  name: string;
  email: string;
  role: "donor" | "ngo" | "volunteer" | "admin";
  phone: string;
  address: string;
  organizationName?: string;
  avatar?: string;
  createdAt: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  donorAddress: string;
  foodType: "cooked" | "raw" | "packaged" | "dry" | "other";
  title: string;
  description: string;
  quantity: string;
  cookedTime?: string;
  expiryTime: string;
  status: "pending" | "accepted" | "assigned" | "picked_up" | "delivered" | "cancelled";
  ngoId?: string;
  ngoName?: string;
  volunteerId?: string;
  volunteerName?: string;
  image?: string;
  pickupNotes?: string;
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStats {
  totalDonations: number;
  activeDonations: number;
  completedDonations: number;
  totalUsers: number;
  totalNgos: number;
  totalVolunteers: number;
  totalDonors: number;
  estimatedMeals: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}
