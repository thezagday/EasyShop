import './css/bootstrap.min.css';
import './css/templatemo-style.css';
import './fontawesome/css/all.min.css';
import './styles/map.css';

const $ = require('jquery');

import './js/plugins';

$(window).on("load", function () {
    $('body').addClass('loaded');
});

import ReactDOM from "react-dom/client";
import React from 'react';
import App from "./js/components/App";
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById("root"));
const content = (
    <BrowserRouter>
        <App />
    </BrowserRouter>
);

root.render(
    process.env.NODE_ENV === 'prod' ? content : (
        <React.StrictMode>
            {content}
        </React.StrictMode>
    )
);