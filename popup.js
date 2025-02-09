document.addEventListener("DOMContentLoaded", () => {
    const trackButton = document.getElementById("track");
    const tokenInput = document.getElementById("token");
    const currencySelect = document.getElementById("currency");
    const priceDisplay = document.getElementById("price");

    chrome.storage.local.get(["selectedToken", "selectedCurrency", "selectedPrice"], (data) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving data from storage:", chrome.runtime.lastError);
            return;
        }

        if (data.selectedToken) tokenInput.value = data.selectedToken;
        if (data.selectedCurrency) currencySelect.value = data.selectedCurrency;
        if (data.selectedPrice) priceDisplay.innerText = data.selectedPrice;
    });

    function fetchPrice() {
        const currentToken = tokenInput.value.trim().toUpperCase();
        const currentCurrency = currencySelect.value;

        if (!currentToken) {
            priceDisplay.innerText = "Please enter a valid token symbol.";
            return;
        }

        chrome.storage.local.set({ selectedToken: currentToken, selectedCurrency: currentCurrency });

        chrome.runtime.sendMessage(
            { action: "fetchPrice", token: currentToken, currency: currentCurrency }, 
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError);
                    return;
                }

                if (response && response.price) {
                    console.log("Updated price:", response.price);

                    const formattedPrice = `Price: ${currentCurrency === "USD" ? "$" : "£"}${response.price}`;
                    chrome.storage.local.set({ selectedPrice: formattedPrice });
                    priceDisplay.innerText = formattedPrice;
                } 
                else {
                    console.warn("No valid response received");
                }
            }
        );
    }

    trackButton.addEventListener("click", fetchPrice);

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.selectedPrice) {
            priceDisplay.innerText = changes.selectedPrice.newValue;
        }
    });
});
