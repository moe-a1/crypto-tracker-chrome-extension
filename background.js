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

        const formattedPrice = formatPriceForBadge(price);
        chrome.action.setBadgeText({ text: formattedPrice });
        chrome.action.setBadgeBackgroundColor({ color: "#000" });
        
        const formattedLastUpdatedPrice = `Last Updated Price: ${currency === "USD" ? "$" : "£"}${price}`;
        chrome.storage.local.set({ selectedPrice: formattedLastUpdatedPrice });

        // update logo code:
        const logoUrl = await fetchTokenLogo(token);
        if (logoUrl) updateExtensionIcon(logoUrl);
        
        return price;
    } 
    catch (error) {
        console.error("Error fetching token price:", error);
        return null;
    }
}

async function fetchTokenLogo(token) {
    console.log(`Fetching logo for token: ${token}`);

    try {
        const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${token}`;
        const response = await fetch(url, {
            headers: { "X-CMC_PRO_API_KEY": API_KEY }
        });

        if (!response.ok) {
            console.error(`Logo API request failed: ${response.status} - ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        
        if (!data.data || !data.data[token] || !data.data[token].logo) {
            console.error("Invalid logo response format:", data);
            return null;
        }

        return data.data[token].logo;
    } 
    catch (error) {
        console.error("Error fetching token logo:", error);
        return null;
    }
}

function updateExtensionIcon(logoUrl) {
    console.log("Updating extension icon:", logoUrl);

    fetch(logoUrl)
        .then(response => response.blob())
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result;
                chrome.action.setIcon({ path: base64Image });
            };
            reader.readAsDataURL(blob);
        })
        .catch(error => console.error("Error updating icon:", error));
}

function formatPriceForBadge(price) {
    price = parseFloat(price);

    if (price < 0.01) return price.toExponential(0);
    else if (price < 10) return price.toString();
    else if (price < 100) return price.toFixed(2);
    else if (price < 1000) return price.toFixed(1);
    else if (price < 10000) return (price / 1000).toFixed(2) + "K";
    else if (price < 100000) return (price / 1000).toFixed(1) + "K";
    else if (price < 1000000) return (price / 1000).toFixed(0) + "K";
    else if (price >= 1000000) return (price / 1000000).toFixed(2) + "M";
    
    return price.toString();
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
