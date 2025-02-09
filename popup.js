document.addEventListener("DOMContentLoaded", () => {
    const trackButton = document.getElementById("track");
    const tokenInput = document.getElementById("token");
    const currencySelect = document.getElementById("currency");
    const priceDisplay = document.getElementById("price");

    const storedToken = localStorage.getItem("selectedToken");
    const storedCurrency = localStorage.getItem("selectedCurrency");
    const storedPrice = localStorage.getItem("selectedPrice");
    if (storedToken) tokenInput.value = storedToken;
    if (storedCurrency) currencySelect.value = storedCurrency;
    if (storedPrice) priceDisplay.innerText = storedPrice;

    let currentToken = storedToken || "";
    let currentCurrency = storedCurrency || "USD";
    let refreshInterval = null;

    function fetchPrice() {
        if (!currentToken) return;

        chrome.runtime.sendMessage(
            { action: "fetchPrice", token: currentToken, currency: currentCurrency }, 
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError);
                    return;
                }

                if (response && response.price) {
                    console.log("Updated price:", response.price);
                    priceDisplay.innerText = `Price: ${currentCurrency === "USD" ? "$" : "£"}${response.price}`;
                    localStorage.setItem("selectedPrice", `Last Updated Price: ${currentCurrency === "USD" ? "$" : "£"}${response.price}`);
                } else {
                    console.warn("No valid response received");
                }
            }
        );
    }

    trackButton.addEventListener("click", () => {
        currentToken = tokenInput.value.trim().toUpperCase();
        currentCurrency = currencySelect.value;
        console.log("Tracking token:", currentToken, "in", currentCurrency);

        localStorage.setItem("selectedToken", currentToken);
        localStorage.setItem("selectedCurrency", currentCurrency);

        if (!currentToken) {
            priceDisplay.innerText = "Please enter a valid token symbol.";
            return;
        }

        fetchPrice();

        // Prevent multiple intervals
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        refreshInterval = setInterval(fetchPrice, 60000);
    });
});
