import * as CacheService from './CacheService';

export async function GetMultiplePicksData(picks, gameweek, footballPlayers, teams, isDraft, api) {
    let liveStats = await api.getGameweekFootballersData(gameweek);
    let fixtures = await api.getGameweekFixturesData(gameweek);

    let unfinishedFixtures = fixtures.filter(m => m.finished_provisional === false);
    let unfinishedFixturesLineUps = [];
    if (unfinishedFixtures.some(f => f)) {
        await Promise.all(unfinishedFixtures.map(async f => {
            let fixtureId = f.pulse_id;
            let pulseFixturePlayerIds = await api.getFixturePlayers(fixtureId);
            if (pulseFixturePlayerIds.some(l => l)) {
                unfinishedFixturesLineUps.push({id:fixtureId, lineup:pulseFixturePlayerIds});
            }
        }));        
    }

    let result = [];

    await Promise.all(picks.map(async pick => {
        let name = pick.name;
        let playerId = pick.id;
        let cacheKey = `${gameweek}-${playerId}`;
        let data = await CacheService.getIfExist(cacheKey, api.getPlayerPicksForEvent, playerId, gameweek);

        let playingTeams = fixtures.map(f => f.team_h).concat(fixtures.map(f => f.team_a));
        let transferCosts = data.entry_history.event_transfers_cost ?? 0;
        let isBenchBoostActive = data.active_chip && data.active_chip === 'bboost';
        let isTripleCaptainActive = data.active_chip && data.active_chip === '3xc';
        let isThereAutomaticSubs = data.automatic_subs && data.automatic_subs.length > 0;
        let currentMatchesBonus = getCurrentMatchesBonus(fixtures, isDraft);

        let playersToRender = await Promise.all(data.picks.map(pick => {
            let actualPlayer = footballPlayers.find(pl => pl.id === pick.element);
            let actualStat = isDraft ? liveStats[pick.element] : liveStats.find(pl => pl.id === pick.element);
            
            let decoratedPick = {
                id: pick.element, 
                teamId: actualPlayer.team,
                name: actualPlayer.web_name, 
                points: actualStat.stats.total_points,
                minutes: actualStat.stats.minutes,
                bonus: actualStat.stats.bonus,
                hasMatch: playingTeams.includes(actualPlayer.team),
                hasMatchStarted: fixtures.some(fi => fi.started && (fi.team_h === actualPlayer.team || fi.team_a === actualPlayer.team)),
                hasUnfinishedFixture: null,
                opposingTeam: getOpposingTeamName(fixtures, teams, actualPlayer.team),
                canPlay: null,
                hasPlayed: actualStat.stats.minutes > 0 || actualStat.stats.yellow_cards > 0 || actualStat.stats.red_cards > 0,
                goesIn: null,
                goesOut: null,
                isReserve: null,
                isCaptain: pick.is_captain,
                isViceCaptain: pick.is_vice_captain,
                isTripleCaptainActive: isTripleCaptainActive,
                multiplier: pick.multiplier,
                position: pick.position,
                type: actualPlayer.element_type, // 1- GOAL, 2 - DEF, 3 - MID, 4 - FORW, 5 - MANAGER
                chance: actualPlayer.chance_of_playing_this_round ?? 100,
                optaCode: 'p' + actualPlayer.code
            };
    
            decoratedPick.canPlay = decoratedPick.type === 5 ? true : canPickPlay(decoratedPick, fixtures, unfinishedFixturesLineUps);
            decoratedPick.hasUnfinishedFixture = hasUnfinishedFixture(decoratedPick, fixtures, unfinishedFixturesLineUps);
    
            let bonus = currentMatchesBonus.find(el => el.element === decoratedPick.id);
            if (bonus) {
                decoratedPick.bonus += bonus.points;
                decoratedPick.points += bonus.points;
            }
    
            return decoratedPick;
        }));
    
        if (!isBenchBoostActive) {
            setReserves(playersToRender, 11);
    
            if (isThereAutomaticSubs) {
                showAutomaticSubstitudes(playersToRender, data.automatic_subs);
            } else {
                makeSubstitudes(playersToRender);
            }
        }
    
        const captain = playersToRender.find(pl => pl.isCaptain);
        const multiplier = isTripleCaptainActive ? 3 : 2;
        playersToRender.map(pl => pl.points = getPickPoints(pl, captain?.canPlay, multiplier));
    
        const totalPoints = getTotalPoints(playersToRender) - transferCosts;
    
        //TODO: remove the name from the properties names
        let currentResult = {
            id: playerId,
            [`${name}picks`]: data.picks,
            [`${name}addSeparator`]: !isBenchBoostActive,
            [`${name}totalPoints`]: totalPoints,
            [`${name}minusPoints`]: -transferCosts,
            [`${name}playersToRender`]: playersToRender
        };
        
        result.push(currentResult);
    }));

    return result;
}

