import { Component } from 'react';
import PlayerInfo from './PlayerInfo';
import * as PointsCalculator from '../services/PointsCalculator';

class PlayersDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            player1picks: null, 
            player2picks: null, 
            player1totalPoints: 0,
            player2totalPoints: 0,
            player1minusPoints: null,
            player2minusPoints: null,
            player1playersToRender: null,
            player2playersToRender: null,
            player1addSeparator: true,
            player2addSeparator: true
        };

        this.refresh = this.refresh.bind(this);
        this.backToLeague = this.backToLeague.bind(this);
    }

    refresh(event) {
        this.props.refresh();
    }

    backToLeague(event) {
        this.props.backToLeague();
    }

    showLoader() {
        this.setState({isLoading: true});
        this.props.showLoader();
    }

    hideLoader() {
        this.setState({isLoading: false});
        this.props.hideLoader();
    }

    componentDidMount() {
        if (this.props.gameweek <= this.props.currentGameweek) {
            this.showLoader();
            this.getPicksData(this.props.player1, this.props.player2, this.props.gameweek);
            this.hideLoader();
        }
    }

    handlePlayerChange(name, playerId) {
        this.props.handlePlayerChange(name, playerId);
    }

    async getPicksData(player1, player2, gameweek) {
        let players = [];

        if (player1) {
            players.push({id: player1, name: 'player1'});
        }

        if (player2) {
            players.push({id: player2, name: 'player2'});
        }

        if (players.some(p => p)) {
            let playersData = await PointsCalculator.GetMultiplePicksData(
                players, gameweek, this.props.footballPlayers, this.props.teams, this.props.isDraft, this.props.api);
            playersData.forEach(d => this.setState(d));
        }
    }

    render() {
        return (
            <div className="details-wrapper">                 
                <div className="players-info">
                    {this.props.rankings && 
                        <PlayerInfo 
                            key={`${this.props.player1}-${this.state.player1totalPoints}`}
                            playerId={this.props.player1}
                            rankings={this.props.rankings}
                            totalPoints={this.state.player1totalPoints}
                            minusPoints={this.state.player1minusPoints}
                            playersToRender={this.state.player1playersToRender}
                            handlePlayerChange={(pi) => this.handlePlayerChange('player1', pi)}
                            addSeparator={this.state.player1addSeparator} />}
                    {this.props.rankings && 
                        <PlayerInfo 
                            key={`${this.props.player2}-${this.state.player2totalPoints}`}
                            playerId={this.props.player2}
                            rankings={this.props.rankings} 
                            totalPoints={this.state.player2totalPoints}
                            minusPoints={this.state.player2minusPoints}
                            playersToRender={this.state.player2playersToRender}
                            handlePlayerChange={(pi) => this.handlePlayerChange('player2', pi)}
                            addSeparator={this.state.player2addSeparator} />}
                </div>
                <div className="refresh-wrapper">
                    {this.props.ish2h ?
                        <button 
                            onClick={this.backToLeague} 
                            className="refresh back">Go back</button> : null}
                    <button 
                        onClick={this.refresh} 
                        className="refresh"
                        disabled={this.state.isLoading}>Refresh</button>
                </div>
            </div>
        );
    }
}

export default PlayersDetails;