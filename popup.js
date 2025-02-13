import { formatPriceWithCommas } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const addButton = document.getElementById("addToken");
    const tokenInput = document.getElementById("token");
    const currencySelect = document.getElementById("currency");
    const tokenList = document.getElementById("tokenList");

    let tokens = await getTokens();
    renderTokens();

    addButton.addEventListener("click", async () => {
        const symbol = tokenInput.value.trim().toUpperCase();
        const currency = currencySelect.value;
        
        if (!symbol) return;

        tokens = await sendMessage({ action: "addToken", symbol, currency });
        renderTokens();
        tokenInput.value = "";
    });

    function renderTokens() {
        tokenList.innerHTML = "";
        tokens.forEach((token, index) => {
            const tokenCard = document.createElement("div");
            tokenCard.className = "token-card";

            tokenCard.innerHTML = `
                <img src="${token.logo || 'icons/loading.svg'}" class="token-logo">
                <div class="token-info">
                    <span class="token-symbol">${token.symbol}</span>
                    <span class="token-currency">${token.currency}</span>
                    <span class="token-price">${token.currency === "USD" ? "$" : "£"}${formatPriceWithCommas(token.price)}</span>
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

    async function getTokens() {
        return sendMessage({ action: "getTokens" });
    }

    function sendMessage(message) {
        return new Promise(resolve => {
            chrome.runtime.sendMessage(message, resolve);
        });
    }

    chrome.storage.onChanged.addListener(() => {
        getTokens().then(updatedTokens => {
            tokens = updatedTokens;
            renderTokens();
        });
    });
});
