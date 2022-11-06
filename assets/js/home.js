import '../css/home.css';
import ReactDOM from "react-dom/client";
import React from 'react';
import HomePage from "./components/Page/HomePage";

const root = ReactDOM.createRoot(document.getElementById("home"));
root.render(
    <React.StrictMode>
        <HomePage />
    </React.StrictMode>
);