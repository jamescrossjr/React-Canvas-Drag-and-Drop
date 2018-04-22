import React from 'react';
import './Drawing-Button.css';
import './util.css';

const DrawingButton = (props) => {
    return (
        <button onClick={props.onClickFn} className={"btn " + props.classes}>{props.text}</button>
    );
}

export default DrawingButton;