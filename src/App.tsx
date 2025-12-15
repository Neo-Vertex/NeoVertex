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

import ScrollToTop from './components/ScrollToTop';

import DemoLogin from './pages/demo/DemoLogin';
import DemoDashboard from './pages/demo/DemoDashboard';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/associate" element={<AssociateDashboard />} />

        {/* Demo System Routes */}
        <Route path="/demo/login" element={<DemoLogin />} />
        <Route path="/demo/dashboard" element={<DemoDashboard />} />

        <Route path="/services/consultoria" element={<Layout><Consulting /></Layout>} />
        <Route path="/services/websites" element={<Layout><Websites /></Layout>} />
        <Route path="/services/sistemas" element={<Layout><Systems /></Layout>} />
        <Route path="/services/ia" element={<Layout><AI /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
