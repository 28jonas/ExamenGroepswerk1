const btn = document.getElementById("btn")
btn.addEventListener("click",function (){
    const continent = document.getElementById("continent").value.trim();

    if(!continent){
        alert("Voer een regio in om te zoeken");
        return;
    }

    const url = `https://restcountries.com/v3.1/region/${continent}`

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
                                    <img src="${land.flags.png}" class="card-img-top img-fluid" alt="${land.name.common}">
                                    <div class="card-body">
                                        <h5 class="card-title">${land.name.common}</h5>
                                        <p class="card-text">Region: ${land.subregion}</p>
                                        <p class="card-text">Population: ${land.population}</p>
                                        <a href="#" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal"  data-country-name="${land.name.common}" data-country-capital="${land.capital}" data-country-languages="${languages}" data-country-currencie="${currencyArray}" data-country-population="${land.population}" data-country-flag="${land.flags.png}">Find some more info here</a>
                                    </div>
								</div>
							</div>
							
							` /*+ ouputHTMlland*/


            });
            /*
            * hoofdstad = console.log(`land.capital`)
            * talen = const languages = land.languages ? Object.values(land.languages).join(", "): 'No languages available';
                console.log(languages)
            * valuta = const currencyArray = Object.values(land.currencies)
                console.log(currencyArray[0].name)
            * populatie = console.log(`${land.population}`)
            * vlag =  ${land.flags.png}
            * */


            document.getElementById("showimg").innerHTML = outputHTML;

        }).catch(error =>{
        console.log("fout bij het ophalen gegevens", error)
    })
});

const modal = document.getElementById('exampleModal');
modal.addEventListener('show.bs.modal', function (event) {
    // Haal de knop op die het modal opent
    const button = event.relatedTarget;

    // Haal de data-attribute op
    const countryName = button.getAttribute('data-country-name');
    const countryCapital = button.getAttribute('data-country-capital');
    const countryLanguages = button.getAttribute('data-country-languages')
    const countryCurrencies = button.getAttribute('data-country-currencie')
    const countryPopulation = button.getAttribute('data-country-population')
    const countryFlag = button.getAttribute('data-country-flag')

    // Vul de modal met de landinformatie
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');

    modalTitle.textContent = `Details of ${countryName}`;
    modalBody.innerHTML =
        `
		<p>Information about <strong>${countryName}</strong> will go here.</p>
		<p>Capital: ${countryCapital}</p>
		<p>Languages: ${countryLanguages}</p>
		<p>Currencies: ${countryCurrencies}</p>
		<p>Population: ${countryPopulation}</p>
		<img src="${countryFlag}" alt="${countryName}">
				`;
});