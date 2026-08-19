import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import FacilityDetail from './pages/FacilityDetail';
import Favorites from './pages/Favorites';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/facility/:contentId" element={<FacilityDetail />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </BrowserRouter>
  );
}
