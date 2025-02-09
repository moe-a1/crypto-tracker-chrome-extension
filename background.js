console.log("background.js loaded");

const API_KEY = "XXX";
let lastTrackedToken = null;
let lastTrackedCurrency = "USD";

chrome.storage.local.get(["selectedToken", "selectedCurrency"], (data) => {
    if (data.selectedToken) lastTrackedToken = data.selectedToken;
    if (data.selectedCurrency) lastTrackedCurrency = data.selectedCurrency;
});

async function fetchTokenPrice(token, currency) {
    console.log(`Fetching ${currency} price for token: ${token}`);

    try {
        const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${token}&convert=${currency}`;
        console.log("GET URL:", url);

        const response = await fetch(url, {
            headers: { "X-CMC_PRO_API_KEY": API_KEY }
        });

        if (!response.ok) {
            console.error(`API request failed: ${response.status} - ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        console.log("Parsed API response:", data);

        if (!data.data || !data.data[token] || !data.data[token].quote || !data.data[token].quote[currency]) {
            console.error("Invalid API response format:", data);
            return null;
        }

        const price = data.data[token].quote[currency].price.toFixed(2);
        console.log(`Price of ${token} in ${currency}: ${currency === "USD" ? "$" : "£"}${price}`);

        chrome.action.setBadgeText({ text: `${currency === "USD" ? "$" : "£"}${Math.round(price)}` });
        chrome.action.setBadgeBackgroundColor({ color: "#000" });
        
        const formattedLastUpdatedPrice = `Last Updated Price: ${currency === "USD" ? "$" : "£"}${price}`;
        chrome.storage.local.set({ selectedPrice: formattedLastUpdatedPrice });
        
        return price;
    } 
    catch (error) {
        console.error("Error fetching token price:", error);
        return null;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message in background:", message);

    if (message.action === "fetchPrice") {
        lastTrackedToken = message.token;
        lastTrackedCurrency = message.currency;
        
        fetchTokenPrice(message.token, message.currency)
        .then(price => { sendResponse({ price }); })
        .catch(err => {
            console.error("Error in fetchTokenPrice:", err);
            sendResponse(null);
        });

        return true;
    }
});

chrome.alarms.create("refreshPrice", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "refreshPrice" && lastTrackedToken) {
        console.log("Refreshing price via alarms...");
        fetchTokenPrice(lastTrackedToken, lastTrackedCurrency);
    }
});
