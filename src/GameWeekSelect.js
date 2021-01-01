import React, { Component } from 'react';

class GameWeekSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {currentEvent: props.currentEvent, value: 'GW' + props.currentEvent};
  
        this.handleChange = this.handleChange.bind(this);
    }
  
    handleChange(event) {    
        this.setState({value: event.target.value});  
        
        this.props.onChange(+event.target.value);
    }
  
    render() {
        let gameweeks = Array(this.props.currentEvent);
        let start = this.props.currentEvent;
        for (let i = 0; i < gameweeks.length; i++) {
            gameweeks[i] = 'GW' + start--;            
        }

        const options = gameweeks.map(gw => (
            <option key={gw} value={gw.slice(2)}>{gw}</option>
        ));

        return (
            <select value={this.state.value} onChange={this.handleChange} className="event-select">
                {options}       
            </select> 
        );
    }
}

export default GameWeekSelect;