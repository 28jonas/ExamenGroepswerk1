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

    // Pre-build all HTML content in one loop
    list.forEach(land => {
        htmlContent += `
        <div class="col">
            <div class="card h-100">
                <img src="${land.flags.png}" class="card-img-top img-fluid" alt="${land.name.common}">
                <div class="card-body">
                    <h5 class="card-title">${land.name.common}</h5>
                    <p class="card-text">Region: ${land.subregion ?? land.region}</p>
                    <p class="card-text">Population: ${land.population}</p>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#countryModal" data-index="${list.indexOf(land)}">
                        Find some more info here
                    </button>
                </div>
            </div>
        </div>`;
    });

    // Insert all the generated HTML at once
    countryListEl.innerHTML = htmlContent;

    // Add event listeners after inserting content
    const buttons = countryListEl.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener("click", (e) => {
            const landIndex = e.target.getAttribute('data-index');
            const land = list[landIndex];
            const modal = document.getElementById('countryModal');
            const languages = Object.values(land.languages ?? {}).join(", ") || "No languages available";
            const currencyArray = Object.values(land.currencies ?? {}).map(c => `${c.name} (${c.symbol})`).join(", ") || "No currencies available";

            modal.querySelector('.modal-title').textContent = `Details of ${land.name.common}`;
            modal.querySelector('.modal-body').innerHTML = `
            <div class="row">
              <div class="col-8">
                <p><strong>Capital: </strong>${land.capital ?? "N/A"}</p>
                <p><strong>Languages: </strong>${languages}</p>
                <p><strong>Currencies: </strong>${currencyArray}</p>
                <p><strong>Population: </strong>${land.population}</p>
              </div>
              <div class="col-4">
                <img class="img-fluid" src="${land.flags.png}" alt="Flag of ${land.name.common}">
              </div>
            </div>
            <div id="map" style="width: 80%; height: 400px;" class="mx-auto rounded-2 mt-3 shadow-sm"></div>
            `;

            const mapEl = modal.querySelector('.modal-body #map')


            // Check if land.capitalInfo.latlng exists and has valid latitude and longitude
            const latlng = land.capitalInfo && Array.isArray(land.capitalInfo.latlng) && land.capitalInfo.latlng.length === 2
                ? land.capitalInfo.latlng
                : false;  // Fallback to false if latlng is invalid


            if (latlng === false)
                return mapEl.classList.add("visually-hidden")
            mapEl.classList.remove("visually-hidden")

            // Create the map with the corrected coordinates
            const map = L.map('map').setView([latlng[0], latlng[1]], 10);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19,}).addTo(map);

            const marker = L.marker([latlng[0], latlng[1]]).addTo(map);
            marker.bindPopup(`<b>Capital city of ${land.name.common}</b><br>${land.capital}`);


            setTimeout(function() {
                map.invalidateSize();
            }, 250);
        });
    });
}