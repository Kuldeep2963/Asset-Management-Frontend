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
import Settings from './Pages/Settings';
import Services from './Pages/Services';
import ResetPassword from './Pages/ResetPassword';
import { useAuth } from './context/AuthContext';
import { ClassNames } from '@emotion/react';

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
      <Box>
        <Routes>
          <Route path='/' element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path='/reset-password/:uid/:token' element={<PublicRoute><ResetPassword /></PublicRoute>} />
          
          <Route path='/plan' element={<ProtectedRoute><Plan /></ProtectedRoute>}/>
          <Route path='/subscription' element={<ProtectedRoute><Subscription /></ProtectedRoute>}/>
          <Route path='/issue' element={<ProtectedRoute><Issue /></ProtectedRoute>}/>
          <Route path='/asset-inventory' element={<ProtectedRoute><AssetInventory /></ProtectedRoute>}/>
          <Route path='/add-asset' element={<ProtectedRoute><Addasset /></ProtectedRoute>}/>
          <Route path='/history' element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/user-management" element={<ProtectedRoute><UserManagement/></ProtectedRoute>}/>
          <Route path="/viewer" element={<ProtectedRoute><Amc/></ProtectedRoute>}/>
          <Route path="/settings" element={<ProtectedRoute><Settings/></ProtectedRoute>}/>
          <Route path="/services" element={<ProtectedRoute><Services/></ProtectedRoute>}/>
        </Routes>
      </Box>
    </>
  );
}

export default App;