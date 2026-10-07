import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DynamicScan from './pages/DynamicScan';
import StaticScan from './pages/StaticScan';
import Report from './pages/Report';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scan/dynamic" element={<DynamicScan />} />
        <Route path="/scan/static" element={<StaticScan />} />
        <Route path="/report/:id" element={<Report />} />
      </Routes>
    </Layout>
  );
}

export default App;
