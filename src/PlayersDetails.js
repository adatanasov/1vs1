import React, { Component } from 'react';
import PlayerInfo from './PlayerInfo';
import * as PointsCalculator from './PointsCalculator';

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
        // console.log('details mount');
        // console.log(this.props.liveStats.filter(p => p.id === 308));
        if (this.props.currentGameweek >= this.props.gameweek) {            
            if (this.props.player1) {
                this.fillPlayerPicksForEvent('player1', this.props.player1, this.props.gameweek);
            }

            if (this.props.player2) {
                this.fillPlayerPicksForEvent('player2', this.props.player2, this.props.gameweek);
            }
        }
    }

    handlePlayerChange(name, playerId) {
        this.props.handlePlayerChange(name, playerId);
    }

    async fillPlayerPicksForEvent(name, playerId, event) {
        this.showLoader();

        if (this.props.footballPlayers && this.props.teams && this.props.liveStats && this.props.fixtures) {
            let data = await PointsCalculator.GetPicksData(
                name, playerId, event, this.props.footballPlayers, this.props.teams);
            this.setState(data);
            // console.log(data);
        }

        this.hideLoader();
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