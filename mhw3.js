/* Codice per Api Accuweather */

const apikey = 'ZvnrBIWkpaAFTzkQ4TTFLr9BycpPvlGX';

const base_toGetForecast = 'http://dataservice.accuweather.com/forecasts/v1/daily/1day/';
const base_toGetKey = 'http://dataservice.accuweather.com/locations/v1/cities/search';
const base_images='https://www.accuweather.com/images/weathericons/';

function onResponse(response){
    return response.json();
}

function onJson_cityKey(json) { 
    let city_key;
    for(let e of json) {
        if(e.AdministrativeArea.LocalizedName === 'Sicily') {
            city_key = e.Key;
            break;
        }
    }
   
    fetch(base_toGetForecast + city_key + '?apikey=' + apikey + '&language=it-it&metric=true').then(onResponse).then(onJson_forecasts);
}

function onJson_forecasts(json) {
    console.log(json);
    let day = json.DailyForecasts[0].Day;
    let night = json.DailyForecasts[0].Night;

    const div = document.querySelector('#weather .container');
    div.querySelector('.day img').src = base_images + day.Icon + '.svg';
    div.querySelector('.day .phrase').textContent = day.IconPhrase;   
    div.querySelector('.night img').src = base_images + night.Icon + '.svg';
    div.querySelector('.night .phrase').textContent = night.IconPhrase;
    div.querySelector('.day .temp').textContent = 'Max: ' + json.DailyForecasts[0].Temperature.Maximum.Value + 'C°';
    div.querySelector('.night .temp').textContent = 'Min: ' + json.DailyForecasts[0].Temperature.Minimum.Value + 'C°';;
    div.classList.remove('hidden');
}

function onSelection(event) {
    fetch(base_toGetKey + '?apikey=' + apikey + '&q=' + city_select.value).then(onResponse).then(onJson_cityKey);
}

const city_select = document.querySelector('#weather .selection');
city_select.addEventListener('change', onSelection);



/* Codice per Api Amadeus */

iataCodes = {
    bari: 'BRI',
    bologna: 'BLQ',
    catania: 'CTA',
    firenze: 'FLR',
    genova: 'GOA',
    milano: 'MXP',
    napoli: 'NAP',
    roma: 'FCO',
    torino: 'TRN',   
    venezia: 'VCE'
}
/* Utilizzerò questa mappa, poiché purtroppo la versione limitata delle API
    non fornisce i codici IATA degli aeroporti italiani.
    
    Avrei dovuto invece, tramite l'utilizzo di un'altra richiesta API, ottenere 
    i codici IATA in base alle città di appartenenza o al nome degli aeroporti.*/

const token_url = 'https://test.api.amadeus.com/v1/security/oauth2/token';
const search_url = 'https://test.api.amadeus.com/v2/shopping/flight-offers';
const client_id = 'vzAVSyNesPXwVoTPoEGU63bFBwhAgJkv';
const client_secret = 'ewIDKRUwlhAK4DjZ';

let token_data;
function getToken(event) {
    fetch(token_url, {
        method: 'post',
        body: 'grant_type=client_credentials&client_id='+ client_id +'&client_secret='+ client_secret,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(onResponse).then(function onTokenJson(json){
        token_data = json;
    });
    event.currentTarget.removeEventListener('click', getToken);


    var today = new Date();
    var todayDate = today.getFullYear() + '-' + (today.getMonth()+1).toString().padStart(2, '0') + '-' + (today.getDate()).toString().padStart(2, '0');
    document.querySelector('form .date input').value = todayDate; 
    document.querySelector('#flight .container').classList.remove('hidden');
}

function onSearchFlights(event) {
    event.preventDefault();

    var selection = document.querySelector('#flight .selection').value;
    var originIATA = encodeURIComponent(iataCodes[selection.toString().toLowerCase()]);
    var departureDate = encodeURIComponent(document.querySelector('#flight .date input').value);
    var adults_num = encodeURIComponent(document.querySelector('#flight .adults_number input').value);


    fetch(search_url + '?originLocationCode=' + originIATA + '&destinationLocationCode=CTA&departureDate=' + departureDate + '&adults=' + adults_num + '&nonStop=true&max=5', 
    {
        headers: {
            'Authorization': token_data.token_type + ' ' + token_data.access_token,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(onResponse).then(onJson_flights);
}

function onJson_flights(json) {
    console.log(json);
 
    const total_res = document.querySelector('#flight .results');
    total_res.innerHTML = '';

    if( json.data.length == 0) {
        console.log('No Flights Found.');
        const span = document.createElement('span');
        span.textContent = 'Siamo spiacenti, non abbiamo trovato alcun volo diretto per questa data.';
        total_res.appendChild(span);
    }
    else {
        for(let i = 0; i < json.data.length; i++) {
            let arrival_time = json.data[i].itineraries[0].segments[0].arrival.at.slice(11,16); /* slice mi permette di prendere solo una porzione di stringa */
            let departure_time = json.data[i].itineraries[0].segments[0].departure.at.slice(11,16);
            let price = json.data[i].price.total + ' ' + json.data[i].price.currency;
            let flight_code = json.data[i].itineraries[0].segments[0].carrierCode + ' ' + json.data[i].itineraries[0].segments[0].number;
            let carrierName = json.dictionaries.carriers[ json.data[i].itineraries[0].segments[0].carrierCode ];

            const div_flight_res = document.createElement('div');
            div_flight_res.classList.add('flight_res');
            
            const span1 = document.createElement('span');
            span1.textContent='Soluzione ' + (i+1);
            div_flight_res.appendChild(span1);

            const div_dep_arr = document.createElement('div');
            div_dep_arr.classList.add('dep_arr');

            const div1 = document.createElement('div');
            const h5_1 = document.createElement('h5');
            h5_1.textContent = 'Partenza';
            div1.appendChild(h5_1);
            const h5_1_time = document.createElement('h5');
            h5_1_time.classList.add('time');
            h5_1_time.textContent = departure_time;
            div1.appendChild(h5_1_time);
            div_dep_arr.appendChild(div1);

            const div_flight_code = document.createElement('div');
            div_flight_code.classList.add('flight_code');
            const s1 = document.createElement('span');
            s1.textContent = carrierName;
            div_flight_code.appendChild(s1);
            const s2 = document.createElement('span');
            s2.textContent = flight_code;
            div_flight_code.appendChild(s2);
            div_dep_arr.appendChild(div_flight_code);


            const div2 = document.createElement('div');
            const h5_2 = document.createElement('h5');
            h5_2.textContent = 'Arrivo';
            div2.appendChild(h5_2);
            const h5_2_time = document.createElement('h5');
            h5_2_time.classList.add('time');
            h5_2_time.textContent = arrival_time;
            div2.appendChild(h5_2_time);
            div_dep_arr.appendChild(div2);

            div_flight_res.appendChild(div_dep_arr);

            const span2 = document.createElement('span');
            span2.classList.add('price');
            span2.textContent = price;
            div_flight_res.appendChild(span2);
 
            total_res.appendChild(div_flight_res);

        }
    }   
}

document.querySelector('#flight em').addEventListener('click', getToken);
document.querySelector('#flight form').addEventListener('submit', onSearchFlights);

/* Provare per esempio:
    Genova 15-05-2022
    Roma 07-05-2022
    Bologna 25-05-2022 
    Firenze 06-05-2022
    
    Per altre prove, Roma ha più tratte rispetto agli altri aeroporti*/



