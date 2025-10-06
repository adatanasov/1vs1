import { Component } from 'react';

class GameWeekSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {value: props.currentEvent};
  
        this.handleChange = this.handleChange.bind(this);
    }
  
    handleChange(event) {    
        this.setState({value: event.target.value});  
        
        this.props.onChange(+event.target.value);
    }
  
    render() {
        let gameweeks = Array(38);
        for (let i = 0; i < gameweeks.length; i++) {
            gameweeks[i] = {name: `GW ${i+1}${this.props.currentEvent === i+1 ? " - current" : ""}`, value: i+1};            
        }

        const options = gameweeks.map(gw => (
            <option key={gw.name} value={gw.value}>{gw.name}</option>
        ));

        return (
            <select value={this.state.value} onChange={this.handleChange} className="event-select">
                {options}       
            </select> 
        );
    }
}

export default GameWeekSelect;