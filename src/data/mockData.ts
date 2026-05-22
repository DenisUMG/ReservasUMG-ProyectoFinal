import { Room, Reservation } from '@/types';
import { format, addDays } from 'date-fns';

export const ROOMS: Room[] = [
  { id: 'lab-1', name: 'Lab. Informática 1', type: 'laboratorio', capacity: 30, building: 'Edificio A', floor: 1 },
  { id: 'lab-2', name: 'Lab. Informática 2', type: 'laboratorio', capacity: 25, building: 'Edificio A', floor: 2 },
  { id: 'lab-3', name: 'Lab. Electrónica', type: 'laboratorio', capacity: 20, building: 'Edificio B', floor: 1 },
  { id: 'lab-4', name: 'Lab. Redes', type: 'laboratorio', capacity: 15, building: 'Edificio B', floor: 2 },
  { id: 'sala-1', name: 'Sala de Reuniones A', type: 'sala', capacity: 10, building: 'Edificio A', floor: 3 },
  { id: 'sala-2', name: 'Sala de Estudio 1', type: 'sala', capacity: 20, building: 'Edificio C', floor: 1 },
  { id: 'sala-3', name: 'Sala Multiusos', type: 'sala', capacity: 50, building: 'Edificio C', floor: 2 },
];

const today = new Date();
const todayStr = format(today, 'yyyy-MM-dd');
const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');
const dayAfterStr = format(addDays(today, 2), 'yyyy-MM-dd');

export const INITIAL_RESERVATIONS: Reservation[] = [
  { id: 'r1', userId: '2', userName: 'Dra. María López', userRole: 'profesor', roomId: 'lab-1', roomName: 'Lab. Informática 1', date: todayStr, startTime: '09:00', endTime: '11:00', title: 'Programación Avanzada', status: 'approved', createdAt: new Date().toISOString() },
  { id: 'r2', userId: '3', userName: 'Prof. Juan Ruiz', userRole: 'profesor', roomId: 'lab-2', roomName: 'Lab. Informática 2', date: todayStr, startTime: '10:00', endTime: '12:00', title: 'Base de Datos', status: 'approved', createdAt: new Date().toISOString() },
  { id: 'r3', userId: '1', userName: 'Carlos García', userRole: 'alumno', roomId: 'sala-1', roomName: 'Sala de Reuniones A', date: todayStr, startTime: '14:00', endTime: '16:00', title: 'Proyecto Final', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'r4', userId: '2', userName: 'Dra. María López', userRole: 'profesor', roomId: 'lab-3', roomName: 'Lab. Electrónica', date: tomorrowStr, startTime: '08:00', endTime: '10:00', title: 'Circuitos Digitales', status: 'approved', createdAt: new Date().toISOString() },
  { id: 'r5', userId: '4', userName: 'Ana Martínez', userRole: 'alumno', roomId: 'sala-2', roomName: 'Sala de Estudio 1', date: tomorrowStr, startTime: '16:00', endTime: '18:00', title: 'Grupo de Estudio', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'r6', userId: '5', userName: 'Prof. Elena Torres', userRole: 'profesor', roomId: 'lab-1', roomName: 'Lab. Informática 1', date: dayAfterStr, startTime: '11:00', endTime: '13:00', title: 'Inteligencia Artificial', status: 'approved', createdAt: new Date().toISOString() },
];
