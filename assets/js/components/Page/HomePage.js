import React from "react";
import ShopList from "../Shop/ShopList";
import SearchInput from "../Search/SearchInput";

class HomePage extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            isLoading: true,
            shops: [],
            totalShops: 0
        };

        this.fetchShops = this.fetchShops.bind(this);
        this.updateList = this.updateList.bind(this);
        this.searching = this.searching.bind(this);
    }

    async fetchShops () {
        this.setState({isLoading: true});

        await fetch('http://easy:8080/api/shops')
            .then(response => response.json())
            .then(data => {
                this.setState({
                    isLoading: false,
                    shops: data['hydra:member'],
                    totalShops: data['hydra:totalItems'],
                });
            });
    }

    async componentDidMount () {
        this.fetchShops();
    }

    updateList (shops, text) {
        this.setState(
            {
                isLoading: false,
                text: text,
                shops: shops,
            }
        );
    }

    searching () {
        this.setState({isLoading: true, shops: [], totalShops: 0});
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

export default HomePage;

