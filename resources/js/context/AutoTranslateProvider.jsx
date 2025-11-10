import { createContext, useContext, useState, useRef, useEffect } from "react";

const AutoTranslateContext = createContext();

export function AutoTranslateProvider({ children }) {
    const systemLang = (navigator.language || "en").split("-")[0];
    const [lang, setLang] = useState(systemLang === "de" ? "de" : "en");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const languages = [
        { code: "en", label: "English", flag: "/assets/images/uk.png" },
        { code: "de", label: "Deutsch", flag: "/assets/images/germany.png" },
    ];

    const currentLang = languages.find((l) => l.code === lang) || languages[0];

    const handleSelect = (code) => {
        setLang(code);
        setOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <AutoTranslateContext.Provider value={{ lang, setLang }}>
            {children}

            {/* Floating dropdown */}
            <div className="fixed top-4 right-4 z-50" ref={ref}>
                <div className="relative">
                    {/* Drop-up menu */}
                    {open && (
                        <div className="absolute top-12 right-0 mb-2 w-36 rounded-2xl shadow-lg bg-white border border-gray-200 transition-all duration-150">
                            {languages.map((l) => (
                                <button
                                    key={l.code}
                                    onClick={() => handleSelect(l.code)}
                                    className={`flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 ${
                                        l.code === lang
                                            ? "font-semibold text-primary"
                                            : "text-gray-700"
                                    }`}
                                >
                                    <img
                                        src={l.flag}
                                        alt={l.label}
                                        className="h-4 w-4 mr-2"
                                    />
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Trigger button */}
                    <button
                        onClick={() => setOpen(!open)}
                        className="w-12 h-12 rounded-full shadow-md bg-primary text-white flex items-center justify-center text-xl hover:bg-primary focus:outline-none"
                        title="Change language"
                    >
                        <img
                            src={currentLang.flag}
                            alt={currentLang.label}
                            className="h-6 w-6 rounded-full"
                        />
                    </button>
                </div>
            </div>
        </AutoTranslateContext.Provider>
    );
}

export function useAutoTranslate() {
    return useContext(AutoTranslateContext);
}
