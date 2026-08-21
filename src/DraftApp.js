import { Component } from 'react';
import { Oval } from "react-loader-spinner";

import EntryForm from './components/EntryForm';
import PlayerName from './components/PlayerName';
import LeagueSelect from './components/LeagueSelect';
import PlayersDetails from './components/PlayersDetails';
import MatchesDetails from './components/MatchesDetails';
import GameWeekSelect from './components/GameWeekSelect';
import * as DraftAPI from './services/DraftAPI';
import * as PointsCalculator from './services/PointsCalculator';

class DraftApp extends Component {
    constructor(props) {
        super(props);

        const queryParams = new URLSearchParams(window.location.search);
        let playerId = parseInt(queryParams.get('id'));

        if (playerId) {
            localStorage.setItem("PlayerIdDraft", playerId);
        } else {
            playerId = localStorage.getItem("PlayerIdDraft");  
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
            this.showLoader();

            localStorage.setItem("PlayerIdDraft", this.state.playerId);

            let data = await DraftAPI.getPlayersAndTeams();
            this.setState(data);
            this.setState({gameweek: data.currentGameweek});

            let entryData = await DraftAPI.getEntryById(this.state.playerId);
            this.handlePlayerInfo(entryData);
            this.loadPlayerLeague(entryData.leagueId);

            this.hideLoader(entryData);
        }

    }

    handlePlayerReset() {
        this.setState({playerId: null, playerName: null, playerInfo: null, leagues: null});
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
            player1: data.id
        });
    }

    async loadPlayerLeague(leagueId) {
        let league = await DraftAPI.getLeagueById(leagueId);
        league.matches.forEach(m => {
            let entry1 = league.league_entries.find(e => e.id === m.league_entry_1);
            m.entry_1_name = entry1.entry_name;
            m.entry_1_player_name = `${entry1.player_first_name} ${entry1.player_last_name}`;
            m.entry_1_entry = entry1.entry_id;
            m.entry_1_points = m.league_entry_1_points;

            let entry2 = league.league_entries.find(e => e.id === m.league_entry_2);
            m.entry_2_name = entry2.entry_name;
            m.entry_2_player_name = `${entry2.player_first_name} ${entry2.player_last_name}`;
            m.entry_2_entry = entry2.entry_id;
            m.entry_2_points = m.league_entry_2_points;

            m.id = `${m.league_entry_1}-${m.league_entry_2}`;
        });

        league.standings.forEach(s => {
            let entry = league.league_entries.find(e => e.id === s.league_entry);
            s.entry = entry.entry_id;
            s.entry_name = entry.entry_name;
        });

        let currentId = league.league_entries.find(e => e.entry_id === this.state.playerId).id;
        this.setState({rankings: league.standings, entryId: currentId});

        await this.handleLeagueChange(league.league, league.matches, this.state.currentGameweek);
    }

    async handleLeagueChange(league, matches, gameweek) {
        this.showLoader();
        league.ish2h = league.scoring === 'h';
        this.setState({selectedLeague: league, leagues: [league], allMatches: matches});

        if (league.ish2h && matches) {
            let currentMatches = matches.filter(m => m.event === gameweek);
            let inProgress = currentMatches[0].started === true && currentMatches[0].finished === false;
            this.setState({inProgress: inProgress, showMatches: true});

            if (inProgress && this.state.currentGameweek === gameweek) {
                let players = currentMatches.map(m => {
                    return [m.entry_1_entry, m.entry_2_entry];
                }).flat().map(id => {
                    return {id: id, name: id};
                });
                let playersData = await PointsCalculator.GetMultiplePicksData(
                    players, gameweek, this.state.footballPlayers, this.state.teams, true, DraftAPI);
                currentMatches.forEach(m => {
                    m.entry_1_points = playersData.find(r => r.id === m.entry_1_entry)[`${m.entry_1_entry}totalPoints`];
                    m.entry_2_points = playersData.find(r => r.id === m.entry_2_entry)[`${m.entry_2_entry}totalPoints`];
                });
            }
            
            this.setState({matches: currentMatches});
        } else {
            this.setState({showMatches: false});
        }

        this.setState({player1: this.state.playerId, player2: null});

        this.hideLoader();
    }

    async handleGameWeekChange(gameweek) {
        this.showLoader();
        
        this.setState({gameweek: gameweek});

        if (this.state.selectedLeague?.ish2h && this.state.showMatches) {
            this.handleLeagueChange(this.state.selectedLeague, this.state.allMatches, gameweek);
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
        this.handleLeagueChange(this.state.selectedLeague, this.state.allMatches, this.state.gameweek);
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
                <Oval
                    visible={this.state.isLoading}
                    height="80"
                    width="80"
                    color="#37003C"
                    secondaryColor="#37003C"
                    wrapperClass="loader" />
                {!this.state.selectedLeague &&
                    <div className="version">draft v.1.1.3</div>}
                {!this.state.playerId && <EntryForm />}
                {this.state.playerId && this.state.playerName && 
                    <PlayerName 
                        value={this.state.playerName} 
                        onChange={() => this.handlePlayerReset()} />}
                {this.state.playerId && this.state.leagues && 
                    <LeagueSelect 
                        leagues={this.state.leagues} 
                        onChange={(d) => this.handleLeagueChange(d, this.state.allMatches, this.state.gameweek)} />}
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
                        handlePlayerChange={(n,id) => this.handlePlayerChange(n,id)} 
                        isDraft={true}
                        api={DraftAPI}
                        />} 
            </div>
        );
    }
}

export default DraftApp;