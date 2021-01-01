function PlayerPoints(props) {
    return (
        <div className="points-wrapper">
            <span className="points">
                {props.points}
            </span>
        </div>
    );
}

export default PlayerPoints;