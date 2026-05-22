import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Reservation } from '@/types';
import { INITIAL_RESERVATIONS } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ReservationContextType {
  reservations: Reservation[];
  addReservation: (r: Omit<Reservation, 'id' | 'createdAt'>) => boolean;
  deleteReservation: (id: string) => void;
  updateReservation: (id: string, data: Partial<Pick<Reservation, 'title' | 'roomId' | 'roomName' | 'date' | 'startTime' | 'endTime'>>) => boolean;
  approveReservation: (id: string) => boolean;
  hasConflict: (roomId: string, date: string, startTime: string, endTime: string, excludeId?: string) => boolean;
}

const ReservationContext = createContext<ReservationContextType | null>(null);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const { toast } = useToast();
  const { user } = useAuth();

  const hasConflict = useCallback((roomId: string, date: string, startTime: string, endTime: string, excludeId?: string) => {
    return reservations.some(r => {
      if (r.roomId !== roomId || r.date !== date) return false;
      if (excludeId && r.id === excludeId) return false;
      return startTime < r.endTime && endTime > r.startTime;
    });
  }, [reservations]);

  const addReservation = useCallback((data: Omit<Reservation, 'id' | 'createdAt'>) => {
    if (hasConflict(data.roomId, data.date, data.startTime, data.endTime)) {
      toast({ title: '⚠️ Conflicto de horario', description: 'Ya existe una reserva en ese horario para esta sala.', variant: 'destructive' });
      return false;
    }
    const newReservation: Reservation = {
      ...data,
      status: data.userRole === 'alumno' ? 'pending' : 'approved',
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setReservations(prev => [...prev, newReservation]);
    toast({ title: '✅ Reserva confirmada', description: `${data.roomName} reservado correctamente.` });
    return true;
  }, [hasConflict, toast]);

  const approveReservation = useCallback((id: string) => {
    const res = reservations.find(r => r.id === id);
    if (!res) {
      toast({ title: 'Error', description: 'Reserva no encontrada.', variant: 'destructive' });
      return false;
    }
    if (!user || user.role !== 'profesor') {
      toast({ title: 'Acceso denegado', description: 'Solo profesores pueden aprobar reservas.', variant: 'destructive' });
      return false;
    }
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    toast({ title: 'Reserva aprobada', description: 'La reserva ha sido aprobada.' });
    return true;
  }, [reservations, user, toast]);

  const deleteReservation = useCallback((id: string) => {
    const res = reservations.find(r => r.id === id);
    if (!res) {
      toast({ title: 'Error', description: 'Reserva no encontrada.', variant: 'destructive' });
      return;
    }
    if (!user) {
      toast({ title: 'Acceso denegado', description: 'Debes iniciar sesión para eliminar reservas.', variant: 'destructive' });
      return;
    }
    if (user.role !== 'profesor' && user.id !== res.userId) {
      toast({ title: 'Permiso denegado', description: 'No tienes permiso para eliminar esta reserva.', variant: 'destructive' });
      return;
    }
    setReservations(prev => prev.filter(r => r.id !== id));
    toast({ title: 'Reserva cancelada', description: 'La reserva ha sido eliminada.' });
  }, [reservations, user, toast]);

  const updateReservation = useCallback((id: string, data: Partial<Pick<Reservation, 'title' | 'roomId' | 'roomName' | 'date' | 'startTime' | 'endTime'>>) => {
    const res = reservations.find(r => r.id === id);
    if (!res) {
      toast({ title: 'Error', description: 'Reserva no encontrada.', variant: 'destructive' });
      return false;
    }
    if (!user) {
      toast({ title: 'Acceso denegado', description: 'Debes iniciar sesión para modificar reservas.', variant: 'destructive' });
      return false;
    }
    if (user.role !== 'profesor' && user.id !== res.userId) {
      toast({ title: 'Permiso denegado', description: 'No tienes permiso para modificar esta reserva.', variant: 'destructive' });
      return false;
    }
    const newRoomId = data.roomId ?? res.roomId;
    const newDate = data.date ?? res.date;
    const newStart = data.startTime ?? res.startTime;
    const newEnd = data.endTime ?? res.endTime;
    if (hasConflict(newRoomId, newDate, newStart, newEnd, id)) {
      toast({ title: '⚠️ Conflicto de horario', description: 'Ya existe una reserva en ese horario para esta sala.', variant: 'destructive' });
      return false;
    }
    setReservations(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    toast({ title: 'Reserva modificada', description: 'Los datos de la reserva se actualizaron correctamente.' });
    return true;
  }, [reservations, user, hasConflict, toast]);

  return (
    <ReservationContext.Provider value={{ reservations, addReservation, deleteReservation, updateReservation, approveReservation, hasConflict }}>
      {children}
    </ReservationContext.Provider>
  );
}

export const useReservations = () => {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error('useReservations must be inside ReservationProvider');
  return ctx;
};
