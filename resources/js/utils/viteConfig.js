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
    const cfg = await loadConfig();
    return cfg.LINK_URL;
}
