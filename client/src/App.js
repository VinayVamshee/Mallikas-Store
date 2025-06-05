import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';

import Home from './Components/Home';
import Navigation from './Components/Navigation';
import './Components/style.css';
import Footer from './Components/Footer';
import Apparels from './Components/Apparels';
import Accessories from './Components/Accessories';
import Product from './Components/Product';
import User from './Components/User';
import Admin from './Components/Admin';

// ✅ Initialize Google Analytics
const TRACKING_ID = 'G-ZKQXRPHC86';
ReactGA.initialize(TRACKING_ID);

// ✅ Track page views on route change
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname });
  }, [location]);

  return null;
}

function App() {
  return (
    <Router>
      <AnalyticsTracker />
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/Apparels" element={<Apparels />} />
          <Route path="/Accessories" element={<Accessories />} />
          <Route path="/Product" element={<Product />} />
          <Route path="/User" element={<User />} />
          <Route path="/Admin" element={<Admin />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