function getCurrentMatchesBonus(fixtures, isDraft) {
    let matchesWithoutBonus = fixtures.filter(fi => fi.started && 
        fi.stats.find(st => isDraft ? st.s : st.identifier === 'bonus').h.length === 0 && 
        fi.stats.find(st => isDraft ? st.s : st.identifier === 'bonus').a.length === 0);
    let bonuses = matchesWithoutBonus.map(fi => {
        let allBonuses = [...fi.stats.find(st => isDraft ? st.s : st.identifier === 'bps').h, ...fi.stats.find(st => isDraft ? st.s : st.identifier === 'bps').a];
        if (!allBonuses || allBonuses.length === 0) {
            return [];
        }

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

function getOpposingTeamName(fixtures, teams, teamId) {
    let match = fixtures.find(fi => fi.team_h === teamId || fi.team_a === teamId);

    if (match) {
        let opposingTeamId = '';
        if (match.team_h === teamId) {
            opposingTeamId = match.team_a;
        } else {
            opposingTeamId = match.team_h;
        }

        return teams.find(t => t.id === opposingTeamId).short_name;
    } else {
        return null;
    }
}

function canPickPlay(decoratedPick, fixtures, unfinishedFixturesLineUps) {
    const pickHasMatch = decoratedPick.hasMatch;
    let canPlay = pickHasMatch;

    if (pickHasMatch) {
        let pickFixtures = fixtures.filter(fi => fi.team_h === decoratedPick.teamId || fi.team_a === decoratedPick.teamId);
        let unfinishedPickFixtures = pickFixtures.filter(m => m.finished_provisional === false);
        let areAllFinished = !unfinishedPickFixtures.some(f => f);

        if (areAllFinished) {
            canPlay = decoratedPick.hasPlayed;
        } else if (pickFixtures.length === 1 && unfinishedPickFixtures.length === 1) {
            let fixtureId = unfinishedPickFixtures[0].pulse_id;

            if (unfinishedFixturesLineUps.some(f => f.id === fixtureId)) {
                let pickInLineUpOrSubs = unfinishedFixturesLineUps
                .find(f => f.id === fixtureId)
                .lineup
                .some(p => p === decoratedPick.optaCode);

                canPlay = pickInLineUpOrSubs;
            }
        }
    }

    return canPlay;
}

function hasUnfinishedFixture(decoratedPick, fixtures, unfinishedFixturesLineUps) {
    const pickHasMatch = decoratedPick.hasMatch;
    let canPlay = pickHasMatch;

    if (pickHasMatch) {
        let pickFixtures = fixtures.filter(fi => fi.team_h === decoratedPick.teamId || fi.team_a === decoratedPick.teamId);
        let unfinishedPickFixtures = pickFixtures.filter(m => m.finished_provisional === false);
        let areAllFinished = !unfinishedPickFixtures.some(f => f);

        if (areAllFinished) {
            canPlay = false;
        } else if (pickFixtures.length === 1 && unfinishedPickFixtures.length === 1) {
            let fixtureId = unfinishedPickFixtures[0].pulse_id;

            if (unfinishedFixturesLineUps.some(f => f.id === fixtureId)) {
                let pickInLineUpOrSubs = unfinishedFixturesLineUps
                .find(f => f.id === fixtureId)
                .lineup
                .some(p => p === decoratedPick.optaCode);

                canPlay = pickInLineUpOrSubs;
            }
        }
    }

    return canPlay;
}

function setReserves(playersToRender, playersToTake) {        
    for (let i = playersToTake; i < 15; i++) {
        playersToRender[i].isReserve = true;                    
    }
}

function showAutomaticSubstitudes(playersToRender, autoSubs) {
    for (let i = 0; i < autoSubs.length; i++) {
        const sub = autoSubs[i];
        let playerIn = playersToRender.find(pl => pl.id === sub.element_in);
        playerIn.goesIn = true;
        let playerOut = playersToRender.find(pl => pl.id === sub.element_out);
        playerOut.goesOut = true;
    }
}

function makeSubstitudes(playersToRender) {
    let goalkeeper = playersToRender.find(pl => pl.position === 1);
    if (!goalkeeper.canPlay) {
        let reserveGoalkeeper = playersToRender.find(pl => pl.position === 12);
        if (reserveGoalkeeper.hasPlayed) {
            goalkeeper.goesOut = true;
            reserveGoalkeeper.goesIn = true;
        }
    }

    let notPlayingTitulars = playersToRender.filter(pl => pl.position > 1 && !pl.isReserve && (!pl.hasMatch || !pl.canPlay));
    let reserves = playersToRender.filter(pl => pl.position > 12 && pl.canPlay);

    for (let i = 0; i < notPlayingTitulars.length; i++) {
        let titular = notPlayingTitulars[i];
        for (let j = 0; j < reserves.length; j++) {
            let reserve = reserves[j];
            if (!reserve.goesIn && canChangePlayer(playersToRender, titular.type, reserve.type)) {
                if (reserve.hasPlayed) {
                    titular.goesOut = true;
                    reserve.goesIn = true;
                    break;
                } else {
                    break;
                }
            }
        }
    }
}

function canChangePlayer(playersToRender, titularType, reserveType) {
    if (titularType === reserveType || titularType === 3) {
        return true;
    } 
    
    let currentPlayers = playersToRender.filter(pl => (!pl.isReserve && !pl.goesOut) || (pl.isReserve && pl.goesIn));
    let remainingFromType = currentPlayers.filter(pl => pl.type === titularType).length;

    if (titularType === 2 && remainingFromType <= 3) {
        return false;
    }

    if (titularType === 4 && remainingFromType <= 1) {
        return false;
    }

    return true;
}

function getPickPoints(pick, canCaptainPlay, captainMultiplier) {
    if (pick.isCaptain && canCaptainPlay) {
        return pick.points * pick.multiplier;
    } else if (pick.isViceCaptain && pick.hasMatch && !canCaptainPlay) {
        return pick.points * captainMultiplier;
    } else {
        return pick.points;
    }
}

function getTotalPoints(playersToRender) {
    return playersToRender
        .filter(pl => (!pl.isReserve && !pl.goesOut) || (pl.isReserve && pl.goesIn))
        .reduce((acc, curr) => acc + curr.points, 0);
}