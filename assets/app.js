/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */
const $ = require('jquery');

// any CSS you import will output into a single css file (app.css in this case)
import './css/bootstrap.min.css';
import './css/templatemo-style.css';
import './fontawesome/css/all.min.css';

import './js/plugins';

$(window).on("load", function() {
    $('body').addClass('loaded');
});

// start the Stimulus application
// import './bootstrap';

import ReactDom from "react-dom";
import React from 'react';
import HomePage from "./js/components/Page/HomePage";

ReactDom.render(<HomePage />, document.getElementById('home'));