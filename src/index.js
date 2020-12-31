import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

var ProxyUrl = 'https://ancient-depths-46233.herokuapp.com/';
var ApiBaseUrl = 'https://fantasy.premierleague.com/api';

class EntryForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = {value: localStorage.getItem("PlayerId")};

      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleChange(event) {    
        this.setState({value: event.target.value});  
    }

    handleSubmit(event) {
        const url = `${ProxyUrl}${ApiBaseUrl}/entry/${this.state.value}/`;

        fetch(url)
        .then(response => response.json())
        .then(data => {
            this.props.afterSubmit(data);
        });

        localStorage.setItem("PlayerId", this.state.value);
        event.preventDefault();
    }
  
    render() {
      return (
        <form onSubmit={this.handleSubmit}>
            <label>
                Player ID:<br/>
                <input 
                    type="text" 
                    placeholder="e.g. 2458458"
                    value={this.state.value} 
                    onChange={this.handleChange} />        
            </label>
            <input type="submit" value="Check" className="submit-entry" />
        </form>
      );
    }
}

function PlayerName(props) {
    return (
        <div className="entry-info" >
            {props.value}
            <button onClick={props.onChange} className="change-entry"></button>
        </div>
    );    
}

class LeagueForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {id: -1, value: "Select a League", leagues: props.leagues};
  
        this.handleChange = this.handleChange.bind(this);
    }
  
    handleChange(event) {    
        const index = event.target.selectedIndex;
        const optionElement = event.target[index];
        const leagueId = optionElement.getAttribute('league-id');
        this.setState({id: leagueId, value: event.target.value});  

        const allLeagues = [ ...this.state.leagues.classic, ...this.state.leagues.h2h ];
        const league = allLeagues.find(el => el.id === +leagueId);
        this.props.onChange(league);
    }
  
    render() {
        const classicLeagues = this.state.leagues.classic && this.state.leagues.classic.filter(le => le.league_type === 'x');
        const h2hLeagues = this.state.leagues.h2h;
        const globalLeagues = this.state.leagues.classic.filter(le => le.league_type === 's');

        return (
            <form className="league-form">
                <label>
                    {/* League:<br/> */}
                    <select value={this.state.value} onChange={this.handleChange} className="league-select">
                        <option value="Select a League" disabled hidden>Select a League</option>
                        <LeagueGroup leagues={classicLeagues} title="Classic Leagues" />       
                        <LeagueGroup leagues={h2hLeagues} title="Head-to-Head Leagues" />       
                        <LeagueGroup leagues={globalLeagues} title="Global Leagues" />       
                    </select>       
                </label>
            </form>
        );
    }
}

function LeagueGroup(props) {
    if (props.leagues && props.leagues.length > 0) {
        const options = props.leagues.map(le => (
            <option key={le.id} league-id={le.id} value={le.name}>{le.entry_rank} - {le.name}</option>
        ));

        return (
            <optgroup label={props.title}>                    
                {options}
            </optgroup>  
        );
    } else {
        return null;
    }
}

class PlayerSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: "Select a player"};

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({value: +event.target.value});
        this.props.onChange(+event.target.value);
    }

    render() {
        let players = this.props.rankings.map(pla => (
            <option key={pla.rank} value={pla.entry}>
                {pla.event_total ? 
                    `${pla.entry_name} ${pla.total} (${pla.event_total})` :
                    `${pla.entry_name} ${pla.total} (${pla.matches_won}-${pla.matches_drawn}-${pla.matches_lost})`}
            </option>
        ));
    
        return (
            <select value={this.state.value} onChange={this.handleChange} className="player-select">
                <option value="Select a player" disabled hidden>Select a player</option>
                {players}
            </select>
        ); 
    }  
}

function PlayerPoints(props) {
    return (
        <div className="points-wrapper">
            <span className="points">
                {props.points}
            </span>
        </div>
    );
}

