import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Logbook from './pages/Logbook';
import Scanner from './pages/Scanner';
import Profile from './pages/Profile';
import Education from './pages/Education';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <AuthGuard>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/logbook" element={<Logbook />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/education" element={<Education />} />
        </Routes>
      </Layout>
    </AuthGuard>
  );
}

export default App;
