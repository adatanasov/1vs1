function PlayerPoints(props) {
    return (
        <div className="points-wrapper">
            <span className="points">
                {props.points}
            </span>
            {props.minusPoints < 0 && 
                <span className="minusPoints">
                    ({props.minusPoints})
                </span>}
        </div>
    );
}

export default PlayerPoints;