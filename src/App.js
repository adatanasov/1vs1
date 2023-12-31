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
            footballPlayers: null,
            teams: null,
            liveStats: null,
            fixtures: null,
            player1: playerId,
            player2: null,
            inProgress: null
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

    async handleLeagueChange(league, shouldRefresh) {
        this.showLoader();
        league.ish2h = league.scoring === 'h';
        this.setState({selectedLeague: league});

        let leagueData = await FantasyAPI.getLeagueData(league.id, league.ish2h, this.state.gameweek);

        if (league.ish2h && leagueData.matches) {
            let inProgress = leagueData.matches[0].entry_1_total === 0 && leagueData.matches[0].entry_2_total === 0;
            this.setState({inProgress: inProgress});

            if (inProgress && shouldRefresh && this.state.currentGameweek >= this.state.gameweek) {
                for (let i = 0; i < leagueData.matches.length; i++) {
                    let m = leagueData.matches[i];
                    
                    let player1Data = await PointsCalculator.GetPicksData(
                        m.entry_1_entry, m.entry_1_entry, this.state.gameweek, this.state.footballPlayers, this.state.teams, this.state.liveStats, this.state.fixtures);
                    let player1TotalPoints = player1Data[`${m.entry_1_entry}totalPoints`];
                    m.entry_1_points = player1TotalPoints;

                    let player2Data = await PointsCalculator.GetPicksData(
                        m.entry_2_entry, m.entry_2_entry, this.state.gameweek, this.state.footballPlayers, this.state.teams, this.state.liveStats, this.state.fixtures);
                    let player2TotalPoints = player2Data[`${m.entry_2_entry}totalPoints`];
                    m.entry_2_points = player2TotalPoints;
                }
            }
        }

        this.setState(leagueData);
        this.setState({player1: this.state.playerId, player2: null});

        this.hideLoader();
    }

    async handleGameWeekChange(gameweek) {
        this.showLoader();

        let footballersData = await FantasyAPI.getGameweekFootballersData(gameweek);
        let fixturesData = await FantasyAPI.getGameweekFixturesData(gameweek);
        this.setState(footballersData);
        this.setState(fixturesData);
        this.setState({gameweek: gameweek});

        if (this.state.selectedLeague?.ish2h) {
            let shouldRefresh = gameweek === this.state.currentGameweek;
            this.handleLeagueChange(this.state.selectedLeague, shouldRefresh)
        }

        this.hideLoader();
    }
    
    handlePlayerChange(name, playerId) {
        this.setState({[`${name}`]: playerId});
    }

    openMatch(player1Id, player2Id) {
        this.setState({player1: player1Id, player2: player2Id, matches: null});
    }

    backToLeague() {
        this.handleLeagueChange(this.state.selectedLeague, false);
    }

    refresh() {
        this.handleGameWeekChange(this.state.gameweek);
    }

    refreshAll() {
        this.handleLeagueChange(this.state.selectedLeague, true);
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
                    <div className="version">v.1.20</div>}
                {!this.state.playerId && <EntryForm />}
                {this.state.playerId && this.state.playerName && 
                    <PlayerName 
                        value={this.state.playerName} 
                        onChange={() => this.handlePlayerReset()} />}
                {this.state.playerId && this.state.leagues && 
                    <LeagueSelect 
                        leagues={this.state.leagues} 
                        onChange={(d,r) => this.handleLeagueChange(d,r)} />}
                {this.state.gameweek && this.state.rankings &&
                    <GameWeekSelect 
                        currentEvent={this.state.currentGameweek} 
                        onChange={(d) => this.handleGameWeekChange(d)} />}
                {this.state.matches && 
                    <MatchesDetails 
                        playerId={this.state.playerId}
                        gameweek={this.state.gameweek} 
                        matches={this.state.matches}
                        inProgress={this.state.inProgress}
                        showLoader={() => this.showLoader()}
                        hideLoader={() => this.hideLoader()} 
                        openMatch={(p1,p2) => this.openMatch(p1,p2)}
                        refreshAll={() => this.refreshAll()} />}
                {this.state.playerId && this.state.gameweek && 
                    this.state.liveStats && this.state.fixtures &&
                    this.state.rankings && !this.state.matches &&
                    <PlayersDetails
                        player1={this.state.player1}
                        player2={this.state.player2}
                        key={`${this.state.gameweek}-${this.state.player1}-${this.state.player2}`}
                        gameweek={this.state.gameweek}
                        currentGameweek={this.state.currentGameweek}
                        rankings={this.state.rankings}
                        liveStats={this.state.liveStats}
                        fixtures={this.state.fixtures}
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
