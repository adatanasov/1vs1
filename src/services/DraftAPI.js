const proxyUrl = 'https://cryptic-plains-87247.herokuapp.com/';
const apiBaseUrl = 'https://draft.premierleague.com/api';
//const pulseApiBaseUrl = 'https://footballapi.pulselive.com';
const url = `${proxyUrl}${apiBaseUrl}`;
//const pulseUrl = `${proxyUrl}${pulseApiBaseUrl}`;

export async function getEntryById(id) {
    return fetch(`${url}/entry/${id}/public`)
    .then(response => {
        if (!response.ok) {
            return Promise.reject(response);
        }
        return response.json();
    })
    .then(data => {
        data.entry.isSuccess = true;
        return data.entry;
    })
    .catch(error => {
        error.json().then((body) => {
            return {
                isSuccess: false,
                error: body
            };
        });          
    });
}