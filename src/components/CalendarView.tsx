import { useState, useMemo } from 'react';
import {
  format, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  eachDayOfInterval, addMonths, subMonths, addWeeks, subWeeks,
  addDays, subDays, isToday, isSameMonth, isSameDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useReservations } from '@/context/ReservationContext';
import { useAuth } from '@/context/AuthContext';
import { ROOMS } from '@/data/mockData';
import ReservationModal from './ReservationModal';
import ReservationDetail from './ReservationDetail';
import { Reservation } from '@/types';
import { ChevronLeft, ChevronRight, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ViewMode = 'day' | 'week' | 'month';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00

export default function CalendarView() {
  const { user } = useAuth();
  const { reservations } = useReservations();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [search, setSearch] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaults, setModalDefaults] = useState<{ date?: string; time?: string; roomId?: string }>({});
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const navigate = (dir: 1 | -1) => {
    if (viewMode === 'month') setCurrentDate(dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(dir === 1 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    else setCurrentDate(dir === 1 ? addDays(currentDate, 1) : subDays(currentDate, 1));
  };

  const days = useMemo(() => {
    if (viewMode === 'month') {
      const start = startOfWeek(startOfMonth(currentDate), { locale: es });
      const end = endOfWeek(endOfMonth(currentDate), { locale: es });
      return eachDayOfInterval({ start, end });
    }
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { locale: es });
      const end = endOfWeek(currentDate, { locale: es });
      return eachDayOfInterval({ start, end });
    }
    return [currentDate];
  }, [currentDate, viewMode]);

  const filtered = useMemo(() => {
    let r = reservations;
    // Professors see all reservations
    if (user?.role !== 'profesor') {
      // Students see only approved reservations plus their own (including pending)
      r = r.filter(res => res.status === 'approved' || res.userId === user?.id);
    }
    if (filterRoom !== 'all') r = r.filter(res => res.roomId === filterRoom);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(res => res.title.toLowerCase().includes(q) || res.roomName.toLowerCase().includes(q) || res.userName.toLowerCase().includes(q));
    }
    return r;
  }, [reservations, filterRoom, search]);

  const getReservationsForDayHour = (day: Date, hour: number) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const hourStr = `${String(hour).padStart(2, '0')}:00`;
    return filtered.filter(r => r.date === dateStr && r.startTime <= hourStr && r.endTime > hourStr);
  };

  const getReservationsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return filtered.filter(r => r.date === dateStr);
  };

  const openNewReservation = (date?: string, time?: string) => {
    setModalDefaults({ date, time });
    setModalOpen(true);
  };

  const headerLabel = viewMode === 'month'
    ? format(currentDate, 'MMMM yyyy', { locale: es })
    : viewMode === 'week'
    ? `${format(days[0], 'd MMM', { locale: es })} - ${format(days[days.length - 1], 'd MMM yyyy', { locale: es })}`
    : format(currentDate, "EEEE d 'de' MMMM yyyy", { locale: es });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-xl"><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="rounded-xl text-sm">Hoy</Button>
          <Button variant="outline" size="icon" onClick={() => navigate(1)} className="rounded-xl"><ChevronRight className="w-4 h-4" /></Button>
          <h2 className="text-lg font-semibold capitalize ml-2 text-foreground">{headerLabel}</h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="pl-9 h-9 rounded-xl w-40" />
          </div>
          <Select value={filterRoom} onValueChange={setFilterRoom}>
            <SelectTrigger className="h-9 rounded-xl w-44">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las salas</SelectItem>
              {ROOMS.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex rounded-xl border border-border overflow-hidden">
            {(['day', 'week', 'month'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-all ${viewMode === v ? 'gradient-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-secondary'}`}>
                {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          <Button onClick={() => openNewReservation(format(currentDate, 'yyyy-MM-dd'))} className="rounded-xl gradient-primary text-primary-foreground gap-1">
            <Plus className="w-4 h-4" /> Reservar
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === 'month' ? (
        <MonthView days={days} currentDate={currentDate} getReservationsForDay={getReservationsForDay}
          onClickDay={(d) => { setCurrentDate(d); setViewMode('day'); }}
          onClickReservation={setSelectedReservation} userId={user?.id} />
      ) : (
        <TimeGridView days={days} getReservationsForDayHour={getReservationsForDayHour}
          onClickSlot={(date, hour) => openNewReservation(date, `${String(hour).padStart(2, '0')}:00`)}
          onClickReservation={setSelectedReservation} userId={user?.id} />
      )}

      <ReservationModal open={modalOpen} onClose={() => setModalOpen(false)}
        defaultDate={modalDefaults.date} defaultTime={modalDefaults.time} defaultRoomId={modalDefaults.roomId} />
      <ReservationDetail reservation={selectedReservation} onClose={() => setSelectedReservation(null)} />
    </div>
  );
}

function MonthView({ days, currentDate, getReservationsForDay, onClickDay, onClickReservation, userId }: {
  days: Date[]; currentDate: Date;
  getReservationsForDay: (d: Date) => Reservation[];
  onClickDay: (d: Date) => void;
  onClickReservation: (r: Reservation) => void;
  userId?: string;
}) {
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7">
        {dayNames.map(d => (
          <div key={d} className="px-2 py-3 text-xs font-semibold text-muted-foreground text-center border-b border-border/50">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const reservs = getReservationsForDay(day);
          return (
            <div key={i} onClick={() => onClickDay(day)}
              className={`min-h-[100px] p-1.5 border-b border-r border-border/30 cursor-pointer transition-colors hover:bg-secondary/50 ${!isSameMonth(day, currentDate) ? 'opacity-40' : ''}`}>
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${isToday(day) ? 'gradient-primary text-primary-foreground' : 'text-foreground'}`}>
                {format(day, 'd')}
              </span>
              <div className="space-y-0.5 mt-1">
                {reservs.slice(0, 3).map(r => (
                  <div key={r.id} onClick={e => { e.stopPropagation(); onClickReservation(r); }}
                    className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium cursor-pointer transition-all hover:scale-[1.02] ${
                      r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : (r.userId === userId ? 'bg-own/20 text-own' : 'bg-destructive/10 text-destructive')
                    }`}>
                    {r.title}
                  </div>
                ))}
                {reservs.length > 3 && <span className="text-[10px] text-muted-foreground pl-1">+{reservs.length - 3} más</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeGridView({ days, getReservationsForDayHour, onClickSlot, onClickReservation, userId }: {
  days: Date[];
  getReservationsForDayHour: (d: Date, h: number) => Reservation[];
  onClickSlot: (date: string, hour: number) => void;
  onClickReservation: (r: Reservation) => void;
  userId?: string;
}) {
  return (
    <div className="glass rounded-2xl overflow-auto max-h-[calc(100vh-220px)]">
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="grid sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/50" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
          <div className="p-2" />
          {days.map((d, i) => (
            <div key={i} className={`p-2 text-center border-l border-border/30 ${isToday(d) ? 'bg-primary/5' : ''}`}>
              <div className="text-xs text-muted-foreground">{format(d, 'EEE', { locale: es })}</div>
              <div className={`text-sm font-semibold mt-0.5 ${isToday(d) ? 'text-primary' : 'text-foreground'}`}>{format(d, 'd')}</div>
            </div>
          ))}
        </div>
        {/* Time slots */}
        {HOURS.map(hour => (
          <div key={hour} className="grid border-b border-border/20" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
            <div className="p-2 text-xs text-muted-foreground text-right pr-3 pt-1">{`${String(hour).padStart(2, '0')}:00`}</div>
            {days.map((day, di) => {
              const reservs = getReservationsForDayHour(day, hour);
              const dateStr = format(day, 'yyyy-MM-dd');
              const seen = new Set<string>();
              return (
                <div key={di} onClick={() => reservs.length === 0 && onClickSlot(dateStr, hour)}
                  className={`min-h-[52px] p-0.5 border-l border-border/20 cursor-pointer transition-colors ${
                    reservs.length === 0 ? 'hover:bg-success/5' : ''
                  } ${isToday(day) ? 'bg-primary/[0.02]' : ''}`}>
                  {reservs.map(r => {
                    if (seen.has(r.id)) return null;
                    seen.add(r.id);
                    return (
                      <div key={r.id} onClick={e => { e.stopPropagation(); onClickReservation(r); }}
                        className={`text-xs px-2 py-1.5 rounded-lg font-medium truncate cursor-pointer transition-all hover:scale-[1.01] shadow-sm ${
                          r.userId === userId
                                ? 'bg-own/15 text-own border-l-2 border-own'
                                : (r.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-l-2 border-yellow-300' : 'bg-destructive/10 text-destructive border-l-2 border-destructive')
                        }`}>
                        <div className="font-semibold truncate">{r.title}</div>
                        <div className="text-[10px] opacity-75 truncate">{r.roomName}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
