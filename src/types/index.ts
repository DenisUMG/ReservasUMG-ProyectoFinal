export type UserRole = 'alumno' | 'profesor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Room {
  id: string;
  name: string;
  type: 'laboratorio' | 'sala';
  capacity: number;
  building: string;
  floor: number;
}

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  roomId: string;
  roomName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  title: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
