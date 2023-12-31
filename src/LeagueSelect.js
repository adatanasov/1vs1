import React, { Component } from 'react';
import LeagueGroup from './LeagueGroup';

class LeagueSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {id: -1, value: "Select a League", leagues: props.leagues};
  
        this.handleChange = this.handleChange.bind(this);
    }
  
    handleChange(event) {    
        const index = event.target.selectedIndex;
        const optionElement = event.target[index];
        const leagueId = optionElement.getAttribute('league-id');
        this.setState({id: leagueId, value: event.target.value});  

        const allLeagues = [ ...this.state.leagues.classic, ...this.state.leagues.h2h ];
        const league = allLeagues.find(el => el.id === +leagueId);
        this.props.onChange(league, true);
    }
  
    render() {
        const classicLeagues = this.state.leagues.classic && this.state.leagues.classic.filter(le => le.league_type === 'x');
        const h2hLeagues = this.state.leagues.h2h;
        const globalLeagues = this.state.leagues.classic.filter(le => le.league_type === 's');

        return (
            <select value={this.state.value} onChange={this.handleChange} className="league-select">
                <option value="Select a League" disabled hidden>Select a League</option>
                <LeagueGroup leagues={classicLeagues} title="Classic Leagues" />       
                <LeagueGroup leagues={h2hLeagues} title="Head-to-Head Leagues" />       
                <LeagueGroup leagues={globalLeagues} title="Global Leagues" />       
            </select> 
        );
    }
}

export default LeagueSelect;