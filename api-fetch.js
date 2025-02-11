import { KEY } from './secrets.js';
const API_KEY = KEY;

export async function fetchTokenPrice(symbol, currency) {
    try {
        const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}&convert=${currency}`;
        const response = await fetch(url, { headers: { "X-CMC_PRO_API_KEY": API_KEY } });
        
        if (!response.ok){
            console.log("Parsed API response:", data);
            console.error(`API request failed: ${response.status} - ${response.statusText}`);
            return null;
        }
        
        const data = await response.json();
        
        if (!data.data || !data.data[symbol] || !data.data[symbol].quote || !data.data[symbol].quote[currency]) {
            console.error("Invalid price API response format:", data);
            return null;
        }
        
        const price = data.data[symbol].quote[currency].price.toFixed(2);
        console.log(`Price of ${symbol} in ${currency}: ${currency === "USD" ? "$" : "£"}${price}`);
        
        return price;
    } 
    catch (error) {
        console.error("Error fetching token price:", error);
        return null;
    }
}

export async function fetchTokenLogo(symbol) {
    try {
        const url =`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${symbol}`;
        const response = await fetch(url, { headers: { "X-CMC_PRO_API_KEY": API_KEY } });
        
        if (!response.ok) {
            console.log("Parsed API response:", data);
            console.error(`API request failed: ${response.status} - ${response.statusText}`);
            return null;
        }
        
        const data = await response.json();

        if (!data.data || !data.data[symbol] || !data.data[symbol].logo) {
            console.error("Invalid logo API response format:", data);
            return null;
        }

        return data.data[symbol]?.logo || null;
    } 
    catch (error) {
        console.error("Error fetching token logo", error);
        return null;
    }
}
