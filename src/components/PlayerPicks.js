function PlayerPicks(props) {
    const captainSvg = (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12"></circle><path d="M15.0769667,14.370341 C14.4472145,15.2780796 13.4066319,15.8124328 12.3019667,15.795341 C10.4380057,15.795341 8.92696674,14.284302 8.92696674,12.420341 C8.92696674,10.55638 10.4380057,9.045341 12.3019667,9.045341 C13.3988206,9.06061696 14.42546,9.58781014 15.0769667,10.470341 L17.2519667,8.295341 C15.3643505,6.02401882 12.1615491,5.35094208 9.51934028,6.67031017 C6.87713147,7.98967826 5.49079334,10.954309 6.17225952,13.8279136 C6.8537257,16.7015182 9.42367333,18.7279285 12.3769667,18.720341 C14.2708124,18.7262708 16.0646133,17.8707658 17.2519667,16.395341 L15.0769667,14.370341 Z" fill="currentColor"></path></svg>);
    const viceCaptainSvg = (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12"></circle><polygon points="13.5 .375 8.925 12.375 4.65 12.375 0 .375 3.15 .375 6.75 10.05 10.35 .375" transform="translate(5.25 6)" fill="currentColor"></polygon></svg>);
    const rightIconSvg = (<svg x="0px" y="0px" viewBox="0 0 1000 1000" enableBackground="new 0 0 1000 1000" ><g><g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)"><path d="M4565.9,4988.3c-1114.1-104.7-2151.2-576.8-2945.4-1337.4c-727-695.4-1224.8-1590.2-1420.3-2550.3C-222.6-979.5,717.7-3077.5,2552.9-4142.2c553.1-320,1199.1-535.4,1854.9-618.3c292.4-37.5,892.9-37.5,1185.3,0c991.7,124.5,1872.7,519.6,2639.2,1181.3c675.6,582.8,1222.8,1440.1,1469.7,2295.4c513.6,1783.8,11.8,3656.5-1317.6,4930.7C7371,4618.9,5944.7,5118.6,4565.9,4988.3z M5968.4,2096.2L7934,130.7L5962.5-1838.8L3993-3810.3l-557.1,559.1l-559,557.1l1408.5,1408.5L5691.9,120.8L4289.3,1523.3c-770.4,770.4-1402.6,1410.5-1402.6,1422.3c0,19.8,1086.5,1116.1,1106.2,1116.1C3998.9,4061.8,4887.9,3176.8,5968.4,2096.2z"/></g></g></svg>);
    const leftIconSvg = (<svg x="0px" y="0px" viewBox="0 0 1000 1000" enableBackground="new 0 0 1000 1000" ><g><g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)"><path d="M4573.9,5006.6c-1148.9-116.7-2173.2-587.3-2984-1372.4C-344,1763.5-403.4-1329.2,1459.4-3273c1906.3-1989.3,5064.3-2026.9,7010.1-83.1c739.6,735.6,1204.3,1649.2,1386.2,2719c43.5,257.1,59.3,984.8,27.7,1271.5c-112.7,1026.3-520.1,1949.8-1214.2,2742.7c-622.9,711.9-1530.5,1261.6-2463.9,1495c-413.3,102.8-632.8,128.5-1117.3,136.4C4848.8,5010.5,4617.4,5010.5,4573.9,5006.6z M6565.2,3482c302.5-302.5,549.7-557.6,549.7-569.5c0-9.9-628.8-648.6-1398.1-1417.8l-1400-1400l1409.9-1409.9l1407.9-1408l-563.6-563.6l-563.6-563.6L4034-1876.9L2062.5,94.6l1967.6,1967.6c1081.7,1081.7,1971.5,1967.6,1977.5,1967.6S6264.6,3782.5,6565.2,3482z"/></g></g></svg>);

    let picks = props.picks.map(pick => (
        <li key={pick.id} className={`player-pick ${props.addSeparator && pick.position === 11 ? 'separator' : ''} ${pick.hasUnfinishedFixture ? 'live' : ''}`}>
            <span className={`player-pick-name ${pick.isReserve ? 'reserve' : ''} type${pick.type}`}>
                <span className={`chance chance-${pick.chance}`}></span>
                {pick.name}
            </span>
            {pick.isCaptain ? <span className={`cap-icon ${pick.isTripleCaptainActive ? 'inverted' : ''}`}>{captainSvg}</span> : null}
            {pick.isViceCaptain ? <span className={`cap-icon ${pick.isTripleCaptainActive ? 'inverted' : ''}`}>{viceCaptainSvg}</span> : null}
            <span className="player-pick-points">
                {pick.hasMatch ? (!pick.canPlay ? 'x' : (pick.hasMatchStarted ? pick.points : pick.opposingTeam)) : '-'}
            </span>
            {pick.goesOut ? <span className="sub-icon goes-out">{rightIconSvg}</span> : null}
            {pick.goesIn ? <span className="sub-icon goes-in">{leftIconSvg}</span> : null}
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