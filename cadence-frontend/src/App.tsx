import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute, { HomeRedirect } from './components/ProtectedRoute';
import Events from './pages/Events';
import NewEvent from './pages/NewEvent';
import EventDetail from './pages/EventDetail';
import EditEvent from './pages/EditEvent';
import ClientPortal from './pages/ClientPortal';
import ClientEventDetail from './pages/ClientEventDetail';
import Signup from './pages/Signup';
import SetPassword from './pages/SetPassword';
import Vendors from './pages/Vendors';
import Staff from './pages/Staff';
import ErrorToast from './components/shared/ErrorToast';
import StaffShell from './components/layout/StaffShell';

function App() {
  return (
    <BrowserRouter>
      <ErrorToast />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute><StaffShell /></ProtectedRoute>}>
          <Route path="/dashboard" element={<ProtectedRoute permission="dashboard:view"><Dashboard /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute permission="events:view"><Events /></ProtectedRoute>} />
          <Route path="/events/new" element={<ProtectedRoute permission="events:create"><NewEvent /></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute permission="events:view"><EventDetail /></ProtectedRoute>} />
          <Route path="/events/:id/edit" element={<ProtectedRoute permission="events:edit"><EditEvent /></ProtectedRoute>} />
          <Route path="/vendors" element={<ProtectedRoute permission="vendors:view"><Vendors /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute permission="staff:view"><Staff /></ProtectedRoute>} />
        </Route>

        <Route path="/set-password" element={<ProtectedRoute audience="any"><SetPassword /></ProtectedRoute>} />

        <Route path="/portal" element={<ProtectedRoute audience="client"><ClientPortal /></ProtectedRoute>} />
        <Route path="/portal/events/:id" element={<ProtectedRoute audience="client"><ClientEventDetail /></ProtectedRoute>} />

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
