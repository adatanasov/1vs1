import React, { Component } from 'react';

import EntryForm from './EntryForm';
import PlayerName from './PlayerName';
import LeagueSelect from './LeagueSelect';
import PlayersDetails from './PlayersDetails';

var ProxyUrl = 'https://ancient-depths-46233.herokuapp.com/';
var ApiBaseUrl = 'https://fantasy.premierleague.com/api';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playerName: null, 
            playerInfo: null, 
            currentEvent: null, 
            leagues: null, 
            selectedLeague: null, 
            rankings: null
        };
    }

    handlePlayerInfo(data) {      
        let playerName = `${data.name}, ${data.player_first_name} ${data.player_last_name}`;
        this.setState({
            playerName: playerName, 
            playerInfo: data, 
            currentEvent: data.current_event,
            leagues: data.leagues});        
    }

    handlePlayerChange() {
        this.setState({playerName: null, playerInfo: null, leagues: null});
    }

    handleLeagueChange(league) {
        this.setState({selectedLeague: league});

        const urlLeague = league.scoring === 'c' ? '/leagues-classic/' : '/leagues-h2h/';
        const url = `${ProxyUrl}${ApiBaseUrl}${urlLeague}${league.id}/standings/`;

        this.setState({rankings: null});

        fetch(url)
        .then(response => response.json())
        .then(data => {
            this.setState({rankings: data.standings.results});
        });
    }

    render() {
        return (
            <div className="app">
                {!this.state.playerName && 
                    <EntryForm 
                        baseUrl={`${ProxyUrl}${ApiBaseUrl}`} 
                        afterSubmit={(pi) => this.handlePlayerInfo(pi)} />}
                {this.state.playerName && 
                    <PlayerName 
                        value={this.state.playerName} 
                        onChange={() => this.handlePlayerChange()} />}
                {this.state.leagues && 
                    <LeagueSelect 
                        leagues={this.state.leagues} 
                        onChange={(d) => this.handleLeagueChange(d)} />}
                {this.state.currentEvent && 
                    this.state.rankings && 
                    <PlayersDetails 
                        baseUrl={`${ProxyUrl}${ApiBaseUrl}`} 
                        currentEvent={this.state.currentEvent} 
                        rankings={this.state.rankings} />} 
            </div>
        );
    }
}

export default App;