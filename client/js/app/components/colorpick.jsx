import React from 'react';
import ColorPicker from 'react-simple-colorpicker';

import '../../../less/colorpicker.less';

export class Wup extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			color: this.props.initialColor
		}
	}

	componentDidMount() {
		clearInterval(this.hacko);

		this.hacko = setInterval(function () {

			if (this.props.woboy.color != this.state.color) {
				this.setState({ color: this.props.woboy.color });
			}
		}.bind(this), 100);
	}

	componentWillUnmount() {
		clearInterval(this.hacko);
	}

	render() {
		return (
			<ColorPicker color={this.state.color} onChange={(e) => this.handleChange(e)} opacitySlider />
		);
	}

	handleChange(color) {
		//console.log(color); // color is rgb(a) string
		this.setState({ color: color });
		this.props.onChange(color);
	}
}
