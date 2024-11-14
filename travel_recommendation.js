let searchInput = document.querySelector(".search-bar");
let searchBtn = document.querySelector(".search-btn");
let resetBtn = document.querySelector(".reset-btn");
let container = document.getElementById("results-container");
let resultSection = document.querySelector(".results");



searchBtn.addEventListener("click", function () {
    let searchValue = searchInput.value.toLowerCase().trim();
    getData("./travel_recommendation.json", searchValue);
});

resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    container.innerHTML = "";
    resultSection.style.display = "none";
});

async function getData(apiUrl, userInput) {
    try {
        // Fetch data from the API
        let apiResponse = await fetch(apiUrl);
        let data = await apiResponse.json();

        // Perform the search based on the user input
        const results = searchInAllCategories(data, userInput);

        console.log(results); // Log the results to the console for debugging

        // Render results to the page
        renderResults(results);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function searchInAllCategories(data, input) {

    // Normalize the input to be case-insensitive
    const normalizedInput = input.toLowerCase();

    if (normalizedInput.includes("temple") || normalizedInput.includes("temples")) {
        return { temples: data.temples };
    }
    if (normalizedInput.includes("country") || normalizedInput.includes("countries")) {
        return { countries: data.countries };
    }
    if (normalizedInput.includes("beach") || normalizedInput.includes("beaches")) {
        return { beaches: data.beaches };
    }

    const country = data.countries.filter(country => country.name.toLowerCase() === normalizedInput);
    if (country.length > 0) return { country }

    // Search for a match in cities
    const city = data.countries.flatMap(country => country.cities).filter(city => city.name.toLowerCase().includes(normalizedInput));
    if (city.length > 0) return { city }

    // Search for a match in temples
    const temple = data.temples.filter(temple => temple.name.toLowerCase().includes(normalizedInput));
    if (temple.length > 0) return { temple }

    // Search for a match in beaches
    const beach = data.beaches.filter(beach => beach.name.toLowerCase().includes(normalizedInput));
    if (beach.length > 0) return { beach }

    return { notFound: "Not found" };
}


function renderResults(results) {

    container.innerHTML = ''; // Clear previous results
    resultSection.style.display = "block";

    // Function to render a list of items
    const renderList = (list) => {
        list.forEach(item => {
            const currentTime = getCurrentTime(item.timeZone);
            container.innerHTML += generateHTML(item.name, item.imageUrl, item.description, currentTime);
        });
    };

    // Check and render each result type
    if (results.temples) renderList(results.temples);
    if (results.beaches) renderList(results.beaches);

    // Render countries and their cities
    if (results.countries) results.countries.forEach(country => renderList(country.cities));


    // Render specific country (single object) and its cities
    if (results.country) renderList(results.country[0].cities);

    // Render cities, beaches, and temples from individual search results
    if (results.city) renderList(results.city);
    if (results.beach) renderList(results.beach);
    if (results.temple) renderList(results.temple);

    if (results.notFound) container.innerHTML += `${results.notFound}`;
}


function generateHTML(name, imageUrl, description, time) {
    return `
        <div class="result-item">
            <img class="result-img" src="${imageUrl}" alt="${name}" />
            <div class="result-item-content">
                <h3>${name} <span>${time}</span></h3>
                <p>${description}</p>
                <button class="result-btn">View</button>
            </div>
        </div>
    `
}

function getCurrentTime(timeZone) {
    const options = {
        timeZone: timeZone,
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };
    return new Date().toLocaleTimeString('en-US', options);
}