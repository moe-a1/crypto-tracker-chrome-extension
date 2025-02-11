import { Token, TokenManager } from "./token-classes.js";
import { updateBadge, startAlarmTracking } from "./utils.js";
import { fetchTokenPrice, fetchTokenLogo } from "./api-fetch.js";

const tokenManager = new TokenManager();

tokenManager.load().then(() => {
    startAlarmTracking();
    fetchAllPrices();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message:", message);
    switch (message.action) {
        case "fetchTokenData":
            handleFetchTokenData(new Token(message.token.symbol, message.token.currency))
                .then(updatedToken => sendResponse(updatedToken))
                .catch(error => sendResponse({ ...message.token, error: error.message }));
            return true;

        case "updateTokens":
            tokenManager.tokens = message.tokens.map(t => new Token(t.symbol, t.currency, t.price, t.logo, t.isActive, t.error));
            tokenManager.save();
            startAlarmTracking();
            break;
    }
});

async function handleFetchTokenData(token) {
    try {
        const [price, logo] = await Promise.all([
            fetchTokenPrice(token.symbol, token.currency),
            fetchTokenLogo(token.symbol)
        ]);
        
        token.update(price, logo);

        return token;
    } 
    catch (error) {
        token.setError(error.message);
        return token;
    }
}

async function fetchAllPrices() {
    await Promise.all(tokenManager.tokens.map(async token => {
        try {
            const [price, logo] = await Promise.all([
                fetchTokenPrice(token.symbol, token.currency),
                token.logo ? Promise.resolve(token.logo) : fetchTokenLogo(token.symbol)
            ]);
            token.update(price, logo);
        } catch (error) {
            token.setError(error.message);
        }
    }));
    
    tokenManager.save();
    
    const activeToken = tokenManager.getActive();
    if (activeToken) updateBadge(activeToken);
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "refreshPrices") fetchAllPrices();
});
