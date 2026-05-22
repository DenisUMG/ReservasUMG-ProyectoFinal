import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Genera y descarga un CSV con las salas y sus reservas.
import { Room, Reservation } from '@/types';

export function downloadRoomsReservationsCSV(rooms: Room[], reservations: Reservation[], filename = 'reporte_reservas.csv') {
  const headers = [
    'roomId',
    'roomName',
    'type',
    'capacity',
    'building',
    'floor',
    'reservationId',
    'date',
    'startTime',
    'endTime',
    'title',
    'reservedBy',
    'userRole',
  ];

  const rows: string[][] = [];

  rooms.forEach(room => {
    const roomRes = reservations.filter(r => r.roomId === room.id);
    if (roomRes.length === 0) {
      rows.push([
        room.id,
        room.name,
        room.type,
        String(room.capacity),
        room.building,
        String(room.floor),
        '', '', '', '', '', '', '',
      ]);
    } else {
      roomRes.forEach(r => {
        rows.push([
          room.id,
          room.name,
          room.type,
          String(room.capacity),
          room.building,
          String(room.floor),
          r.id,
          r.date,
          r.startTime,
          r.endTime,
          r.title,
          r.userName,
          r.userRole,
        ]);
      });
    }
  });

  const escapeCell = (s: string) => {
    if (s == null) return '';
    // Escape quotes and wrap in quotes if contains comma or newline
    const str = String(s);
    if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  };

  const csv = [headers.join(','), ...rows.map(r => r.map(escapeCell).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
