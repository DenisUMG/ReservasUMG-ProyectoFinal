import { useAuth } from '@/context/AuthContext';
import Login from './Login';
import AppHeader from '@/components/AppHeader';
import CalendarView from '@/components/CalendarView';

const Index = () => {
  const { user } = useAuth();

  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <CalendarView />
    </div>
  );
};

export default Index;
