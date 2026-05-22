import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROOMS } from '@/data/mockData';
import { useReservations } from '@/context/ReservationContext';
import { Reservation } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, CalendarPlus } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultTime?: string;
  defaultRoomId?: string;
  reservation?: Reservation | null;
}

export default function ReservationModal({ open, onClose, defaultDate, defaultTime, defaultRoomId, reservation }: Props) {
  const { user } = useAuth();
  const { addReservation, hasConflict, updateReservation } = useReservations();
  const [roomId, setRoomId] = useState(defaultRoomId || '');
  const [date, setDate] = useState(defaultDate || '');
  const [startTime, setStartTime] = useState(defaultTime || '');
  const [endTime, setEndTime] = useState('');
  const [title, setTitle] = useState('');
  const [conflict, setConflict] = useState(false);

  useEffect(() => {
    if (open) {
      setRoomId(defaultRoomId || (reservation?.roomId ?? ''));
      setDate(defaultDate || (reservation?.date ?? ''));
      setStartTime(defaultTime || (reservation?.startTime ?? ''));
      setEndTime(reservation ? (reservation.endTime) : (defaultTime ? `${String(Number(defaultTime.split(':')[0]) + 1).padStart(2, '0')}:00` : ''));
      setTitle(reservation?.title ?? '');
      setConflict(false);
    }
  }, [open, defaultDate, defaultTime, defaultRoomId]);

  useEffect(() => {
    if (roomId && date && startTime && endTime) {
      setConflict(hasConflict(roomId, date, startTime, endTime, reservation?.id));
    } else {
      setConflict(false);
    }
  }, [roomId, date, startTime, endTime, hasConflict, reservation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !roomId || !date || !startTime || !endTime || !title) return;
    const room = ROOMS.find(r => r.id === roomId);
    if (!room) return;
    if (reservation) {
      const ok = updateReservation(reservation.id, {
        userId: reservation.userId as any,
        title,
        roomId,
        roomName: room.name,
        date,
        startTime,
        endTime,
      } as any);
      if (ok) onClose();
      return;
    }
    const success = addReservation({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      roomId,
      roomName: room.name,
      date,
      startTime,
      endTime,
      title,
    });
    if (success) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CalendarPlus className="w-5 h-5 text-primary" />
            {reservation ? 'Modificar Reserva' : 'Nueva Reserva'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Práctica de Redes" className="rounded-xl" required />
          </div>

          <div className="space-y-2">
            <Label>Sala / Laboratorio</Label>
            <Select value={roomId} onValueChange={setRoomId} required>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona un espacio" /></SelectTrigger>
              <SelectContent>
                {ROOMS.map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} · {r.building} (Cap. {r.capacity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Hora inicio</Label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label>Hora fin</Label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="rounded-xl" required />
            </div>
          </div>

          {conflict && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Ya existe una reserva en este horario para esta sala.</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancelar</Button>
            <Button type="submit" disabled={conflict || !title || !roomId || !date || !startTime || !endTime} className="flex-1 rounded-xl gradient-primary text-primary-foreground">
              {reservation ? 'Guardar cambios' : 'Confirmar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
