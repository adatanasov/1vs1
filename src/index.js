import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class EntryForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = {value: '', "playerInfo": ''};

      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleChange(event) {    
        this.setState({value: event.target.value});  
    }

    handleSubmit(event) {
        const proxyUrl = 'https://ancient-depths-46233.herokuapp.com/';
        let url = proxyUrl + 'https://fantasy.premierleague.com/api/entry/' + this.state.value + '/';

        fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            let playerInfo = ` ${data.name}, ${data.player_first_name} ${data.player_last_name}, ${data.player_region_name}`;
            this.setState({playerInfo: playerInfo});
        });

        event.preventDefault();
    }
  
    render() {
      return (
        <div className="app">
            <form onSubmit={this.handleSubmit}>
                <label>
                    Player ID:
                    <input 
                        type="text" 
                        placeholder="e.g. 2458458"
                        value={this.state.value} 
                        onChange={this.handleChange} />        
                </label>
                <input type="submit" value="Check" />
            </form>
            <div className="entry-info" >
                {this.state.playerInfo}
            </div>
        </div>
      );
    }
  }
  
// ========================================
  
ReactDOM.render(
    <EntryForm />,
    document.getElementById('root')
);