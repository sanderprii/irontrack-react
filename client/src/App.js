import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

// ✅ Impordi AppTheme
import AppTheme from './shared-theme/AppTheme';



// Impordi muud komponendid
import ResponsiveNavbar from './components/ResponsiveNavbar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TrainingsPage from './pages/TrainingsPage';
import RecordsPage from './pages/RecordsPage';
import FindUsersPage from './pages/FindUsersPage';
import RegisterTrainingPage from './pages/RegisterTrainingPage';
import MyProfile from './pages/MyProfile';
import LoginForm from "./components/LoginForm";
import JoinUsForm from "./components/JoinUsForm";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import TrainingDiaryPage from "./pages/TrainingDiaryPage";
import AffiliateOwnerPage from "./pages/AffiliateOwnerPage";
import MyAffiliate from "./pages/MyAffiliate";
import Classes from "./pages/Classes";
import Members from "./pages/Members";
import Plans from "./pages/Plans";
import Finance from "./pages/Finance";
import Checkout from "./pages/Checkout";

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    return (
        <AppTheme>  {/* ✅ Kasutame AppTheme kogu rakenduse ümber */}
            <CssBaseline />
            <ResponsiveNavbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/trainings" element={<TrainingsPage />} />
                <Route path="/records" element={<RecordsPage />} />
                <Route path="/find-users" element={<FindUsersPage />} />
                <Route path="/register-training" element={<RegisterTrainingPage />} />
                <Route path="/my-profile" element={<MyProfile token={token} />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<JoinUsForm />} />
                <Route path="/select-role" element={<RoleSelectionPage />} />
                <Route path="/training-diary" element={<TrainingDiaryPage />} />
                <Route path="/affiliate-owner" element={<AffiliateOwnerPage />} />
                <Route path="/my-affiliate" element={<MyAffiliate token={token} />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/members" element={<Members />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/checkout" element={<Checkout />} />

                {/* ✅ Lisa MarketingPage uue marsruudina */}

            </Routes>
        </AppTheme>
    );
}

export default App;
