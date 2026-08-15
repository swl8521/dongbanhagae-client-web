import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import FacilityDetail from './pages/FacilityDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/facility/:contentId" element={<FacilityDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
