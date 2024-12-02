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
        countries = data.sort((a, b) => a.name.common.localeCompare(b.name.common)) // alfabetisch ordenen
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

    // If the selected continent is empty, show all countries
    filteredCountries = continentSelector.value === ""
        ? filteredCountries // No filter, show all countries
        : filteredCountries.filter(country => country.continents.includes(continentSelector.value)); // Filter by selected continent

    return filteredCountries;
}

function setCountries(list) {
    const countryListEl = document.getElementById('showimg');
    let htmlContent = "";

    // Pre-build all HTML content in one loop
    list.forEach(land => {
        htmlContent += `
        <div class="col">
            <div class="card h-100">
                <img src="${land.flags.png}" class="card-img-top img-fluid" alt="${land.name.common}">
                <div class="card-body">
                    <h5 class="card-title">${land.name.common}</h5>
                    <p class="card-text">Region: ${land.subregion}</p>
                    <p class="card-text">Population: ${land.population}</p>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal" data-index="${list.indexOf(land)}">
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
            const modal = document.getElementById('exampleModal');
            const languages = Object.values(land.languages ?? {}).join(", ") || "No languages available";
            const currencyArray = Object.values(land.currencies ?? {}).map(c => c.name).join(", ") || "No currencies available";

            modal.querySelector('.modal-title').textContent = `Details of ${land.name.common}`;
            modal.querySelector('.modal-body').innerHTML = `
            <p>Information about <strong>${land.name.common}</strong> will go here.</p>
            <p>Capital: ${land.capital}</p>
            <p>Languages: ${languages}</p>
            <p>Currencies: ${currencyArray}</p>
            <p>Population: ${land.population}</p>
            <img src="${land.flags.png}" alt="Flag of ${land.name.common}">`;
        });
    });
}
