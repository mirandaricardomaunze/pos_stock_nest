// Define a custom Notification interface matching your Prisma schema
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  userId: number;
  companyId: number | null; 
}

