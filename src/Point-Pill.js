import React from 'react';
import './Point-Pill.css';

const PointPill = props => {
    const removeProps = (event) => {
        event.stopPropagation();
        props.removePoint(props.index);
    }
    return (
        <span className="point-pill">
            <span className="point-pill-values">X: {props.point.x} Y: {props.point.y}</span>
            <i onClick={removeProps} className="trash alternate outline icon point-pill-icon"></i>
        </span>
    );
}

export default PointPill;