document.getElementById('fillBtn').addEventListener('click', () => {
    const inputText = document.getElementById('formText').value;
    const data = parseFormText(inputText);

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([tab]) => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: fillFormOnPage,
            args: [data],
        });
    });
});

function parseFormText(text) {
    const result = {};
    const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

    lines.forEach((line) => {
        const [label, ...rest] = line.split(':');
        const key = label.trim().toLowerCase().replace(/\s+/g, '_');
        const value = rest.join(':').trim();
        result[key] = value;
    });

    // Map specific fields for pet information
    result.country = 'United States';

    mapGender(result);
    parseAge(result);

    return result;
}

function mapGender(result) {
    if (!result.sex) {
        result.gender_id = '8'; // Unknown
        return;
    }

    const isNeutered = result.spayed_neutered === 'Yes';

    if (result.sex === 'Male') {
        result.gender_id = isNeutered ? '1' : '2'; // Neutered Male : Male
    } else if (result.sex === 'Female') {
        result.gender_id = isNeutered ? '4' : '5'; // Spayed Female : Female
    } else {
        result.gender_id = '8'; // Unknown
    }
}

function parseAge(result) {
    if (!result.age) return;

    let years = 0,
        months = 0,
        days = 0;

    const yearMatch = result.age.match(/(\d+)\s*year/);
    if (yearMatch) years = parseInt(yearMatch[1]);

    const monthMatch = result.age.match(/(\d+)\s*month/);
    if (monthMatch) months = parseInt(monthMatch[1]);

    const dayMatch = result.age.match(/(\d+)\s*day/);
    if (dayMatch) days = parseInt(dayMatch[1]);

    result.age_y = years.toString();
    result.age_m = months.toString();
    result.age_d = days.toString();
}

