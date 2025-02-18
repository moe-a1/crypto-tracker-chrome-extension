// format price functions
export function formatPriceForBadge(price) {
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

export function formatPriceWithCommas(price) {
    return parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// extension badge function
export function updateBadge(token) {
    if (token?.price) {
        const badgeText = formatPriceForBadge(token.price);
        console.log("Updating badge text:", badgeText);
        chrome.action.setBadgeText({ text: badgeText });

        if (token.logo) 
            updateBadgeIcon(token.logo);
    }
}

export function updateBadgeIcon(logoUrl) {
    console.log("Updating badge icon:", logoUrl);

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

export function resetBadge() {
    chrome.action.setIcon({ path: "icons/default-38.png" });
    chrome.action.setBadgeText({ text: '' });
}

// alarm function
export function startAlarmTracking() {
    chrome.storage.local.get(["priceRefreshTime", "timeUnit"], (data) => {
        let priceRefreshTime = data.priceRefreshTime || 1;
        let timeUnit = data.timeUnit || "minutes";
        let periodInMinutes;

        switch (timeUnit) {
            case "seconds":
                periodInMinutes = priceRefreshTime / 60;
                break;
            case "minutes":
                periodInMinutes = priceRefreshTime;
                break;
            case "hours":
                periodInMinutes = priceRefreshTime * 60;
                break;
            default:
                periodInMinutes = 1;
        }
        
        chrome.alarms.create("refreshPrices", { periodInMinutes });
    });
}