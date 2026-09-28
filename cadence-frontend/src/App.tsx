import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Events from './pages/Events';
import NewEvent from './pages/NewEvent';
import EventDetail from './pages/EventDetail';
import ClientPortal from './pages/ClientPortal';
import ClientEventDetail from './pages/ClientEventDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route path="/events/new" element={<ProtectedRoute><NewEvent /></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
        <Route path="/portal" element={<ProtectedRoute><ClientPortal /></ProtectedRoute>} />
        <Route path="/portal/events/:id" element={<ProtectedRoute><ClientEventDetail /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;