function fillFormOnPage(data) {
    // Define dispatchInputEvent within the function so it's available in the page context
    function dispatchInputEvent(element, value) {
        if (element) {
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    console.log('Filling form with data:', data);
    console.log('Current document:', document);

    // New Client Information Section
    const firstNameInput = document.getElementById('txtFirstname');
    const lastNameInput = document.getElementById('txtLastname');
    const emailInput = document.getElementById('txtEmail');
    const addressInput = document.getElementById('address');
    const cityInput = document.getElementById('txtCity');
    const stateInput = document.getElementById('txtState');
    const zipCodeInput = document.getElementById('txtPostcode');
    const countryInput = document.getElementById('txtCountry');
    const mobileNumberInput = document.getElementById('txtTelephone3');
    const secondaryFirstNameInput = document.getElementById(
        'secondary_first_name'
    );
    const secondaryLastNameInput = document.getElementById(
        'secondary_last_name'
    );
    const secondaryPhoneInput = document.getElementById('secondary_telephone1');
    dispatchInputEvent(firstNameInput, data.first_name);
    dispatchInputEvent(lastNameInput, data.last_name);
    dispatchInputEvent(emailInput, data.email);
    dispatchInputEvent(addressInput, data.address);
    dispatchInputEvent(cityInput, data.city);
    dispatchInputEvent(stateInput, data.state);
    dispatchInputEvent(zipCodeInput, data.zip_code);
    dispatchInputEvent(countryInput, data.country);
    dispatchInputEvent(mobileNumberInput, data.phone);
    dispatchInputEvent(secondaryFirstNameInput, data.secondary_first_name);
    dispatchInputEvent(secondaryLastNameInput, data.secondary_last_name);
    dispatchInputEvent(secondaryPhoneInput, data.secondary_phone);

    // Update the old client info
    const oldCityInput = document.getElementsByName('city')[0];
    const oldStateInput = document.getElementsByName('state')[0];
    const oldZipCodeInput = document.getElementsByName('postcode')[0];
    const oldCountryInput = document.getElementsByName('country')[0];
    const oldMobileNumberInput = document.getElementById('telephone3');
    const oldEmailInput = document.getElementById('client_email');
    dispatchInputEvent(oldCityInput, data.city);
    dispatchInputEvent(oldStateInput, data.state);
    dispatchInputEvent(oldZipCodeInput, data.zip_code);
    dispatchInputEvent(oldCountryInput, data.country);
    dispatchInputEvent(oldMobileNumberInput, data.phone);
    dispatchInputEvent(oldEmailInput, data.email);

    // New Pet Information Section
    const petNameInput = document.getElementsByName('patient_name')[0];
    const microchipInput = document.getElementById('microchip');
    const colorInput = document.getElementById('tagsColour');
    const sexInput = document.getElementsByName('gender_id')[0];
    const yearInput = document.getElementsByName('age_y')[0];
    const monthInput = document.getElementsByName('age_m')[0];
    const dayInput = document.getElementsByName('age_d')[0];
    dispatchInputEvent(petNameInput, data.name);
    dispatchInputEvent(microchipInput, data.microchip);
    dispatchInputEvent(colorInput, data.color);
    dispatchInputEvent(sexInput, data.gender_id);
    dispatchInputEvent(yearInput, data.age_y);
    dispatchInputEvent(monthInput, data.age_m);
    dispatchInputEvent(dayInput, data.age_d);

    // Handle the input for Species
    const speciesSelect = document.querySelector('#speciesId');
    if (speciesSelect) {
        const select2Container = document.querySelector(
            '.select2-container--neo'
        );
        if (select2Container) {
            const select2Selection =
                select2Container.querySelector('.select2-selection');
            if (select2Selection) {
                // Mouse event
                const mouseDown = new MouseEvent('mousedown', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                select2Selection.dispatchEvent(mouseDown);

                //If needed, we can try to select an option programmatically
                setTimeout(() => {
                    // Try to find and click the desired option in the dropdown based on text content
                    const speciesText = data.species || 'Other Large'; // Default to Canine if not specified

                    // Get all options in the dropdown
                    const optionsList = document.querySelectorAll(
                        '#select2-speciesId-results .select2-results__option'
                    );

                    // Find the option with matching text and click it
                    optionsList.forEach((option) => {
                        if (option.textContent === speciesText) {
                            const mouseDown = new MouseEvent('mousedown', {
                                bubbles: true,
                                cancelable: true,
                                view: window,
                            });
                            const mouseUp = new MouseEvent('mouseup', {
                                bubbles: true,
                                cancelable: true,
                                view: window,
                            });

                            // make sure that option is both visible and active
                            option.focus();

                            // simulate user pressing down then releasing
                            option.dispatchEvent(mouseDown);
                            option.dispatchEvent(mouseUp);

                            // finally trigger the high‑level click
                            option.click();
                        }
                    });
                }, 500);
            }
        }
    }

    // After handling species, add a delay before handling breed
    // Check if species has been selected before trying to handle breed
    const waitForBreedEnabled = () => {
        const breedSelect = document.getElementById('breedId');

        if (breedSelect) {
            if (!breedSelect.disabled) {
                handleBreedSelection();
            } else {
                setTimeout(waitForBreedEnabled, 500); // Check again in 500ms
            }
        }
    };

    // Set up a polling function to wait for species to be selected
    setTimeout(waitForBreedEnabled, 0); // Initial delay before first check

    // Function to handle the breed selection once it's enabled
    function handleBreedSelection() {
        const breedSelect = document.getElementById('breedId');
        if (!breedSelect) return;

        const mouseDown = new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true,
        });
        const mouseUp = new MouseEvent('mouseup', {
            view: window,
            bubbles: true,
            cancelable: true,
        });

        // Find the breed container
        const breedContainer = findBreedContainer();
        if (!breedContainer) {
            console.log('Could not find breed container');
            return;
        }

        // Open the dropdown
        openBreedDropdown(breedContainer);

        // Helper function to find breed container
        function findBreedContainer() {
            const containers = document.querySelectorAll('.select2-container');
            for (let container of containers) {
                if (
                    container.previousElementSibling &&
                    container.previousElementSibling.id === 'breedId'
                ) {
                    return container;
                }
            }
            return null;
        }

        // Helper function to open the dropdown
        function openBreedDropdown(container) {
            const selection = container.querySelector('.select2-selection');
            if (!selection) return;

            selection.dispatchEvent(mouseDown);

            const searchField = document.querySelector(
                '.select2-search__field'
            );
            if (!searchField) {
                console.log('Could not find search field');
                return;
            }

            // Set search value and initiate search
            searchField.value = data.breed || '';
            searchField.dispatchEvent(new Event('input', { bubbles: true }));
            setTimeout(waitForSearchResults, 500);
        }

        // Helper function to check if an option is valid
        function isValidBreedOption(option) {
            const text = option.textContent.trim();
            return (
                text !== '' &&
                !text.includes('Searching') &&
                !text.includes('No results') &&
                !text.includes('Type to search')
            );
        }

        // Helper function to select a breed option
        function selectBreedOption(option) {
            option.focus();
            option.dispatchEvent(mouseDown);
            option.dispatchEvent(mouseUp);
            option.click();
            console.log('Selected breed:', option.textContent);
        }

        // Helper function to wait for search results
        function waitForSearchResults() {
            const optionsList = document.querySelectorAll(
                '#select2-breedId-results .select2-results__option'
            );

            // Check if still searching or not ready
            const isSearching = Array.from(optionsList).some(
                (option) =>
                    option.textContent.includes('Searching') ||
                    option.classList.contains('loading-results')
            );

            const isNotReady =
                optionsList.length === 1 &&
                (optionsList[0].textContent.trim() === '' ||
                    optionsList[0].textContent.includes('No results') ||
                    optionsList[0].textContent.includes('Type to search'));

            if (isSearching || isNotReady) {
                setTimeout(waitForSearchResults, 200);
                return;
            }

            // Results are ready, find and select an option
            console.log(
                'Search results loaded!',
                optionsList.length,
                'options'
            );
            if (optionsList.length === 0) return;

            // Find first valid option using for-of loop
            for (const option of optionsList) {
                if (isValidBreedOption(option)) {
                    selectBreedOption(option);
                    return;
                }
            }

            console.log('No valid breed options found');
        }
    }
}
