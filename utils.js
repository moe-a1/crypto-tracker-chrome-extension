export function updateExtensionIcon(logoUrl) {
    console.log("Updating extension icon:", logoUrl);

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

