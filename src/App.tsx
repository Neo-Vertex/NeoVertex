import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AssociateDashboard from './pages/AssociateDashboard';
import Consulting from './pages/services/Consulting';
import Websites from './pages/services/Websites';
import Systems from './pages/services/Systems';
import AI from './pages/services/AI';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/associate" element={<AssociateDashboard />} />
        <Route path="/services/consultoria" element={<Layout><Consulting /></Layout>} />
        <Route path="/services/websites" element={<Layout><Websites /></Layout>} />
        <Route path="/services/sistemas" element={<Layout><Systems /></Layout>} />
        <Route path="/services/ia" element={<Layout><AI /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
