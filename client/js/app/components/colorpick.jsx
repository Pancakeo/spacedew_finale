import React from 'react';
import ColorPicker from 'react-simple-colorpicker';

import '../../../less/colorpicker.less';

export class Wup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      color: this.props.initialColor
    }

    // this.handleChange = this.handleChange.bind(this);
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
