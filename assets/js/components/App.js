import React from 'react';
import Navbar from "./Navbar";
import {Route, Routes} from "react-router-dom";
import Home from "./Home/Home";
import Shop from "./Shop/Shop";
import Contact from "./Contact/Contact";
import NotFound from "./NotFound/NotFound";

export default function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route exact path="/shop/:id" element={<Shop />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}