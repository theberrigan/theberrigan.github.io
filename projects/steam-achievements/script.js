const init = () => {
    fetch('https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=960910&key=D52BFCBBCE2620697CE790E030898644&steamid=76561198069115891', {
        method: 'GET',
        mode: 'no-cors',
        responseType: 'json'
    }).then(response => {
        return response.json();
    }).then(response => {
        console.log(response);
    });
};



/^(interactive|complete)$/.test(document.readyState) ? init() : window.addEventListener('load', init);
