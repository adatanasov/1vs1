import { Component } from 'react';
import PlayerSelector from './PlayerSelector';
import PlayerPoints from './PlayerPoints';
import PlayerPicks from './PlayerPicks';

class PlayerInfo extends Component {    
    handlePlayerChange(playerId) {
        this.props.handlePlayerChange(playerId);
    }

    render() {
        return (
            <div className="player-info">
                {this.props.rankings && 
                    <PlayerSelector
                        playerId={this.props.playerId}
                        rankings={this.props.rankings} 
                        onChange={(pi) => this.handlePlayerChange(pi)} />} 
                <PlayerPoints points={this.props.totalPoints} minusPoints={this.props.minusPoints}/> 
                {this.props.playersToRender && 
                    <PlayerPicks picks={this.props.playersToRender} addSeparator={this.props.addSeparator} />}                           
            </div>
        );
    }
}

export default PlayerInfo;