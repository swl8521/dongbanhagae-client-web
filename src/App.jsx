import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import FacilityDetail from './pages/FacilityDetail';
import Favorites from './pages/Favorites';
import DogProfile from './pages/DogProfile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/facility/:contentId" element={<FacilityDetail />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/dog-profile" element={<DogProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
