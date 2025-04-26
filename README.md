# Crypto Price Tracker Chrome Extension

A Chrome extension that lets you track cryptocurrency prices in real-time directly from your browser.

## Features

- **Track Multiple Cryptocurrencies**: Add and monitor any cryptocurrency available on CoinMarketCap
- **Real-time Price Updates**: Configure automatic price updates at custom intervals
- **Multi-currency Support**: Track prices in USD or GBP
- **Badge Integration**: See the price of your active cryptocurrency directly on the Chrome extension icon
- **Visual Interface**: Clean, dark-themed UI with token logos and formatted prices

## Installation

1. Clone or download this repository

2. Create a `secrets.js` file in the root directory with your CoinMarketCap API key:
   ```js
   export const KEY = 'your_coinmarketcap_api_key';
   ```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the extension directory

## Usage

### Adding Tokens
1. Click on the extension icon to open the popup
2. Enter the token symbol (e.g., BTC, ETH) in the input field
3. Select your preferred currency (USD or GBP)
4. Click "Add Token"

### Setting Active Token
- Click the star icon next to any token to set it as active
- The active token's price will be displayed on the Chrome extension badge

### Removing Tokens
- Click the trash icon next to any token to remove it from your list

### Configuring Settings
1. Click the settings icon (⚙️) in the top-right corner
2. Set your preferred price refresh interval
3. Click the back button to save changes

## Technical Details

### Architecture
- **Background Service Worker**: Manages token data and price updates
- **Popup Interface**: User-friendly UI for managing tracked tokens
- **API Integration**: Fetches real-time data from CoinMarketCap API

### API Usage
This extension uses the CoinMarketCap API to fetch cryptocurrency data. You'll need your own API key from [CoinMarketCap](https://coinmarketcap.com/api/).
