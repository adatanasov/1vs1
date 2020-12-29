import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

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
        const proxyUrl = 'https://ancient-depths-46233.herokuapp.com/';
        let url = proxyUrl + 'https://fantasy.premierleague.com/api/entry/' + this.state.value + '/';

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

class LeaguesForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {id: -1, value: null, rank: -1, leagues: props.leagues};
  
        this.handleChange = this.handleChange.bind(this);
    }
  
    handleChange(event) {    
        this.setState({value: event.target.value});  
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
                        <option value="none" selected disabled hidden>Select a League</option>
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
            <option value={le.name}>{le.entry_rank} - {le.name}</option>
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

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {"playerName": '', "playerInfo": '', "leagues": null};
    }

    handlePlayerInfo(data) {
        console.log(data);        
        let playerName = `${data.name}, ${data.player_first_name} ${data.player_last_name}, ${data.player_region_name}`;
        this.setState({playerName: playerName, playerInfo: data, leagues: data.leagues});        
    }

    handlePlayerChange() {
        this.setState({"playerName": '', "playerInfo": '', "leagues": null});
    }

    render() {
        return (
            <div className="app">
                {!this.state.playerName && <EntryForm afterSubmit={(pi) => this.handlePlayerInfo(pi)} />}
                {this.state.playerName && <PlayerName value={this.state.playerName} onChange={() => this.handlePlayerChange()} />}
                {this.state.leagues && <LeaguesForm leagues={this.state.leagues} />}                
            </div>
        );
    }
}
  
// ========================================
  
ReactDOM.render(
    <App />,
    document.getElementById('root')
);