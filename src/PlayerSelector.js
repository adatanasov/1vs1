import React, { Component } from 'react';

class PlayerSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {value: "Select a player"};

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({value: +event.target.value});
        this.props.onChange(+event.target.value);
    }

    render() {
        let players = this.props.rankings.map(pla => (
            <option key={pla.rank_sort} value={pla.entry}>
                {pla.points_for ? 
                    `${pla.entry_name} ${pla.total} (${pla.matches_won}-${pla.matches_drawn}-${pla.matches_lost})` :
                    `${pla.entry_name} ${pla.total} (${pla.event_total})`}
            </option>
        ));
    
        return (
            <select value={this.state.value} onChange={this.handleChange} className="player-select">
                <option value="Select a player" disabled hidden>Select a player</option>
                {players}
            </select>
        ); 
    }  
}

export default PlayerSelector;