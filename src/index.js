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
        let url = ProxyUrl + ApiBaseUrl + '/entry/' + this.state.value + '/';

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
            <input type="submit" value="Check" />
        </form>
      );
    }
}

function PlayerName(props) {
    return (
        <div className="entry-info" >
            {props.value}
            <button onClick={props.onChange}>Change</button>
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
            <form>
                <label>
                    Leagues:<br/>
                    <select value={this.state.value} onChange={this.handleChange}>
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

class Standings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {results: null};
    }

    componentDidMount() {
        let urlLeague = this.props.scoring === 'c' ? '/leagues-classic/' : '/leagues-h2h/';
        let url = ProxyUrl + ApiBaseUrl + urlLeague + this.props.id + '/standings/';
    
        fetch(url)
        .then(response => response.json())
        .then(data => {
            this.setState({results: data.standings.results});            
        });
    }

    render() {
        if (this.state.results) {
            let players = this.state.results.map(pla => (
                <li key={pla.rank}>{pla.rank}. {pla.entry_name}, {pla.player_name} {pla.total} ({pla.event_total})</li>
            ));

            return (
                <ol className="rankings">
                    {players}
                </ol>
            );
        } else {
            return null;
        }        
    }    
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {"playerName": '', "playerInfo": '', "leagues": null, "selectedLeague": null};
    }

    handlePlayerInfo(data) {
        //console.log(data);        
        let playerName = `${data.name}, ${data.player_first_name} ${data.player_last_name}, ${data.player_region_name}`;
        this.setState({playerName: playerName, playerInfo: data, leagues: data.leagues});        
    }

    handlePlayerChange() {
        this.setState({"playerName": '', "playerInfo": '', "leagues": null});
    }

    handleLeagueChange(league) {
        this.setState({"selectedLeague": league});
    }

    render() {
        return (
            <div className="app">
                {!this.state.playerName && <EntryForm afterSubmit={(pi) => this.handlePlayerInfo(pi)} />}
                {this.state.playerName && <PlayerName value={this.state.playerName} onChange={() => this.handlePlayerChange()} />}
                {this.state.leagues && <LeagueForm leagues={this.state.leagues} onChange={(d) => this.handleLeagueChange(d)} />}  
                {this.state.selectedLeague && <Standings id={this.state.selectedLeague.id} scoring={this.state.selectedLeague.scoring} />}              
            </div>
        );
    }
}
  
// ========================================
  
ReactDOM.render(
    <App />,
    document.getElementById('root')
);