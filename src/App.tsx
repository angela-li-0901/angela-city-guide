import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/Layout/LandingPage';
import CityPage from './components/Layout/CityPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:city" element={<CityPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
