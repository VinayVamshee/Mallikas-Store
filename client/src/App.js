import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import Navigation from './Components/Navigation';
import './Components/style.css';
import Footer from './Components/Footer';
import Apparels from './Components/Apparels';
import Accessories from './Components/Accessories';
import Product from './Components/Product';
import User from './Components/User';
import Admin from './Components/Admin';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path='/Apparels' element={<Apparels />} />
          <Route path='/Accessories' element={<Accessories />} />
          <Route path='/Product' element={<Product />} />
          <Route path='/User' element={<User />} />
          <Route path='/Admin' element={<Admin />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
