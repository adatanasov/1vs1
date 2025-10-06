function PlayerName(props) {
    return (
        <div className="entry-info" >
            <div className="text-ellipsis">{props.value}</div>
            <button onClick={props.onChange} className="change-entry"></button>
        </div>
    );    
}

export default PlayerName;