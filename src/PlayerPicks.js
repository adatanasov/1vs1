function PlayerPicks(props) {
    const captainSvg = (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12"></circle><path d="M15.0769667,14.370341 C14.4472145,15.2780796 13.4066319,15.8124328 12.3019667,15.795341 C10.4380057,15.795341 8.92696674,14.284302 8.92696674,12.420341 C8.92696674,10.55638 10.4380057,9.045341 12.3019667,9.045341 C13.3988206,9.06061696 14.42546,9.58781014 15.0769667,10.470341 L17.2519667,8.295341 C15.3643505,6.02401882 12.1615491,5.35094208 9.51934028,6.67031017 C6.87713147,7.98967826 5.49079334,10.954309 6.17225952,13.8279136 C6.8537257,16.7015182 9.42367333,18.7279285 12.3769667,18.720341 C14.2708124,18.7262708 16.0646133,17.8707658 17.2519667,16.395341 L15.0769667,14.370341 Z" fill="currentColor"></path></svg>);
    const viceCaptainSvg = (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12"></circle><polygon points="13.5 .375 8.925 12.375 4.65 12.375 0 .375 3.15 .375 6.75 10.05 10.35 .375" transform="translate(5.25 6)" fill="currentColor"></polygon></svg>);

    let picks = props.picks.map(pick => (
        <li key={pick.id} className="player-pick">
            <span className={`player-pick-name ${pick.isReserve ? 'reserve' : ''}`}>{pick.name}</span>
            {pick.isCaptain ? <span className="cap-icon">{captainSvg}</span> : null}
            {pick.isViceCaptain ? <span className="cap-icon">{viceCaptainSvg}</span> : null}
            <span className="player-pick-points">{pick.isPlaying ? pick.points : '-'}</span>
        </li>
    ));

    return (
        <div className="player-picks-wrapper">
            <ul className="player-picks">
                {picks}
            </ul>
        </div>
    );
}

export default PlayerPicks;