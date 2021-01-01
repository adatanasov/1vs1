function LeagueGroup(props) {
    if (props.leagues && props.leagues.length > 0) {
        const options = props.leagues.map(le => (
            <option key={le.id} league-id={le.id} value={le.name}>{le.entry_rank} - {le.name}</option>
        ));

        return (
            <optgroup label={props.title}>                    
                {options}
            </optgroup>  
        );
    } else {
        return null;
    }
}

export default LeagueGroup;