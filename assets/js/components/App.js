import React from 'react';
import Navbar from "./Navbar";
import { Route, Routes } from "react-router-dom";
import Home from "./Home/Home";
import Shop from "./Shop/Shop";
import UserProfile from "./UserProfile/UserProfile";
import NotFound from "./NotFound/NotFound";
import PWAInstallPrompt from "./PWAInstallPrompt";

export default function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route exact path="/shop/:id" element={<Shop />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <PWAInstallPrompt />
        </>
    );
}