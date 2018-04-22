import React, {Component} from 'react';
import './Drawing-Canvas.css';

class DrawingCanvas extends Component {
    constructor() {
        super();
    }

    /**
     * The lifecycle methods
     * ======================================
     */
    componentDidMount() {
        const self = this;
        // Defaults
        self.points = [];
        self.activeDragHandle = null;
        self.defaultCanvas = {
            width: 500,
            height: 400
        }

        // Default Appearance of points and lines
        self.PI2 = Math.PI * 2;
        self.controlRadius = 4;
        self.controlColor = self.controlLineColor = 'red';
        self.pointRadius = 5;
        self.pointColor = self.lineColor = 'black';

        // Start canvas
        self.mainCanvas = document.getElementById('mainCanvas');
        self.canvasOffset = self.mainCanvas.getBoundingClientRect();
        self.ctx = self.mainCanvas.getContext("2d");
        self.ctx.scale(2,2);
        self.ctx.translate(0.5, 0.5);

        // Start main mouse and key listeners
        self.mainCanvas.addEventListener("mousedown", self.onMouseDown);
        document.body.addEventListener("keydown", self.onKeyDown);
        document.body.addEventListener("keyup", self.onKeyUp);
    }

    componentDidUpdate() {
        this.points = [...this.props.points];
        this.showPoints = this.props.showPoints;
        this.showControls = this.props.showControls;
        this.draw();
    }

    componentWillUnmount() {
        const self = this;
        // cleanup listeners
        self.mainCanvas.removeEventListener("mousedown", self.onMouseDown);
        document.body.removeEventListener("keydown", self.onKeyDown);
        document.body.removeEventListener("keyup", self.onKeyUp);
    }


    /**
     * The custom class methods
     * ======================================
     */

    onMouseDown = event => {
        const self = this;
        event.stopPropagation();
        let clickedDraggableItem = false;
        self.points.forEach((item, index, list) => {
            if (self.hasClickedDraggableItem(event.clientX, event.clientY, item.point)) {
                clickedDraggableItem = true;
                if (self.isPressedAltKey) {
                    self.removePointByIndex(index);
                } else {
                    self.activateDraggableItem(item.point);
                }
            } else if (item.controlA && self.hasClickedDraggableItem(event.clientX, event.clientY, item.controlA)) {
                clickedDraggableItem = true;
                self.activateDraggableItem(item.controlA);
            } else if (item.controlB && self.hasClickedDraggableItem(event.clientX, event.clientY, item.controlB)) {
                clickedDraggableItem = true;
                self.activateDraggableItem(item.controlB);
            }
        });

        if (!clickedDraggableItem && self.isPressedAltKey) {
            let x = event.clientX - self.canvasOffset.x;
            let y = event.clientY - self.canvasOffset.y;
            self.createNewPoint(x, y);
        }
    }

    onKeyDown = event => {
        const self = this;
        if (event.altKey) {
            self.isPressedAltKey = true;
        }
        if (event.ctrlKey) {
            self.isPressedCtrlKey = true;
        }
        if (event.code === 'KeyZ') {
            self.isPressedZKey = true;
        }

        self.shouldUndoLastPoint();
    }

    onKeyUp = event => {
        const self = this;
        if (!event.altKey) {
            self.isPressedAltKey = false;
        }
        if (!event.ctrlKey) {
            self.isPressedCtrlKey = false;
        }
        if (event.code === 'KeyZ') {
            self.isPressedZKey = false;
        }
    }

    onMouseMove = event => {
        const self = this;
        self.activeDragHandle.x = event.clientX - self.canvasOffset.x;
        self.activeDragHandle.y = event.clientY - self.canvasOffset.y;
        // self.draw();
        self.props.updatePoints(self.points);
    }

    onMouseUp = event => {
        const self = this;
        self.mainCanvas.removeEventListener("mousemove", self.onMouseMove);
        document.body.removeEventListener("mouseup", self.onMouseUp);
        self.props.updatePoints(self.points);
    }

    activateDraggableItem = item => {
        const self = this;
        self.mainCanvas.addEventListener("mousemove", self.onMouseMove);
        document.body.addEventListener("mouseup", self.onMouseUp);
        self.activeDragHandle = item;
    }

    draw = () => {
        const self = this;
        self.ctx.clearRect(0, -0.5, self.mainCanvas.width, self.mainCanvas.height);
        self.points.forEach((point, index, list) => {
            let previousIndex = index - 1, nextIndex = index + 1;
            let previous = index > -1 ? list[previousIndex] : null;
            self.drawPoints(point, previous, list[nextIndex]);
        });
    }

    drawPoints = (current, previous, next) => {
        const self = this,
            ctx = self.ctx;

        if (self.showControls) {
            self.drawControls(current, previous, next);
        }

        if (previous) {
            ctx.beginPath();
            ctx.moveTo(previous.point.x, previous.point.y);
            ctx.bezierCurveTo(
                current.controlA.x, current.controlA.y,
                current.controlB.x, current.controlB.y,
                current.point.x, current.point.y,
            );
            ctx.strokeStyle = self.lineColor;
            ctx.stroke();
        }

        // draw points
        if (self.showPoints) {
            ctx.beginPath();
            ctx.fillStyle = self.pointColor;
            ctx.arc(current.point.x, current.point.y, self.pointRadius, self.PI2, false);
            ctx.fill();
        }
    }

    drawControls = (current, previous, next) => {
        if (!previous) {
            return;
        }
        const self = this;
        const ctx = self.ctx;

        if (previous) {
            // draw control handles
            ctx.beginPath();
            ctx.fillStyle = self.controlColor;
            ctx.arc(current.controlA.x, current.controlA.y, self.controlRadius, self.PI2, false);
            ctx.arc(current.controlB.x, current.controlB.y, self.controlRadius, self.PI2, false);
            ctx.fill();

            // draw control lines
            ctx.beginPath();
            ctx.strokeStyle = self.controlLineColor;
            // draw control line for Control A
            ctx.moveTo(previous.point.x, previous.point.y);
            ctx.lineTo(current.controlA.x, current.controlA.y);
            // draw control line for Control A
            ctx.moveTo(current.point.x, current.point.y);
            ctx.lineTo(current.controlB.x, current.controlB.y);
            ctx.stroke();
        }
    }

    hasClickedDraggableItem = (x, y, circle) => {
        const self = this;
        return self.distanceBetweenXY(x, y, circle.x + self.canvasOffset.x, circle.y + +self.canvasOffset.y) < self.pointRadius;
    }

    distanceBetweenXY = (x0, y0, x1, y1) => {
        let distanceX = x1 - x0;
        let distanceY = y1 - y0;
        return Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    }

    createNewPoint = (x, y) => {
        const self = this;
        let newPoint = {
            point: {x, y}
        };
        if (self.points[0]) {
            let lastPoint = self.points[self.points.length - 1];
            newPoint.controlA = {x: lastPoint.point.x - 10, y: lastPoint.point.y + 30};
            newPoint.controlB = {x: x + 10, y: y - 30};
        }
        self.props.updatePoints([...self.points, newPoint]);
    }
    
    shouldUndoLastPoint = () => {
        const self = this;
        if (self.isPressedZKey && self.isPressedCtrlKey) {
            self.removeLastPoint();
        }
    }

    removePointByIndex = (index) => {
        const self = this;
        self.props.removePointByIndex(index);
    }

    removeLastPoint = () => {
        const self = this;
        self.props.removeLastPoint();
    }

    render() {
        return (
            <canvas id='mainCanvas' width="1000" height="800" className="main-canvas-container"></canvas>
        );
    };
}

export default DrawingCanvas;