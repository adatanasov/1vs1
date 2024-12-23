export function get(key) {
    let data = localStorage.getItem(key);

    if (data !== null) {
        return JSON.parse(data);
    } else {
        return null;
    }
}

export function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export async function getIfExist(key, callback, playerId, gameweek) {
    let data = get(key);

    if (data === null) {
        data = await callback(playerId, gameweek);
        set(key, data);
    }

    return data;
}