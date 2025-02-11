import { Token, TokenManager } from "./token-classes.js";
import { updateBadge } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const addButton = document.getElementById("addToken");
    const tokenInput = document.getElementById("token");
    const currencySelect = document.getElementById("currency");
    const tokenList = document.getElementById("tokenList");

    const tokenManager = await new TokenManager().load();
    renderTokens();

    addButton.addEventListener("click", async () => {
        const symbol = tokenInput.value.trim().toUpperCase();
        const currency = currencySelect.value;
        
        if (!symbol) return;

        if (tokenManager.addToken(new Token(symbol, currency))) {
            chrome.runtime.sendMessage({ action: "updateTokens", tokens: tokenManager.tokens });
            renderTokens();

            try {
                const updatedToken = await chrome.runtime.sendMessage({ action: "fetchTokenData", token: new Token(symbol, currency) });                
                Object.assign(tokenManager.tokens.find(t => t.matches(symbol, currency)), updatedToken);
                tokenManager.save();
                renderTokens();
            } 
            catch (error) {
                tokenManager.tokens.find(t => t.matches(symbol, currency)).setError(error.message || 'Failed to fetch data');
                tokenManager.save();
                renderTokens();
            }
        }
        tokenInput.value = "";
    });

    function renderTokens() {
        tokenList.innerHTML = "";
        tokenManager.tokens.forEach((token, index) => {
            const tokenCard = document.createElement("div");
            tokenCard.className = "token-card";

            tokenCard.innerHTML = `
                <img src="${token.logo || 'icons/loading.svg'}" class="token-logo">
                <div class="token-info">
                    <span class="token-symbol">${token.symbol}</span>
                    <span class="token-currency">${token.currency}</span>
                    <span class="token-price">${token.formattedPrice()}</span>
                </div>
                <button class="btn-icon set-active" data-index="${index}">
                    <img src="${token.getStarIcon()}" class="${token.isActive ? 'active-star' : ''}">
                </button>
                <button class="btn-icon delete-token" data-index="${index}">
                    <img src="icons/trash.svg">
                </button>
            `;

            tokenList.appendChild(tokenCard);
        });

        document.querySelectorAll('.set-active').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('button').dataset.index);
                tokenManager.setActiveForThisTokenOnly(tokenManager.tokens[index]);
                updateBadge(tokenManager.tokens[index]);
                renderTokens();
            });
        });

        document.querySelectorAll('.delete-token').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('button').dataset.index);
                tokenManager.deleteToken(tokenManager.tokens[index]);
                renderTokens();
            });
        });
    }

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.tokens) tokenManager.load().then(renderTokens);
    });
});
