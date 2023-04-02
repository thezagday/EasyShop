import React, { Component } from 'react';
import Navbar from "./Navbar";
import {Route, Routes} from "react-router-dom";
import Home from "./Home";
import Shop from "./Shop/Shop";
import Contact from "./Contact";
import Dijkstra from "./Dijkstra";

class App extends Component {
    render () {
        return (
            <div>
                <Navbar />
                <Routes>
                    <Route exact path="/" element={<Home />} />
                    <Route exact path="/shop/:id" element={<Shop/>} />
                    <Route path="/contact" element={<Contact/>} />
                    <Route path="/dijkstra" element={<Dijkstra/>} />
                    {/*<Route path="*" element={<NotFound />} />*/}
                </Routes>
            </div>
        );
    }
}

export default App;