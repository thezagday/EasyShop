import React, { Component } from 'react';
import {useParams} from "react-router-dom";
import Map from "./Map"

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
                            <Map />
                        </div>
                        <div className="col-xl-4 col-lg-5 col-md-6 col-sm-12">
                            <div className="tm-bg-gray tm-video-details">
                                <div>
                                    <h3 className="tm-text-gray-dark mb-3">К покупке:</h3>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Молоко</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Сметана</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Лук</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Хлеб</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Чай</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Сыр</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Вода</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Бокалы</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Шоколад</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Рыба</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Кальмары</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Рис</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">Несквик</a>
                                    <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">M&Ms</a>
                                </div>
                                <div className="text-center mb-5 mt-5">
                                    <a href="#" className="btn btn-primary tm-btn-big">Построить оптимальный маршрут</a>
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