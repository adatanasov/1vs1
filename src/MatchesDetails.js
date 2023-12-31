import { Component } from "react";

class MatchesDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false
        }

        this.openMatch = this.openMatch.bind(this);
        this.refreshAll = this.refreshAll.bind(this);
    }

    openMatch(player1Id, player2Id) {
        this.props.openMatch(player1Id, player2Id);
    }

    refreshAll(event) {
        this.props.refreshAll();
    }

    render() {
    if (this.props.matches && this.props.matches.length > 0) {
        const allMatches = this.props.matches.map(m => (
            <div className={"match-row" + (this.props.playerId === m.entry_1_entry || this.props.playerId === m.entry_2_entry ? " own-match" : "") }
                key={m.id}
                onClick={() => this.openMatch(m.entry_1_entry, m.entry_2_entry)}>
                <span className="match-player text-right pr10">
                    <div className="text-ellipsis">{m.entry_1_name}</div>
                    <div className="text-ellipsis">{m.entry_1_player_name}</div>
                </span>
                <span className="points-small pr5">{m.entry_1_points}</span>
                <span className="points-small pl5">{m.entry_2_points}</span>
                <span className="match-player text-left pl10">
                    <div className="text-ellipsis">{m.entry_2_name}</div>    
                    <div className="text-ellipsis">{m.entry_2_player_name}</div>
                </span>
            </div>
        ));

        return (
            <div>                    
                {allMatches}
                <div className="refresh-wrapper">
                    {this.props.inProgress ? 
                    <button 
                        onClick={this.refreshAll} 
                        className="refresh"
                        disabled={this.state.isLoading}>Refresh all</button> : null}
                </div>
            </div>  
        );
    } else {
        return null;
    }}
}

export default MatchesDetails;