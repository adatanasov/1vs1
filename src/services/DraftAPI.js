const proxyUrl = 'https://cryptic-plains-87247.herokuapp.com/';
const apiBaseUrl = 'https://draft.premierleague.com/api';
const pulseApiBaseUrl = 'https://footballapi.pulselive.com';
const url = `${proxyUrl}${apiBaseUrl}`;
const pulseUrl = `${proxyUrl}${pulseApiBaseUrl}`;

export async function getEntryById(id) {
    return fetch(`${url}/entry/${id}/public`)
    .then(response => {
        if (!response.ok) {
            return Promise.reject(response);
        }
        return response.json();
    })
    .then(data => {
        data.entry.isSuccess = true;
        data.entry.leagueId = data.entry.league_set[0];
        return data.entry;
    })
    .catch(error => {
        error.json().then((body) => {
            return {
                isSuccess: false,
                error: body
            };
        });          
    });
}

export async function getPlayersAndTeams() {
    return fetch(`${url}/bootstrap-static`)
    .then(response => response.json())
    .then(data => {
        return {
            footballPlayers: data.elements, 
            teams: data.teams,
            currentGameweek: data.events.current
        };
    });
}

export async function getLeagueById(id) {
    return fetch(`${url}/league/${id}/details`)
    .then(response => response.json())
    .then(data => {
        return data;
    });
}

export async function getGameweekFootballersData(gameweek) {
    return fetch(`${url}/event/${gameweek}/live`)
    .then(response => response.json())
    .then(liveData => {
        return liveData.elements;
    }); 
}

export async function getGameweekFixturesData(gameweek) {
    return fetch(`${url}/event/${gameweek}/live`)
    .then(response => response.json())
    .then(liveData => {
        return liveData.fixtures;
    }); 
}

export async function getPlayerPicksForEvent(playerId, event) {
    return fetch(`${url}/entry/${playerId}/event/${event}`)
    .then(response => response.json())
    .then(data => {
        return data;
    });
}

export async function getFixturePlayers(fixtureId) {
    return fetch(`${pulseUrl}/football/fixtures/${fixtureId}?altIds=true&fast=false`)
    .then(response => response.json())
    .then(data => {       
        let pickIds = [];
        let lineUpAvailable = 
            data.teamLists 
            && data.teamLists.length === 2 
            && data.teamLists[0] 
            && data.teamLists[0].lineup 
            && data.teamLists[0].lineup.some(f => f) 
            && data.teamLists[0].substitutes 
            && data.teamLists[0].substitutes.some(f => f) 
            && data.teamLists[1] 
            && data.teamLists[1].lineup 
            && data.teamLists[1].lineup.some(f => f) 
            && data.teamLists[1].substitutes 
            && data.teamLists[1].substitutes.some(f => f);
        if (lineUpAvailable) {                
            pickIds = 
                [...data.teamLists[0].lineup.map(p => p.altIds.opta), 
                ...data.teamLists[0].substitutes.map(p => p.altIds.opta), 
                ...data.teamLists[1].lineup.map(p => p.altIds.opta), 
                ...data.teamLists[1].substitutes.map(p => p.altIds.opta)];
        }
        return pickIds;
    });
}