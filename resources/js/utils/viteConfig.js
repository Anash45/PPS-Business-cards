let config = null; // cached config

export async function loadConfig() {
    if (config) return config; // return cached config if already loaded

    try {
        config = await fetch("/vite.config.json").then((res) => res.json());
        return config;
    } catch (err) {
        console.warn("Could not load config.json, using defaults", err);
        config = {
            LINK_URL: "https://app.ppsbusinesscards.de", // default fallback
        };
        return config;
    }
}

// Convenience getter
export async function getDomain() {
    const response = await fetch('/get-link-url'); // Your controller route
    const data = await response.json();
    return data.link_url; // return ONLY the URL
}