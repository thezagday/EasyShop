import React, { Component } from 'react';
import {useParams} from "react-router-dom";

export function withRouter(Children) {
    return (props) => {

        const match = {params: useParams()};
        return <Children {...props} match={match}/>
    }
}

class Shop extends Component {
    constructor (props) {
        super(props);

        this.state = {
            shop: '',
        };

        this.fetchShop = this.fetchShop.bind(this);
    }

    async fetchShop () {
        await fetch(`http://easy:8080/api/shops/${this.props.match.params.id}`)
            .then(response => response.json())
            .then(data => {
                this.setState({
                    shop: data,
                });
            });
    }

    async componentDidMount () {
        this.fetchShop();
    }

    render () {
        return (
            <div>
                <div className="tm-hero d-flex justify-content-center align-items-center" data-parallax="scroll" data-image-src="img/hero.jpg"></div>
                <div className="container-fluid tm-container-content tm-mt-60">
                    <div className="row mb-4">
                        <h2 className="col-12 tm-text-primary">{this.state.shop.title}</h2>
                    </div>
                    <div className="row tm-mb-90">
                        <div className="col-xl-8 col-lg-7 col-md-6 col-sm-12">
                            <img src="/img/img-01-big.jpg" alt="Image" className="img-fluid" />
                        </div>
                        <div className="col-xl-4 col-lg-5 col-md-6 col-sm-12">
                            <div className="tm-bg-gray tm-video-details">
                                <p className="mb-4">
                                    Please support us by making <a href="https://paypal.me/templatemo" target="_parent"
                                                                   rel="sponsored">a PayPal donation</a>. Nam ex nibh,
                                    efficitur eget libero ut, placerat aliquet justo. Cras nec varius leo.
                                </p>
                                <div className="text-center mb-5">
                                    <a href="#" className="btn btn-primary tm-btn-big">Download</a>
                                </div>
                                <div className="mb-4 d-flex flex-wrap">
                                    <div className="mr-4 mb-2">
                                        <span className="tm-text-gray-dark">Dimension: </span><span
                                        className="tm-text-primary">1920x1080</span>
                                    </div>
                                    <div className="mr-4 mb-2">
                                        <span className="tm-text-gray-dark">Format: </span><span
                                        className="tm-text-primary">JPG</span>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <h3 className="tm-text-gray-dark mb-3">License</h3>
                                    <p>Free for both personal and commercial use. No need to pay anything. No need to
                                        make any attribution.</p>
                                </div>
                                <div>
                                    <h3 className="tm-text-gray-dark mb-3">Tags</h3>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Cloud</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Bluesky</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Nature</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Background</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Timelapse</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Night</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Real Estate</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Shop);