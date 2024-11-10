import {createContext} from "react";

import {getMode} from "./config";

export const AppFunctionalityContext = createContext({})
export const AppFunctionalityProvider = (props) => {
    const appMode = getMode()

    return (
        <AppFunctionalityContext.Provider value={{appMode}}>
            {props.children}
        </AppFunctionalityContext.Provider>
    )
}

