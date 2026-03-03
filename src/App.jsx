import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import Nav from './components/Nav';
import Listing from './pages/Listing';
import Sources from './pages/Sources';
import SavedPage from './pages/Saved';
import RFPDetail from './pages/RFPDetail';
import './styles/base.css';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Nav />
        <Routes>
          <Route path="/" element={<Listing />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/rfp/:id" element={<RFPDetail />} />
          {/* Redirect old routes */}
          <Route path="/search" element={<Navigate to="/" replace />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/setup" element={<Navigate to="/sources" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
