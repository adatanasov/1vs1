import React, { Component } from 'react';

import GameWeekSelect from './GameWeekSelect';
import PlayerInfo from './PlayerInfo';

class PlayersDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
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

        this.refresh = this.refresh.bind(this);
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
        fetch(`${this.props.baseUrl}/bootstrap-static/`)
        .then(response => response.json())
        .then(data => {
            this.setState({footballPlayers: data.elements});
            
            this.handleGameWeekChange(this.state.currentEvent);
        });
    }

    refresh(event) {
        this.handleGameWeekChange(this.state.selectedEvent);
    }

    handleGameWeekChange(gameweek) {
        this.showLoader();
        this.setState({selectedEvent: gameweek});

        fetch(`${this.props.baseUrl}/event/${gameweek}/live/`)
        .then(response => response.json())
        .then(data => {
            this.setState({liveStats: data.elements});

            fetch(`${this.props.baseUrl}/fixtures/?event=${gameweek}`)
            .then(response => response.json())
            .then(data => {
                this.setState({fixtures: data});

                if (this.state.player1) {
                    this.fillPlayerPicksForEvent('player1', this.state.player1, gameweek);
                }
        
                if (this.state.player2) {
                    this.fillPlayerPicksForEvent('player2', this.state.player2, gameweek);
                }
            }); 
        }); 

        this.hideLoader();
    }

    handlePlayerChange(name, playerId) {
        this.setState({[`${name}`]: playerId});

        this.fillPlayerPicksForEvent(name, playerId, this.state.selectedEvent);
    }

    fillPlayerPicksForEvent(name, playerId, event) {
        this.showLoader();

        fetch(`${this.props.baseUrl}/entry/${playerId}/event/${event}/picks/`)
        .then(response => response.json())
        .then(data => {
            this.setState({[`${name}picks`]: data.picks});

            if (this.state.footballPlayers && this.state.liveStats && this.state.fixtures) {
                let playingTeams = this.state.fixtures.map(f => f.team_h).concat(this.state.fixtures.map(f => f.team_a));
                let transferCosts = data.entry_history.event_transfers_cost;
                let isBenchBoostActive = data.active_chip && data.active_chip === 'bboost';
                let isThereAutomaticSubs = data.automatic_subs && data.automatic_subs.length > 0;
                let currentMatchesBonus = this.getCurrentMatchesBonus(this.state.fixtures);

                let playersToRender = data.picks.map(pick => {
                    let actualPlayer = this.state.footballPlayers.find(pl => pl.id === pick.element);
                    let actualStat = this.state.liveStats.find(pl => pl.id === pick.element);
                    
                    let decoratedPick = {
                        id: pick.element, 
                        teamId: actualPlayer.team,
                        name: actualPlayer.web_name, 
                        points: actualStat.stats.total_points,
                        minutes: actualStat.stats.minutes,
                        bonus: actualStat.stats.bonus,
                        hasMatch: playingTeams.includes(actualPlayer.team),
                        canPlay: null,
                        hasPlayed: actualStat.stats.minutes > 0 || actualStat.stats.yellow_cards > 0 || actualStat.stats.red_cards > 0,
                        goesIn: null,
                        goesOut: null,
                        isReserve: null,
                        isCaptain: pick.is_captain,
                        isViceCaptain: pick.is_vice_captain,
                        multiplier: pick.multiplier,
                        position: pick.position,
                        type: actualPlayer.element_type // 1- G, 2 - D, 3 - M, 4 - F
                    };

                    decoratedPick.canPlay = this.canPickPlay(decoratedPick, this.state.fixtures);

                    let bonus = currentMatchesBonus.find(el => el.element === decoratedPick.id);
                    if (decoratedPick.bonus === 0 && bonus) {
                        decoratedPick.bonus = bonus.points;
                        decoratedPick.points += bonus.points;
                    }

                    return decoratedPick;
                });

                if (!isBenchBoostActive) {
                    this.setReserves(playersToRender, 11);

                    if (isThereAutomaticSubs) {
                        this.showAutomaticSubstitudes(playersToRender, data.automatic_subs);
                    } else {
                        this.makeSubstitudes(playersToRender);
                    }
                }

                const captain = playersToRender.find(pl => pl.isCaptain);
                playersToRender.map(pl => pl.points = this.getPickPoints(pl, captain.canPlay));

                const totalPoints = this.getTotalPoints(playersToRender) - transferCosts;

                this.setState({
                    [`${name}totalPoints`]: totalPoints, 
                    [`${name}playersToRender`]: playersToRender
                });
            }

            this.hideLoader();
        });
    }

    getCurrentMatchesBonus(fixtures) {
        let matchesWithoutBonus = fixtures.filter(fi => fi.started && 
            fi.stats.find(st => st.identifier === 'bonus').h.length === 0 && 
            fi.stats.find(st => st.identifier === 'bonus').a.length === 0);
        let bonuses = matchesWithoutBonus.map(fi => {
            let allBonuses = [...fi.stats.find(st => st.identifier === 'bps').h, ...fi.stats.find(st => st.identifier === 'bps').a];
            allBonuses.sort(function (a, b) {
                return b.value - a.value;
            });

            let points = 3;
            allBonuses[0].points = points;
            let playersWithBonus3 = 1;
            let playersWithBonus = 1;
            let result = [allBonuses[0]];
            for (let i = 1; i < allBonuses.length; i++) {
                if (allBonuses[i].value === allBonuses[i-1].value) {
                    allBonuses[i].points = points;
                    if (points === 3) {
                        playersWithBonus3++;
                    }
                    playersWithBonus++;
                    result.push(allBonuses[i]);
                } else {
                    if (playersWithBonus >= 3) {
                        break;
                    }                    
                    if (playersWithBonus3 > 1) {
                        points = 1;
                    } else {
                        points--;
                    }
                    allBonuses[i].points = points;
                    playersWithBonus++;
                    result.push(allBonuses[i]);
                }
            }

            return result;
        });     
        
        let concatArrays = (...bonuses) => {
            const res = bonuses.reduce((acc, val) => {
               return acc.concat(...val);
            }, []);
            return res;
        };
        let result = concatArrays(bonuses);
        
        return result;
    }

    setReserves(playersToRender, playersToTake) {        
        for (let i = playersToTake; i < playersToRender.length; i++) {
            playersToRender[i].isReserve = true;                    
        }
    }

    showAutomaticSubstitudes(playersToRender, autoSubs) {
        for (let i = 0; i < autoSubs.length; i++) {
            const sub = autoSubs[i];
            let playerIn = playersToRender.find(pl => pl.id === sub.element_in);
            playerIn.goesIn = true;
            let playerOut = playersToRender.find(pl => pl.id === sub.element_out);
            playerOut.goesOut = true;
        }
    }

    makeSubstitudes(playersToRender) {
        let goalkeeper = playersToRender.find(pl => pl.position === 1);
        if (!goalkeeper.canPlay) {
            let reserveGoalkeeper = playersToRender.find(pl => pl.position === 12);
            if (reserveGoalkeeper.hasPlayed) {
                goalkeeper.goesOut = true;
                reserveGoalkeeper.goesIn = true;
            }
        }
    }

    canPickPlay(decoratedPick, fixtures) {
        const pickHasMatch = decoratedPick.hasMatch;
        let canPlay = pickHasMatch;

        if (pickHasMatch) {
            let matches = fixtures.filter(fi => fi.team_h === decoratedPick.teamId || fi.team_a === decoratedPick.teamId);
            let areAllFinished = !matches.some(m => m.finished === false);

            if (areAllFinished) {
                canPlay = decoratedPick.hasPlayed;
            }
        }

        return canPlay;
    }

    getPickPoints(pick, canCaptainPlay) {
        if (pick.isCaptain && canCaptainPlay) {
            return pick.points * pick.multiplier;
        } else if (pick.isViceCaptain && pick.hasMatch && !canCaptainPlay) {
            return pick.points * pick.multiplier;
        } else {
            return pick.points;
        }
    }

    getTotalPoints(playersToRender) {
        return playersToRender
            .filter(pl => (!pl.isReserve && !pl.goesOut) || (pl.isReserve && pl.goesIn))
            .reduce((acc, curr) => acc + curr.points, 0);
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
                <div className="refresh-wrapper">
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