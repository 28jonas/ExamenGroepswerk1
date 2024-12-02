const continentSelector = document.getElementById("continentSelector")
const countrySearch = document.getElementById("countrySearch")
let countries = [];

getData();


countrySearch.addEventListener("input", () => {
    const filteredCountries = applyFilters();
    setCountries(filteredCountries);
});
continentSelector.addEventListener("change", () => {
    const filteredCountries = applyFilters();
    setCountries(filteredCountries);
});

async function getData(){
    try {
        const {data} = await axios.get('https://restcountries.com/v3.1/all');
        countries = data
            .sort((a, b) => a.name.common.localeCompare(b.name.common)) // alfabetisch ordenen
            .map(country => ({
                ...country,
                population: country.population ? country.population.toLocaleString("nl-BE") : "N/A" // Format population
            }));
        setCountries(countries)
        setContinents([...new Set(data.flatMap(country => country.continents))])
    } catch (error) {
        console.error('Error fetching countries:', error);
    }
}


function setContinents(continents){
    continentSelector.innerHTML=`<option value="" selected>Choose a continent</option>`
    continents.forEach(continent => {
        continentSelector.innerHTML+=`<option value="${continent}">${continent}</option>`
    })
}

function applyFilters(){

    const searchTerm = countrySearch.value.trim().toLowerCase();

    // Filter countries by name (substring search in a.name.common)
    let filteredCountries = countries.filter(country => country.name.common.toLowerCase().includes(searchTerm));
    // Sort so that countries where the searchTerm is found earlier appear first
    filteredCountries.sort((a, b) => a.name.common.toLowerCase().indexOf(searchTerm) - b.name.common.toLowerCase().indexOf(searchTerm));

    // If the selected continent is empty, show all countries
    filteredCountries = continentSelector.value === ""
        ? filteredCountries // No filter, show all countries
        : filteredCountries.filter(country => country.continents.includes(continentSelector.value)); // Filter by selected continent

    return filteredCountries;
}

function setCountries(list) {
    const countryListEl = document.getElementById('countryList');
    if (list.length === 0) {
        countryListEl.innerHTML = '<div class="alert alert-info w-50 mx-auto text-center" role="alert">No countries found. Try a different search.</div>';
        return;
    }
    let htmlContent = "";

    axios.get(url)
        .then(response =>{
            const landen = response.data;
            console.log(landen)
            let outputHTML = ` `;
            landen.forEach(land => {
                const languages = land.languages ? Object.values(land.languages).join(", "): 'No languages available';

                const currencyArray = land.currencies ? Object.values(land.currencies).map(currency => currency.name).join(", ") : "No currencies available";

                console.log(currencyArray)
                outputHTML +=	`
							<div>
								<div class="card h-100 m-1 ">
								    <div style="height: 300px" class="d-flex align-items-center border-bottom">
                                    <img src="${land.flags.png}" class="card-img-top img-fluid img-thumbnail my-auto" alt="${land.name.common}">
                                    </div>
                                    <div class="card-body">
                                        <h5 class="card-title">${land.name.common}</h5>
                                        <p class="card-text mb-0">Region: ${land.subregion}</p>
                                        <p class="card-text">Population: ${land.population.toLocaleString('nl-NL')}</p>
                                        <div class="d-flex justify-content-center">
                                            <a href="#" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal"  data-country-name="${land.name.common}" data-country-capital="${land.capital}" data-country-languages="${languages}" data-country-currencie="${currencyArray}" data-country-population="${land.population}" data-country-flag="${land.flags.png}">More info over ${land.name.common} </a>
                                        </div>
                                        
                                    </div>
								</div>
							</div>
							
							` /*+ ouputHTMlland*/
                            /*toLocalString is voor het formatteren van de cijfers*/


            const mapEl = modal.querySelector('.modal-body #map')


            // Check if land.capitalInfo.latlng exists and has valid latitude and longitude
            const latlng = land.capitalInfo && Array.isArray(land.capitalInfo.latlng) && land.capitalInfo.latlng.length === 2
                ? land.capitalInfo.latlng
                : [0, 0];  // Fallback to [0, 0] if latlng is invalid

            // Create the map with the corrected coordinates
            const map = L.map('map').setView([latlng[0], latlng[1]], 10);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);

            if (latlng[0] !== 0 && latlng[1] !== 0){
                const marker = L.marker([latlng[0], latlng[1]]).addTo(map);
                marker.bindPopup(`<b>Capital city of ${land.name.common}</b><br>${land.capital}`);
            }

            mapEl.classList.add("visually-hidden")

            setTimeout(function() {
                mapEl.classList.remove("visually-hidden")
                map.invalidateSize();
            }, 250);
        });
    });
}
