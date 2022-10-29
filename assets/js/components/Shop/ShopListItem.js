import React from "react";

class ShopListItem extends React.Component {
    render () {
        return (
            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 mb-5">
                <figure className="effect-ming tm-video-item">
                    <img src="/img/img-03.jpg" alt="Image" className="img-fluid"/>
                        <figcaption className="d-flex align-items-center justify-content-center">
                            <h2>Clocks</h2>
                            <a href="photo-detail.html">View more</a>
                        </figcaption>
                </figure>
                <div className="d-flex justify-content-between tm-text-gray">
                    <span className="tm-text-gray-light">{this.props.id}</span>
                    <span>{this.props.name}</span>
                </div>
            </div>
        );
    }
}

export default ShopListItem;