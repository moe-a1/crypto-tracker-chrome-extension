import { formatPriceWithCommas, startAlarmTracking } from './utils.js';

document.addEventListener("DOMContentLoaded", async () => {
    const tokenInput = document.getElementById("token");
    const currencySelect = document.getElementById("currency");
    const addButton = document.getElementById("addToken");
    const errorElement = document.getElementById("errorMessage");
    const tokenList = document.getElementById("tokenList");
    const settingsBtn = document.getElementById("settingsBtn");
    const mainPage = document.getElementById("mainPage");

    let tokens = [];
    
    chrome.storage.local.get(["tokens"], (data) => {
        tokens = data.tokens || [];
        renderTokens();
    });

    const backBtn = document.getElementById("backBtn");
    const settingsPage = document.getElementById("settingsPage");
    const priceRefreshTimeInput = document.getElementById("priceRefreshTime");
    const timeUnitSelect = document.getElementById("timeUnit");

    let priceRefreshTime = 1;
    let timeUnit = "minutes";

    chrome.storage.local.get(["priceRefreshTime", "timeUnit"], (data) => {
        priceRefreshTime = data.priceRefreshTime || 1;
        timeUnit = data.timeUnit || "minutes";
        priceRefreshTimeInput.value = priceRefreshTime;
        timeUnitSelect.value = timeUnit;
    });

    chrome.storage.local.get(["selectedCurrency"], (data) => {
        if (data.selectedCurrency) 
            currencySelect.value = data.selectedCurrency;
    });
    currencySelect.addEventListener("change", () => {
        chrome.storage.local.set({ selectedCurrency: currencySelect.value });
    });

    settingsBtn.addEventListener("click", () => {
        mainPage.style.display = "none";
        settingsPage.style.display = "block";
    });

    backBtn.addEventListener("click", () => {
        settingsPage.style.display = "none";
        mainPage.style.display = "block";

        priceRefreshTime = parseInt(priceRefreshTimeInput.value);
        timeUnit = timeUnitSelect.value;
        chrome.storage.local.set({ priceRefreshTime, timeUnit });
        startAlarmTracking();
    });

    addButton.addEventListener("click", async () => {
        const symbol = tokenInput.value.trim().toUpperCase();
        const currency = currencySelect.value;
        
        if (!symbol){
            showError("Please enter a token symbol.");
            return;
        }

        const result = await sendMessage({ action: "addToken", symbol, currency });
        if (result.isDuplicate) {
            showError(`${symbol} in ${currency} already exists.`);
        } else {
            errorElement.style.display = "none";
            tokens = result.tokens;
            renderTokens();
            tokenInput.value = "";
        }
    });

    function renderTokens() {
        tokenList.innerHTML = "";
        tokens.forEach((token, index) => {
            const tokenCard = document.createElement("div");
            tokenCard.className = "token-card";
    
            const priceDisplay = token.price 
                ? `<span class="token-price">${token.currency === "USD" ? "$" : "£"}${formatPriceWithCommas(token.price)}</span>`
                : `<span class="token-price" style="color:red">Invalid token</span>`;
    
            tokenCard.innerHTML = `
                <img src="${token.logo || 'icons/loading.svg'}" class="token-logo">
                <div class="token-info">
                    <span class="token-symbol">${token.symbol}</span>
                    <span class="token-currency">${token.currency}</span>
                    ${priceDisplay}
                </div>
                <button class="btn-icon set-active" data-index="${index}">
                    <img src="${token.isActive ? 'icons/star-filled.svg' : 'icons/star-empty.svg'}">
                </button>
                <button class="btn-icon delete-token" data-index="${index}">
                    <img src="icons/trash.svg">
                </button>
            `;

            tokenList.appendChild(tokenCard);
        });

        document.querySelectorAll('.set-active').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const index = parseInt(e.target.closest('button').dataset.index);
                tokens = await sendMessage({ action: "setActive", index });
                renderTokens();
            });
        });

        document.querySelectorAll('.delete-token').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const index = parseInt(e.target.closest('button').dataset.index);
                tokens = await sendMessage({ action: "deleteToken", index });
                renderTokens();
            });
        });
    }

    function sendMessage(message) {
        return new Promise(resolve => {
            chrome.runtime.sendMessage(message, resolve);
        });
    }

    function showError(message) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
    }

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.tokens) {
            tokens = changes.tokens.newValue;
            renderTokens();
        }
    });
});
