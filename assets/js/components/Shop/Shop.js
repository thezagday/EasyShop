import React, { Component } from 'react';
import {useParams} from "react-router-dom";
import Map from "./Map"
import CategoryList from "./CategoryList"

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
            shopCategories: [],
            buildRouteClicked: false
        };

        this.fetchShop = this.fetchShop.bind(this);
        this.fetchCategories = this.fetchCategories.bind(this);
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

    async fetchCategories () {
        await fetch(`http://easy:8080/api/shop_categories?shop=${this.props.match.params.id}`)
            .then(response => response.json())
            .then(data => {
                this.setState({
                    shopCategories: data['hydra:member'],
                });
            });
    }

    async componentDidMount () {
        await this.fetchShop();
        await this.fetchCategories();
    }

    handleBuildRouteClick = () => {
        this.setState({ buildRouteClicked: true });
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
                            <Map buildRouteClicked={this.state.buildRouteClicked} />
                        </div>
                        <div className="col-xl-4 col-lg-5 col-md-6 col-sm-12">
                            <div className="tm-bg-gray tm-video-details">
                                <div>
                                    <CategoryList shopCategories={this.state.shopCategories} />
                                </div>
                                <div className="text-center mb-5 mt-5">
                                    <a className="btn btn-primary tm-btn-big" onClick={this.handleBuildRouteClick}>Построить маршрут</a>
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