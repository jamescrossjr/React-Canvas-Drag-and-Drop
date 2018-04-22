import React, {Component} from 'react';
import './App.css';
import './util.css';
import DrawingCanvas from './Drawing-Canvas';
import DrawingButton from "./Drawing-Button";
import PointPill from "./Point-Pill";


class App extends Component {
    state = {
        showPoints: true,
        showControls: true,
        points: []
    }

    onToggleHidePoints = (event) => {
        event.stopPropagation();
        this.setState({showPoints: !this.state.showPoints});
    }

    onToggleHideControls = (event) => {
        event.stopPropagation();
        this.setState({showControls: !this.state.showControls});
    }

    onUpdatePoints = (points) => {
        this.setState({points: [...points]});
    }

    onRemovePointByIndex = (index) => {
        this.state.points.splice(index, 1);
        this.setState({points: [...this.state.points]});
    }

    onRemoveLastPoint = () => {
        this.state.points.pop();
        this.setState({points: [...this.state.points]});
    }

    render() {
        return (
            <div className="App">
                <header className="App-header text--center">
                    <h1 className="App-title">React Canvas Drag and Drop Bezier Curve Example</h1>
                </header>
                <main className="App-main-container">
                    <div className="ui stackable grid ">
                        <div className="four wide column">
                            <div className="gutter--left">
                                <h3>Give it a try.</h3>
                                <ul>
                                    <li>Alt Click to add or remove a point.</li>
                                    <li>Ctrl Z to remove last point.</li>
                                    <li>Drag the Points & Controls to change the lines.</li>
                                </ul>
                                <h3>Actions</h3>
                                <div className="gutter--left">
                                    <DrawingButton classes="btn margin--top margin--right block" text="Undo Last Point" onClickFn={this.onRemoveLastPoint}/>
                                    <DrawingButton classes="btn margin--top margin--right block" text={this.state.showPoints ? 'Hide Points' : 'Show Points'} onClickFn={this.onToggleHidePoints}/>
                                    <DrawingButton classes="btn margin--top margin--right block" text={this.state.showControls ? 'Hide Controls' : 'Show Controls'} onClickFn={this.onToggleHideControls}/>
                                </div>
                            </div>
                        </div>
                        <div className="eight wide column text--center">
                            <DrawingCanvas
                                updatePoints={this.onUpdatePoints}
                                removePointByIndex={this.onRemovePointByIndex}
                                removeLastPoint={this.onRemoveLastPoint}
                                points={this.state.points}
                                showPoints={this.state.showPoints}
                                showControls={this.state.showControls}
                            />
                        </div>
                        <div className="four wide column">
                            <h3>Points:</h3>
                            <ul className="ul--plain margin--left--md">
                                {this.state.points.map( (item, index) => (
                                    <li key={index} className="margin--top"><PointPill index={index} point={item.point} removePoint={this.onRemovePointByIndex} /></li>
                                ) )}
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        );
    }
}

export default App;
