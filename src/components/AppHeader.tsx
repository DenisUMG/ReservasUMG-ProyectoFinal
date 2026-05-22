import { useAuth } from '@/context/AuthContext';
import { FlaskConical, LogOut, GraduationCap, BookOpen, DownloadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReservations } from '@/context/ReservationContext';
import { ROOMS } from '@/data/mockData';
import { downloadRoomsReservationsCSV } from '@/lib/utils';

export default function AppHeader() {
  const { user, logout } = useAuth();
  if (!user) return null;
  const { reservations } = useReservations();

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">UMG-Reservas</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm">
            {user.role === 'alumno' ? <GraduationCap className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
            <span className="font-medium text-foreground">{user.name}</span>
            <span className="text-muted-foreground capitalize">· {user.role}</span>
          </div>
          {user.role === 'profesor' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const date = new Date().toISOString().slice(0,10);
                downloadRoomsReservationsCSV(ROOMS, reservations, `reporte_reservas_${date}.csv`);
              }}
              className="rounded-xl"
            >
              <DownloadCloud className="w-4 h-4 mr-2" />
              Descargar Reporte
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={logout} className="rounded-xl hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
