import React, { Component } from 'react';
import Loader from "react-loader-spinner";

import EntryForm from './EntryForm';
import PlayerName from './PlayerName';
import LeagueSelect from './LeagueSelect';
import PlayersDetails from './PlayersDetails';
import MatchesDetails from './MatchesDetails';
import GameWeekSelect from './GameWeekSelect';
import * as FantasyAPI from './FantasyAPI';
import * as PointsCalculator from './PointsCalculator';

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
            isLoading: false,
            playerId: playerId,
            playerName: null, 
            playerInfo: null, 
            currentGameweek: null,
            gameweek: null, 
            leagues: null, 
            selectedLeague: null, 
            rankings: null,
            matches: null,
            showMatches: false,
            footballPlayers: null,
            teams: null,
            player1: playerId,
            player2: null,
            inProgress: null,
            seed: 'new'
        };
    }

    async componentDidMount() {
        if (this.state.playerId) {
            this.handlePlayerId(this.state.playerId);
        }

        let data = await FantasyAPI.getPlayersAndTeams();
        this.setState(data);
    }

    async handlePlayerId(id) {
        this.showLoader();
        localStorage.setItem("PlayerId", id);

        let entryData = await FantasyAPI.getEntryById(id);
        this.handlePlayerInfo(entryData);
        
        this.hideLoader(entryData);
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
            currentGameweek: data.current_event,
            gameweek: data.current_event,
            leagues: data.leagues,
            player1: data.id
        });

        this.handleGameWeekChange(this.state.gameweek);
    }

    handlePlayerReset() {
        this.setState({playerId: null, playerName: null, playerInfo: null, leagues: null});
    }

    async handleLeagueChange(league) {
        this.showLoader();
        league.ish2h = league.scoring === 'h';
        this.setState({selectedLeague: league});

        let leagueData = await FantasyAPI.getLeagueData(league.id, league.ish2h, this.state.gameweek);

        if (league.ish2h && leagueData.matches) {
            let inProgress = leagueData.matches[0].entry_1_total === 0 && leagueData.matches[0].entry_2_total === 0;
            this.setState({inProgress: inProgress, showMatches: true});

            if (inProgress && this.state.currentGameweek === this.state.gameweek) {
                let players = leagueData.matches.map(m => {
                    return [m.entry_1_entry, m.entry_2_entry];
                }).flat().map(id => {
                    return {id: id, name: id};
                });
                let playersData = await PointsCalculator.GetMultiplePicksData(
                    players, this.state.gameweek, this.state.footballPlayers, this.state.teams);
                leagueData.matches.forEach(m => {
                    m.entry_1_points = playersData.find(r => r.id === m.entry_1_entry)[`${m.entry_1_entry}totalPoints`];
                    m.entry_2_points = playersData.find(r => r.id === m.entry_2_entry)[`${m.entry_2_entry}totalPoints`];
                });
            }
        } else {
            this.setState({showMatches: false});
        }

        this.setState(leagueData);
        this.setState({player1: this.state.playerId, player2: null});

        this.hideLoader();
    }

    async handleGameWeekChange(gameweek) {
        this.showLoader();

        this.setState({gameweek: gameweek});

        if (this.state.selectedLeague?.ish2h && this.state.showMatches) {
            this.handleLeagueChange(this.state.selectedLeague)
        }

        this.hideLoader();
    }
    
    handlePlayerChange(name, playerId) {
        this.setState({[`${name}`]: playerId});
    }

    openMatch(player1Id, player2Id) {
        this.setState({player1: player1Id, player2: player2Id, showMatches: false});
    }

    backToLeague() {
        this.setState({showMatches: true});
    }

    refresh() {
        this.setState({seed: new Date().getTime()});
    }

    refreshAll() {
        this.handleLeagueChange(this.state.selectedLeague);
    }

    showLoader() {
        this.setState({isLoading: true});
    }

    hideLoader() {
        this.setState({isLoading: false});
    }

    render() {
        return (
            <div className="app">
                <Loader
                    type="Oval"
                    color="#37003C"
                    height={80}
                    width={80}
                    visible={this.state.isLoading}
                    className="loader" />
                {!this.state.selectedLeague &&
                    <div className="version">v.1.56</div>}
                {!this.state.playerId && <EntryForm />}
                {this.state.playerId && this.state.playerName && 
                    <PlayerName 
                        value={this.state.playerName} 
                        onChange={() => this.handlePlayerReset()} />}
                {this.state.playerId && this.state.leagues && 
                    <LeagueSelect 
                        leagues={this.state.leagues} 
                        onChange={(d) => this.handleLeagueChange(d)} />}
                {this.state.gameweek && this.state.rankings &&
                    <GameWeekSelect 
                        currentEvent={this.state.currentGameweek} 
                        onChange={(d) => this.handleGameWeekChange(d)} />}
                {this.state.matches && this.state.showMatches &&
                    <MatchesDetails 
                        playerId={this.state.playerId}
                        gameweek={this.state.gameweek} 
                        matches={this.state.matches}
                        inProgress={this.state.inProgress}
                        openMatch={(p1,p2) => this.openMatch(p1,p2)}
                        refreshAll={() => this.refreshAll()} />}
                {this.state.playerId && this.state.gameweek &&
                    this.state.rankings && !this.state.showMatches &&
                    <PlayersDetails
                        player1={this.state.player1}
                        player2={this.state.player2}
                        key={`${this.state.gameweek}-${this.state.player1}-${this.state.player2}-${this.state.seed}`}
                        gameweek={this.state.gameweek}
                        currentGameweek={this.state.currentGameweek}
                        rankings={this.state.rankings}
                        footballPlayers={this.state.footballPlayers}
                        teams={this.state.teams}
                        ish2h={this.state.selectedLeague.ish2h}
                        showLoader={() => this.showLoader()}
                        hideLoader={() => this.hideLoader()}
                        backToLeague={() => this.backToLeague()}
                        refresh={() => this.refresh()}
                        handlePlayerChange={(n,id) => this.handlePlayerChange(n,id)} />} 
            </div>
        );
    }
}

export default App;