import React from 'react';
import Dashboard from './Pages/Dashboard';
import UserManagement from './Pages/Usermanagement';
import LoginPage from './Pages/Login';
import Navbar from './Pages/Navbar';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import History from './Pages/History';
import Addasset from './Pages/Addasset';
import AssetInventory from './Pages/AssetInventory';
import Issue from './Pages/Issue';
import Subscription from './Pages/Subscription';
import Plan from './Pages/Plan';
import Amc from './Pages/AMC';
import Addschema from './Pages/Addschema';
import Services from './Pages/Services';
import ResetPassword from './Pages/ResetPassword';
import { useAuth } from './context/AuthContext';
import { ClassNames } from '@emotion/react';
import Profile from './Pages/Profile';
import LandingPage from './Pages/LandingPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};


function App() {
 
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  

  return (
    <>
      { !isLoginPage && <Navbar />}
      <Box pb={!isLoginPage ? { base: "80px", lg: "20px" } : 0}>
        <Routes>
          <Route path='/' element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path='/reset-password/:uid/:token' element={<PublicRoute><ResetPassword /></PublicRoute>} />
          
          <Route path='/plan' element={<ProtectedRoute><Plan /></ProtectedRoute>}/>
          <Route path='/subscription' element={<ProtectedRoute><Subscription /></ProtectedRoute>}/>
          <Route path='/issue' element={<ProtectedRoute><Issue /></ProtectedRoute>}/>
          <Route path='/assets' element={<ProtectedRoute><AssetInventory /></ProtectedRoute>}/>
          <Route path='/assets/add-asset' element={<ProtectedRoute><Addasset /></ProtectedRoute>}/>
          <Route path='/history' element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement/></ProtectedRoute>}/>
          <Route path="/amc_cmc" element={<ProtectedRoute><Amc/></ProtectedRoute>}/>
          <Route path="/assets/asset-schema" element={<ProtectedRoute><Addschema/></ProtectedRoute>}/>
          <Route path="/services" element={<ProtectedRoute><Services/></ProtectedRoute>}/>
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
        </Routes>
      </Box>
    </>
  );
}

export default App;