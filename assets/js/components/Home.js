import React, { Component } from 'react';
import ShopList from "./Shop/ShopList";
import SearchInput from "./Search/SearchInput";

class Home extends Component {
    constructor (props) {
        super(props);

        this.state = {
            shops: [],
            totalShops: 0
        };

        this.fetchShops = this.fetchShops.bind(this);
        this.updateList = this.updateList.bind(this);
        this.searching = this.searching.bind(this);
    }

    async fetchShops () {
        await fetch('http://easy:8080/api/shops')
            .then(response => response.json())
            .then(data => {
                this.setState({
                    shops: data['hydra:member'],
                    totalShops: data['hydra:totalItems'],
                });
            });
    }

    async componentDidMount () {
        await this.fetchShops();
    }

    updateList (shops, text) {
        this.setState(
            {
                text: text,
                shops: shops,
            }
        );
    }

    searching () {
        this.setState({shops: [], totalShops: 0});
    }

    render () {
        return (
            <div>
                <SearchInput onTextChange={this.updateList} onEmptyInput={this.fetchShops} onSearching={this.searching}/>
                <ShopList shops={this.state.shops}/>
            </div>
        );
    }
}

export default Home;