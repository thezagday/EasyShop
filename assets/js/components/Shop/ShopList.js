import React from "react";
import ShopListItem from "./ShopListItem";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";

class ShopList extends React.Component {
    constructor (props) {
        super(props);
    }

    render () {
        const shopItems = this.props.shops.map((shop) =>
            <ShopListItem key={shop.id} id={shop.id} name={shop.name}/>
        );
        return (
            <div className="container-fluid tm-container-content tm-mt-60">
                <div className="row mb-4">
                    <h2 className="col-6 tm-text-primary">
                        Latest Photos
                    </h2>
                    <div className="col-6 d-flex justify-content-end align-items-center">
                        <form action="" className="tm-text-primary">
                            Page <input type="text" defaultValue="1" size="1" className="tm-input-paging tm-text-primary"/> of 200
                        </form>
                    </div>
                </div>
                <div className="row tm-mb-90 tm-gallery">
                    {shopItems}
                </div>
                <Breadcrumbs/>
            </div>
        );
    }
}

export default ShopList;