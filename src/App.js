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

        const queryParams = new URLSearchParams(window.location.search);
        let playerId = parseInt(queryParams.get('id'));

        if (playerId) {
            localStorage.setItem("PlayerId", playerId);
        } else {
            playerId = localStorage.getItem("PlayerId");  
            if (playerId) {
                queryParams.set('id', playerId); 
                window.location.search = queryParams.toString();
            }     
        }

        this.state = {
            playerId: playerId,
            playerName: null, 
            playerInfo: null, 
            currentEvent: null, 
            leagues: null, 
            selectedLeague: null, 
            rankings: null
        };
    }

    componentDidMount() {
        if (this.state.playerId) {
            this.handlePlayerId(this.state.playerId);
        }
        
    }

    handlePlayerId(id) {
        localStorage.setItem("PlayerId", id);

        fetch(`${ProxyUrl}${ApiBaseUrl}/entry/${id}/`)
        .then(response => {
            if (!response.ok) {
                return Promise.reject(response);
            }
            return response.json();
        })
        .then(data => {
            data.isSuccess = true;
            this.handlePlayerInfo(data);
        })
        .catch(error => {
            error.json().then((body) => {
                this.handlePlayerInfo({
                    isSuccess: false,
                    error: body
                });
            });          
        });
    }

    handlePlayerInfo(data) {      
        let playerName;

        if (data.isSuccess) {
            playerName = `${data.name}, ${data.player_first_name} ${data.player_last_name}`
        } else {
            playerName = data.error;
        }

        this.setState({
            playerId: data.id,
            playerName: playerName, 
            playerInfo: data, 
            currentEvent: data.current_event,
            leagues: data.leagues
        });        
    }

    handlePlayerReset() {
        this.setState({playerId: null, playerName: null, playerInfo: null, leagues: null});
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
                {!this.state.playerId && <EntryForm />}
                {this.state.playerId && this.state.playerName && 
                    <PlayerName 
                        value={this.state.playerName} 
                        onChange={() => this.handlePlayerReset()} />}
                {this.state.playerId && this.state.leagues && 
                    <LeagueSelect 
                        leagues={this.state.leagues} 
                        onChange={(d) => this.handleLeagueChange(d)} />}
                {this.state.playerId && this.state.currentEvent && 
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