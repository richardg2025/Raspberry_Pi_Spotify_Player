// Client/src/PageRoutes.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MainPage from './pages/MainPage';

const PageRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/landingpage" element={<LandingPage />} />
            </Routes>
        </Router>
    );
};

export default PageRoutes;