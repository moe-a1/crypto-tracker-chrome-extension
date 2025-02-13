import { KEY } from './secrets.js';
const API_KEY = KEY;

export async function fetchTokenPrice(symbol, currency) {
    try {
        const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}&convert=${currency}`;
        const response = await fetch(url, { headers: { "X-CMC_PRO_API_KEY": API_KEY } });
        console.log(`API call made for price of ${symbol} in ${currency}`);

        if (!response.ok){
            console.log("Parsed API response:", data);
            console.error(`API request failed: ${response.status} - ${response.statusText}`);
            return null;
        }
        
        const data = await response.json();
        
        const price = data.data[symbol].quote[currency].price.toFixed(2);
        
        return price;
    } 
    catch (error) {
        console.warn("Invalid token requested", error);
        return null;
    }
}

export async function fetchTokenLogo(symbol) {
    try {
        const url =`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${symbol}`;
        const response = await fetch(url, { headers: { "X-CMC_PRO_API_KEY": API_KEY } });
        console.log(`API call made for logo of ${symbol}`);
        
        if (!response.ok) {
            console.log("Parsed API response:", data);
            console.error(`API request failed: ${response.status} - ${response.statusText}`);
            return null;
        }
        
        const data = await response.json();

        return data.data[symbol]?.logo || null;
    } 
    catch (error) {
        console.warn("Invalid token requested", error);
        return null;
    }
}
