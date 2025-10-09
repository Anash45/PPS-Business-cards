import { createContext, useContext, useState } from "react";

// 1️⃣ Create context
const GlobalContext = createContext();

// 2️⃣ Provider component
export const GlobalProvider = ({ children }) => {
    const [headerTitle, setHeaderTitle] = useState("Welcome! 👋");
    const [headerText, setHeaderText] = useState(
        "See the latest stats of your awesome business."
    );

    return (
        <GlobalContext.Provider
            value={{
                headerTitle,
                headerText,
                setHeaderTitle,
                setHeaderText,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

// 3️⃣ Custom hook for easier usage
export const useGlobal = () => useContext(GlobalContext);
