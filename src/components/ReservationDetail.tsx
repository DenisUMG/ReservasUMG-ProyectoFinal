import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Reservation } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useReservations } from '@/context/ReservationContext';
import { Clock, MapPin, User, Calendar, Trash2 } from 'lucide-react';
import { Edit3 } from 'lucide-react';
import ReservationModal from '@/components/ReservationModal';
import { useState } from 'react';

interface Props {
  reservation: Reservation | null;
  onClose: () => void;
}

export default function ReservationDetail({ reservation, onClose }: Props) {
  const { user } = useAuth();
  const { deleteReservation, approveReservation } = useReservations();
  const [editOpen, setEditOpen] = useState(false);
  if (!reservation) return null;

  const isOwn = user?.id === reservation.userId;
  const canEdit = user?.role === 'profesor' || isOwn;
  const canDelete = user?.role === 'profesor' || isOwn;
  const showApprove = user?.role === 'profesor' && reservation?.status === 'pending';

  return (
    <Dialog open={!!reservation} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl glass-strong">
        <DialogHeader>
          <DialogTitle className="text-foreground">{reservation.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="flex items-center gap-3 text-sm text-foreground">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span>{reservation.roomName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span>{reservation.date}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span>{reservation.startTime} - {reservation.endTime}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground">
            <User className="w-4 h-4 text-primary shrink-0" />
            <span>
              {reservation.userName} <span className="text-muted-foreground capitalize">({reservation.userRole})</span>
              {reservation.status && (
                <span className={`ml-2 inline-flex items-center px-2 py-0.5 text-[11px] rounded-full font-medium ${
                  reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : reservation.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-destructive/10 text-destructive'
                }`}>
                  {reservation.status === 'pending' ? 'Pendiente' : reservation.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {canEdit && (
            <Button variant="outline" onClick={() => setEditOpen(true)} className="flex-1 rounded-xl gap-2">
              <Edit3 className="w-4 h-4" /> Editar
            </Button>
          )}
          {canDelete && (
            <Button variant="outline" onClick={() => { deleteReservation(reservation.id); onClose(); }}
              className="flex-1 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10 gap-2">
              <Trash2 className="w-4 h-4" /> Cancelar reserva
            </Button>
          )}
          {showApprove && (
            <Button variant="secondary" onClick={() => { approveReservation(reservation.id); onClose(); }}
              className="flex-1 rounded-xl bg-emerald-600 text-white gap-2">
              Aprobar
            </Button>
          )}
        </div>
        {canEdit && (
          <ReservationModal open={editOpen} onClose={() => setEditOpen(false)} reservation={reservation} />
        )}
      </DialogContent>
    </Dialog>
  );
}
