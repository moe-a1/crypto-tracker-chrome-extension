import { formatPriceWithCommas } from './utils.js';

export class Token {
    constructor(symbol, currency, price = null, logo = null, isActive = false, error = null) {
        this.symbol = symbol.toUpperCase();
        this.currency = currency;
        this.price = price;
        this.logo = logo;
        this.isActive = isActive;
        this.error = error;
    }

    update(price, logo) {
        this.price = price;
        this.logo = logo || this.logo;
        this.error = null;
    }

    setError(error) {
        this.error = error;
        this.price = null;
    }

    toJSON() {
        return {
            symbol: this.symbol,
            currency: this.currency,
            price: this.price,
            logo: this.logo,
            isActive: this.isActive,
            error: this.error
        };
    }

    matches(symbol, currency) {
        return this.symbol === symbol.toUpperCase() && 
               this.currency === currency;
    }

    formattedPrice() {
        if (this.error) return `<span class="token-error">${this.error}</span>`;

        if (this.price === null || this.price === undefined) return 'Loading...';

        return `${this.currency === 'USD' ? '$' : '£'}${formatPriceWithCommas(this.price)}`;
    }

    getStarIcon() {
        return this.isActive ? 'icons/star-filled.svg' : 'icons/star-empty.svg';
    }
}

export class TokenManager {
    constructor() {
        this.tokens = [];
    }

    async load() {
        const { tokens } = await chrome.storage.local.get(["tokens"]);
        this.tokens = (tokens || []).map(t => new Token(
            t.symbol,
            t.currency,
            t.price,
            t.logo,
            t.isActive,
            t.error
        ));
        return this;
    }

    async save() {
        await chrome.storage.local.set({
            tokens: this.tokens.map(t => t.toJSON())
        });
        return this;
    }

    addToken(token) {
        if (!this.exists(token.symbol, token.currency)) {
            this.tokens.push(token);
            this.save();
            return true;
        }
        return false;
    }

    exists(symbol, currency) {
        return this.tokens.some(t => t.matches(symbol, currency));
    }

    setActiveForThisTokenOnly(token) {
        this.tokens.forEach(t => {
            t.isActive = t === token;
        });
        this.save();
    }

    getActive() {
        return this.tokens.find(t => t.isActive);
    }

    deleteToken(token) {
        this.tokens = this.tokens.filter(t => !t.matches(token.symbol, token.currency));
        this.save();
    }
}