function PlayerPicks(props) {
    const captainSvg = (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12"></circle><path d="M15.0769667,14.370341 C14.4472145,15.2780796 13.4066319,15.8124328 12.3019667,15.795341 C10.4380057,15.795341 8.92696674,14.284302 8.92696674,12.420341 C8.92696674,10.55638 10.4380057,9.045341 12.3019667,9.045341 C13.3988206,9.06061696 14.42546,9.58781014 15.0769667,10.470341 L17.2519667,8.295341 C15.3643505,6.02401882 12.1615491,5.35094208 9.51934028,6.67031017 C6.87713147,7.98967826 5.49079334,10.954309 6.17225952,13.8279136 C6.8537257,16.7015182 9.42367333,18.7279285 12.3769667,18.720341 C14.2708124,18.7262708 16.0646133,17.8707658 17.2519667,16.395341 L15.0769667,14.370341 Z" fill="currentColor"></path></svg>);
    const viceCaptainSvg = (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12"></circle><polygon points="13.5 .375 8.925 12.375 4.65 12.375 0 .375 3.15 .375 6.75 10.05 10.35 .375" transform="translate(5.25 6)" fill="currentColor"></polygon></svg>);

    let picks = props.picks.map(pick => (
        <li key={pick.id} className="player-pick">
            <span className="player-pick-name">{pick.name}</span>
            {pick.isCaptain ? <span className="cap-icon">{captainSvg}</span> : null}
            {pick.isViceCaptain ? <span className="cap-icon">{viceCaptainSvg}</span> : null}
            <span className="player-pick-points">{pick.points}</span>
        </li>
    ));

    return (
        <div className="player-picks-wrapper">
            <ul className="player-picks">
                {picks}
            </ul>
        </div>
    );
}

class PlayerInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rankings: props.rankings, 
            playerId: null, 
            event: props.event, 
            picks: null, 
            footballPlayers: null,
            playersToRender: null,
            liveStats: null,
            totalPoints: 0
        };

        fetch(`${ProxyUrl}${ApiBaseUrl}/bootstrap-static/`)
        .then(response => response.json())
        .then(data => {
            this.setState({footballPlayers: data.elements});
        });

        fetch(`${ProxyUrl}${ApiBaseUrl}/event/${this.state.event}/live/`)
        .then(response => response.json())
        .then(data => {
            this.setState({liveStats: data.elements});
        });
    }

    handlePlayerChange(playerId) {
        this.setState({playerId: playerId});

        const url = `${ProxyUrl}${ApiBaseUrl}/entry/${playerId}/event/${this.state.event}/picks/`;

        fetch(url)
        .then(response => response.json())
        .then(data => {
            this.setState({picks: data.picks});

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

                this.setState({playersToRender: playersToRender});
            }

            if (this.state.playersToRender) {
                let totalPoints = this.state.playersToRender.slice(0, 11).reduce((acc, curr) => acc + curr.points, 0);

                this.setState({totalPoints: totalPoints});
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
            <div className="player-info">
                {this.state.rankings && 
                    <PlayerSelector rankings={this.state.rankings} onChange={(pi) => this.handlePlayerChange(pi)} />} 
                <PlayerPoints points={this.state.totalPoints} />    
                {this.state.playersToRender && 
                    <PlayerPicks picks={this.state.playersToRender} />}                           
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {playerName: null, playerInfo: null, currentEvent: null , leagues: null, selectedLeague: null, rankings: null};
    }

    handlePlayerInfo(data) {      
        let playerName = `${data.name}, ${data.player_first_name} ${data.player_last_name}`;
        this.setState({playerName: playerName, playerInfo: data, currentEvent: data.current_event, leagues: data.leagues});        
    }

    handlePlayerChange() {
        this.setState({playerName: null, playerInfo: null, leagues: null});
    }

    handleLeagueChange(league) {
        this.setState({selectedLeague: league});

        const urlLeague = league.scoring === 'c' ? '/leagues-classic/' : '/leagues-h2h/';
        const url = `${ProxyUrl}${ApiBaseUrl}${urlLeague}${league.id}/standings/`;

        this.setState({rankings: null});

        fetch(url)
        .then(response => response.json())
        .then(data => {
            this.setState({rankings: data.standings.results});
        });
    }

    render() {
        return (
            <div className="app">
                {!this.state.playerName && <EntryForm afterSubmit={(pi) => this.handlePlayerInfo(pi)} />}
                {this.state.playerName && <PlayerName value={this.state.playerName} onChange={() => this.handlePlayerChange()} />}
                {this.state.leagues && <LeagueForm leagues={this.state.leagues} onChange={(d) => this.handleLeagueChange(d)} />} 
                <div className="players-info">
                    {this.state.rankings && <PlayerInfo rankings={this.state.rankings} event={this.state.currentEvent} />}
                    {this.state.rankings && <PlayerInfo rankings={this.state.rankings} event={this.state.currentEvent} />}   
                </div>
            </div>
        );
    }
}
  
// ========================================
  
ReactDOM.render(
    <App />,
    document.getElementById('root')
);