import React, { Component } from 'react';

import GameWeekSelect from './GameWeekSelect';
import PlayerInfo from './PlayerInfo';

class PlayersDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentEvent: props.currentEvent,
            selectedEvent: props.currentEvent,
            rankings: props.rankings,
            footballPlayers: null,
            liveStats: null,
            player1: null,
            player2: null,
            player1picks: null, 
            player2picks: null, 
            player1totalPoints: 0,
            player2totalPoints: 0,
            player1playersToRender: null,
            player2playersToRender: null
        };

        fetch(`${props.baseUrl}/bootstrap-static/`)
        .then(response => response.json())
        .then(data => {
            this.setState({footballPlayers: data.elements});
        });        

        fetch(`${this.props.baseUrl}/event/${props.currentEvent}/live/`)
        .then(response => response.json())
        .then(data => {
            this.setState({liveStats: data.elements});
        }); 
    }

    handleGameWeekChange(gameweek) {           
        this.setState({selectedEvent: gameweek});

        fetch(`${this.props.baseUrl}/event/${gameweek}/live/`)
        .then(response => response.json())
        .then(data => {
            this.setState({liveStats: data.elements});
        });  

        if (this.state.player1) {
            this.fillPlayerPicksForEvent('player1', this.state.player1, gameweek);
        }

        if (this.state.player2) {
            this.fillPlayerPicksForEvent('player2', this.state.player2, gameweek);
        }
    }

    handlePlayerChange(name, playerId) {
        this.setState({[`${name}`]: playerId});

        this.fillPlayerPicksForEvent(name, playerId, this.state.selectedEvent);
    }

    fillPlayerPicksForEvent(name, playerId, event) {
        fetch(`${this.props.baseUrl}/entry/${playerId}/event/${event}/picks/`)
        .then(response => response.json())
        .then(data => {
            this.setState({[`${name}picks`]: data.picks});

            if (this.state.footballPlayers && this.state.liveStats) {
                let playersToRender = data.picks.map(pick => {
                    let actualPlayer = this.state.footballPlayers.find(pl => pl.id === pick.element);
                    let actualStat = this.state.liveStats.find(pl => pl.id === pick.element);

                    let decoratedPick = {
                        id: pick.element, 
                        name: actualPlayer.web_name, 
                        points: actualStat.stats.total_points,
                        isCaptain: pick.is_captain,
                        isViceCaptain: pick.is_vice_captain,
                        multiplier: pick.multiplier,
                        position: pick.position
                    };

                    decoratedPick.points = this.getPickPoints(decoratedPick);

                    return decoratedPick;
                });

                this.setState({[`${name}playersToRender`]: playersToRender});

                let totalPoints = playersToRender.slice(0, 11).reduce((acc, curr) => acc + curr.points, 0);

                this.setState({[`${name}totalPoints`]: totalPoints});
            }
        });
    }

    getPickPoints(pick) {
        if (pick.isCaptain) {
            return pick.points * pick.multiplier;
        } else {
            return pick.points;
        }
    }

    render() {
        return (
            <div>
                {this.state.currentEvent && 
                    <GameWeekSelect 
                        currentEvent={this.state.currentEvent} 
                        onChange={(d) => this.handleGameWeekChange(d)} />} 
                <div className="players-info">
                    {this.state.rankings && 
                        <PlayerInfo 
                            rankings={this.state.rankings}
                            totalPoints={this.state.player1totalPoints}
                            playersToRender={this.state.player1playersToRender}
                            handlePlayerChange={(pi) => this.handlePlayerChange('player1', pi)} />}
                    {this.state.rankings && 
                        <PlayerInfo 
                            rankings={this.state.rankings} 
                            totalPoints={this.state.player2totalPoints}
                            playersToRender={this.state.player2playersToRender}
                            handlePlayerChange={(pi) => this.handlePlayerChange('player2', pi)} />}
                </div>
            </div>
        );
    }
}

export default PlayersDetails;