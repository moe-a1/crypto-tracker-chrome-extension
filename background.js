import { updateBadge, startAlarmTracking } from './utils.js';
import { fetchTokenPrice, fetchTokenLogo } from './api-fetch.js';

let tokens = [];

chrome.storage.local.get(["tokens"], (data) => {
    tokens = data.tokens || [];
    startAlarmTracking();
    updateAllPricesAndBadge();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "addToken":
            addToken(message.symbol, message.currency).then(sendResponse);
            return true;

        case "setActive":
            setActiveToken(message.index);
            sendResponse(tokens);
            return true;

        case "deleteToken":
            deleteToken(message.index);
            sendResponse(tokens);
            return true;
    }
});

async function addToken(symbol, currency) {
    if (tokens.some(t => t.symbol === symbol && t.currency === currency)) 
        return tokens;

    const newToken = { symbol, currency, price: null, logo: null, isActive: false, error: null };
    tokens.push(newToken);
    saveTokens();

    try {
        const updatedToken = await fetchTokenData(newToken);
        Object.assign(tokens.find(t => t.symbol === symbol && t.currency === currency), updatedToken);
    } catch (error) {
        newToken.error = error.message || "Failed to fetch data";
    }
    
    saveTokens();
    return tokens;
}

async function fetchTokenData(token) {
    try {
        const [price, logo] = await Promise.all([
            fetchTokenPrice(token.symbol, token.currency),
            fetchTokenLogo(token.symbol)
        ]);
        return { ...token, price, logo, error: null };
    } catch (error) {
        return { ...token, price: null, error: error.message };
    }
}

async function updateAllPricesAndBadge() {
    tokens = await Promise.all(tokens.map(async token => {
        try {
            const [price, logo] = await Promise.all([
                fetchTokenPrice(token.symbol, token.currency),
                token.logo || fetchTokenLogo(token.symbol)
            ]);
            return { ...token, price, logo, error: null };
        } catch (error) {
            return { ...token, price: null, error: error.message };
        }
    }));

    saveTokens();

    const activeToken = tokens.find(t => t.isActive);
    if (activeToken) updateBadge(activeToken);
}

function setActiveToken(index) {
    if (!tokens[index].price) return;
    
    tokens.forEach(t => t.isActive = false);
    tokens[index].isActive = true;
    updateBadge(tokens[index]);
    saveTokens();
}

function deleteToken(index) {
    if (tokens[index].isActive) {
        const nextActiveToken = tokens.find(t => t !== tokens[index]);
        if (nextActiveToken) setActiveToken(tokens.indexOf(nextActiveToken));
        else{
            chrome.action.setIcon({ path: "icons/default-38.png" });
            chrome.action.setBadgeText({ text: '' });
        }
    }

    tokens.splice(index, 1);
    saveTokens();
}

function saveTokens() {
    chrome.storage.local.set({ tokens });
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "refreshPrices") updateAllPricesAndBadge();
});
