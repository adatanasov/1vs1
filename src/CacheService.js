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

export async function getFixtureIfExist(key, expires, callback, fixtureId) {
    let item = get(key);
    let data = null;

    if (item && item.expires) {
        if (Date.now() - item.expires > 0) {
            localStorage.removeItem(key);
            item = null;
        } else {
            data = item.data;
        }
    }

    if (data === null) {
        data = await callback(fixtureId);
        set(key, {expires: expires, data: data});
    }

    return data;
}