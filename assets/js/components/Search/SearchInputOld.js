import React from "react";
import axios from "axios";

class SearchInputOld extends React.Component {
    state = {
        shops: null,
        loading: false,
        value: ''
    };

    search = async val => {
        this.setState({ loading: true });
        const res = await axios(
            `http://easy:8080/api/shops/${val}`
        );

        const shops = await res.data.name;

        this.setState({ shops, loading: false });
    };

    onChangeHandler = async e => {
        this.search(e.target.value);
        this.setState({ value: e.target.value });
    };

    get renderShops() {
        let shops = '';
        if (this.state.shops) {
            shops = <ShopList shops={this.state.shops} />;
        }

        return shops;
    }

    render() {
        return (
            <div>
                <div className="tm-hero d-flex justify-content-center align-items-center" data-parallax="scroll" data-image-src="img/hero.jpg">
                    <form className="d-flex tm-search-form">
                        <input
                            className="form-control tm-search-input"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                            value={this.state.value}
                            onChange={e => this.onChangeHandler(e)}
                        />
                        <button className="btn btn-outline-success tm-search-btn" type="submit">
                            <i className="fas fa-search"></i>
                        </button>
                    </form>
                </div>
                <div className="container-fluid tm-container-content tm-mt-60">
                    {this.renderShops}
                </div>
            </div>
        )
    }
}

export default SearchInputOld;

