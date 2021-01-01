import React, { Component } from 'react';

class EntryForm extends Component {
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
        const url = `${this.props.baseUrl}/entry/${this.state.value}/`;

        fetch(url)
        .then(response => {
          if (!response.ok) {
            return Promise.reject(response);
          }
          return response.json();
        })
        .then(data => {
          data.isSuccess = true;
          this.props.afterSubmit(data);
        })
        .catch(error => {
          error.json().then((body) => {
            this.props.afterSubmit({
              isSuccess: false,
              error: body
            });
          });
          
        });

        localStorage.setItem("PlayerId", this.state.value);
        event.preventDefault();
    }
  
    render() {
      return (
        <form onSubmit={this.handleSubmit}>
            <label>
                On the website go to Points and copy this number from the URL: <i>https://fantasy.premierleague.com/entry/</i><b>2458458</b><i>/event/16</i>
                <br/>
                <br/>
                Player ID:                    
                <br/>
                <input 
                    type="text" 
                    placeholder="e.g. 2458458"
                    value={this.state.value} 
                    onChange={this.handleChange} />        
            </label>
            <br/>
            <input type="submit" value="Check" className="submit-entry" />
        </form>
      );
    }
}

export default EntryForm;