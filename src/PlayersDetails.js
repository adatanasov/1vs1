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
            fixtures: null,
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

        fetch(`${this.props.baseUrl}/fixtures/?event=${props.currentEvent}`)
        .then(response => response.json())
        .then(data => {
            this.setState({fixtures: data});
        }); 
    }

    handleGameWeekChange(gameweek) {           
        this.setState({selectedEvent: gameweek});

        fetch(`${this.props.baseUrl}/event/${gameweek}/live/`)
        .then(response => response.json())
        .then(data => {
            this.setState({liveStats: data.elements});
        });  

        fetch(`${this.props.baseUrl}/fixtures/?event=${gameweek}`)
        .then(response => response.json())
        .then(data => {
            this.setState({fixtures: data});
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

            if (this.state.footballPlayers && this.state.liveStats && this.state.fixtures) {
                let playingTeams = this.state.fixtures.map(f => f.team_h).concat(this.state.fixtures.map(f => f.team_a));
                let transferCosts = data.entry_history.event_transfers_cost;

                let playersToRender = data.picks.map(pick => {
                    let actualPlayer = this.state.footballPlayers.find(pl => pl.id === pick.element);
                    let actualStat = this.state.liveStats.find(pl => pl.id === pick.element);

                    let decoratedPick = {
                        id: pick.element, 
                        teamId: actualPlayer.team,
                        name: actualPlayer.web_name, 
                        points: actualStat.stats.total_points,
                        minutes: actualStat.stats.minutes,
                        isPlaying: playingTeams.includes(actualPlayer.team),
                        isCaptain: pick.is_captain,
                        isViceCaptain: pick.is_vice_captain,
                        multiplier: pick.multiplier,
                        position: pick.position
                    };

                    return decoratedPick;
                });

                let captain = playersToRender.find(pl => pl.isCaptain);
                let captainHaveMatch = captain.isPlaying;
                let canCaptainPlay = captainHaveMatch;

                if (captainHaveMatch) {
                    let matches = this.state.fixtures.filter(fi => fi.team_h === captain.teamId || fi.team_a === captain.teamId);
                    let areAllFinished = !matches.some(m => m.finished === false);

                    if (areAllFinished) {
                        canCaptainPlay = captain.minutes > 0;
                    }
                }

                playersToRender.map(pl => pl.points = this.getPickPoints(pl, canCaptainPlay));

                this.setState({[`${name}playersToRender`]: playersToRender});

                let totalPoints = playersToRender.slice(0, 11).reduce((acc, curr) => acc + curr.points, 0) - transferCosts;

                this.setState({[`${name}totalPoints`]: totalPoints});
            }
        });
    }

    getPickPoints(pick, canCaptainPlay) {
        if (pick.isCaptain && canCaptainPlay) {
            return pick.points * pick.multiplier;
        } else if (pick.isViceCaptain && pick.isPlaying && !canCaptainPlay) {
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