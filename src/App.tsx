import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';
import { DailyPage } from './pages/DailyPage';
import { CalendarPage } from './pages/CalendarPage';
import { SettingsPage } from './pages/SettingsPage';
import { MealDetailPage } from './pages/MealDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-lg mx-auto min-h-svh flex flex-col bg-slate-50">
        <Routes>
          <Route path="/" element={<DailyPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/meal/:id" element={<MealDetailPage />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
