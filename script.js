const continentSelector = document.getElementById("continentSelector")
const countrySearch = document.getElementById("countrySearch")
const countryListEl = document.getElementById('countryList');

let countries = [];

getData();


countrySearch.addEventListener("input", () => {
    // Verwijder alle niet-letters met een regex, maar sta ook diakritische tekens toe (zoals ë, ç, etc.)
    countrySearch.value = countrySearch.value.replace(/[^a-zA-Z\u00C0-\u017F\s-]/g, ''); // Unicode range for accented characters

    const filteredCountries = applyFilters();
    setCountries(filteredCountries);
});
continentSelector.addEventListener("change", () => {
    const filteredCountries = applyFilters();
    setCountries(filteredCountries);
});


async function getData() {
    try {
        const { data } = await axios.get('https://restcountries.com/v3.1/all');

        countries = data
            .sort((a,b) => a.name.common.localeCompare(b.name.common))   // sort countries alphabetically
            .map(transformCountryData);

        setCountries(countries);
        setContinents([...new Set(data.flatMap(country => country.continents))]);
    } catch (error) {
        console.error('Error fetching countries:', error);
        countryListEl.innerHTML = `
            <div class="alert alert-danger w-50 mx-auto text-center" role="alert">
                Error loading data. Try refreshing the page.
            </div>`;
    }
}

// Helper function to transform country data
function transformCountryData(country) {
    const allNames = collectCountryNames(country);
    const formattedPopulation = country.population ? country.population.toLocaleString('nl-BE') : 'N/A';

    return {
        ...country,
        population: formattedPopulation,
        allNames: new Set(allNames),
    };
}

// Collect all names and translations of a country
function collectCountryNames(country) {
    const nativeNames = country.name.nativeName
        ? Object.values(country.name.nativeName).flatMap(({ official, common }) => [official, common])
        : [];
    const translations = Object.values(country.translations).flatMap(({ official, common }) => [official, common]);

    return [
        country.name.common,
        country.name.official,
        ...nativeNames,
        ...translations,
    ];
}



function setContinents(continents){
    continentSelector.innerHTML=`<option value="" selected>Choose a continent</option>`
    continents.forEach(continent => {
        continentSelector.innerHTML+=`<option value="${continent}">${continent}</option>`
    })
}

function applyFilters() {
    const searchTerm = countrySearch.value.trim().toLowerCase();
    const continentValue = continentSelector.value;

    // Filter countries by continent and search term
    let filteredCountries = countries.filter(country => {
        const isInContinent = continentValue === "" || country.continents.includes(continentValue);
        const isInCommonName = country.name.common.toLowerCase().includes(searchTerm);
        const isInAllNames = [...country.allNames].some(name => name.toLowerCase().includes(searchTerm));

        return isInContinent && (isInCommonName || isInAllNames);
    });

    // Sort the filtered countries: prioritize matches in the common name
    filteredCountries.sort((a, b) => {
        const indexA = a.name.common.toLowerCase().indexOf(searchTerm);
        const indexB = b.name.common.toLowerCase().indexOf(searchTerm);

        // If both names contain the search term, compare their positions
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }

        // If only one contains the search term, prioritize that one
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        // If neither contains the search term, use 'allNames' fallback
        const indexAAllNames = Math.min(...[...a.allNames].map(name => name.toLowerCase().indexOf(searchTerm)).filter(idx => idx !== -1));
        const indexBAllNames = Math.min(...[...b.allNames].map(name => name.toLowerCase().indexOf(searchTerm)).filter(idx => idx !== -1));

        return indexAAllNames - indexBAllNames;
    });

    return filteredCountries;
}

function setCountries(list) {
    if (list.length === 0) {
        countryListEl.innerHTML = '<div class="alert alert-info w-50 mx-auto text-center" role="alert">No countries found. Try a different search.</div>';
        return;
    }
    let htmlContent = "";

    // Pre-build all HTML content in one loop
    list.forEach(land => {
        let matchedName = ""; // Initialize with an empty string

        // Check if a search term exists and land.allNames contains a match
        const searchTerm = countrySearch.value.trim().toLowerCase();
        if (searchTerm !== "" && !land.name.common.toLowerCase().includes(searchTerm))
            matchedName = [...land.allNames].find(name => name.toLowerCase().includes(searchTerm)) || "";

        htmlContent += `
        <div class="col">
            <div class="card h-100 m-1">
                <div class="d-flex align-items-center border-bottom">
                    <!-- Vlagafbeelding met object-fit cover voor behoud van verhoudingen -->
                    <img src="${land.flags.png}" class="card-img-top img-fluid border" alt="Flag of ${land.name.common}" >
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="d-flex flex-column mt-auto ">
                        <h5 class="card-title">${land.name.common}</h5>
                        <h6 class="card-title">${matchedName}</h6>
                        <p class="card-text m-0">Region: ${land.subregion ?? land.region}</p>
                        <p class="card-text">Population: ${land.population}</p>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#countryModal" data-index="${list.indexOf(land)}">
                            Get more info
                        </button>
                    </div>
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
            <div class="row">
                <div class="col-12">
                    <div class="d-none" id="modalLocation"><p><strong>Location: </strong>Location data not available.</p></div>
                    <div id="map" style="width: 90%; height: 400px;" class="mx-auto rounded-2 mt-3 shadow-sm"></div>
                </div>
            </div>
            `;

            const mapEl = modal.querySelector('.modal-body #map')


            // Check if land.capitalInfo.latlng exists and has valid latitude and longitude
            const latlng = land.capitalInfo && Array.isArray(land.capitalInfo.latlng) && land.capitalInfo.latlng.length === 2
                ? land.capitalInfo.latlng
                : false;  // Fallback to false if latlng is invalid


            if (latlng === false){
                mapEl.classList.add("visually-hidden")
                document.getElementById("modalLocation").classList.remove("d-none")
                return;
            }

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