function PlayerName(props) {
    return (
        <div className="entry-info" >
            {props.value}
            <button onClick={props.onChange} className="change-entry"></button>
        </div>
    );    
}

export default PlayerName;