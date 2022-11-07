import React from "react";

class SearchInput extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            text: '',
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange (event) {
        if (event.target.value.length === 0) {
            this.props.onEmptyInput();
        }

        this.setState({text: event.target.value});

        fetch(`http://easy:8080/api/shops?title=${event.target.value}`)
            .then(response => response.json())
            .then(data => {
                this.props.onTextChange(data['hydra:member'],  this.state.text);
            });
    }

    render () {
        const text = this.props.text;
        return (
            <div className="tm-hero d-flex justify-content-center align-items-center" data-parallax="scroll" data-image-src="img/hero.jpg">
                <form className="d-flex tm-search-form">
                    <input className="form-control tm-search-input"
                           type="text"
                           value={text}
                           onChange={this.handleChange}
                           placeholder="Поиск"
                           aria-label="Search"
                    />
                    <button className="btn btn-outline-success tm-search-btn" type="submit">
                        <i className="fas fa-search"/>
                    </button>
                </form>
            </div>
        );
    }
}

export default SearchInput;