const proxyUrl = 'https://cryptic-plains-87247.herokuapp.com/';
const apiBaseUrl = 'https://fantasy.premierleague.com/api';
const url = `${proxyUrl}${apiBaseUrl}`;

export async function getEntryById(id) {
    return fetch(`${url}/entry/${id}/`)
    .then(response => {
        if (!response.ok) {
            return Promise.reject(response);
        }
        return response.json();
    })
    .then(data => {
        data.isSuccess = true;
        return data;
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

export async function getLeagueData(leagueId, isH2hLeague, currentEvent) {
    const standingsUrlStart = isH2hLeague ? '/leagues-h2h/' : '/leagues-classic/';
    const standingsUrl = `${url}${standingsUrlStart}${leagueId}/standings/`;

    return fetch(standingsUrl)
    .then(response => response.json())
    .then(data => {
        if (isH2hLeague) {
            const matchesUrl = `${url}/leagues-h2h-matches/league/${leagueId}/?page=1&event=${currentEvent}`;
            return fetch(matchesUrl)
            .then(response => response.json())
            .then(matchesData => {
                return {rankings: data.standings.results, matches: matchesData.results};
            });
        } else {
            return {rankings: data.standings.results, matches: null};
        }            
    });
}

export async function getPlayersAndTeams() {
    return fetch(`${url}/bootstrap-static/`)
    .then(response => response.json())
    .then(data => {
        return {footballPlayers: data.elements, teams: data.teams};
    });
}

export async function getGameweekFootballersData(gameweek) {
    return fetch(`${url}/event/${gameweek}/live/`)
    .then(response => response.json())
    .then(liveData => {
        return {liveStats: liveData.elements};
    }); 
}

export async function getGameweekFixturesData(gameweek) {
    return fetch(`${url}/fixtures/?event=${gameweek}`)
    .then(response2 => response2.json())
    .then(data => {
        return {fixtures: data};
    });
}

export async function getPlayerPicksForEvent(playerId, event) {
    return fetch(`${url}/entry/${playerId}/event/${event}/picks/`)
    .then(response => response.json())
    .then(data => {
        return data;
    });
}