import React, { Component } from 'react';

class Breadcrumbs extends Component {
    render () {
        return (
            <div className="row tm-mb-90">
                <div className="col-12 d-flex justify-content-between align-items-center tm-paging-col">
                    <a href="#" onClick={e => e.preventDefault()} className="btn btn-primary tm-btn-prev mb-2 disabled">Previous</a>
                    <div className="tm-paging d-flex">
                        <a href="#" onClick={e => e.preventDefault()} className="active tm-paging-link">1</a>
                        <a href="#" onClick={e => e.preventDefault()} className="tm-paging-link">2</a>
                        <a href="#" onClick={e => e.preventDefault()} className="tm-paging-link">3</a>
                        <a href="#" onClick={e => e.preventDefault()} className="tm-paging-link">4</a>
                    </div>
                    <a href="#" onClick={e => e.preventDefault()} className="btn btn-primary tm-btn-next">Next Page</a>
                </div>
            </div>
        );
    }
}

export default Breadcrumbs;