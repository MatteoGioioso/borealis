import ThemeCustomization from './themes';
import Router from "./Router";
import {AppFunctionalityProvider} from "./MainContext";
import {ReactFlowProvider} from "reactflow";
import "highlight.js/styles/default.css"

function App() {
    return (
        <ThemeCustomization>
            <ReactFlowProvider>
                <AppFunctionalityProvider>
                    <Router/>
                </AppFunctionalityProvider>
            </ReactFlowProvider>
        </ThemeCustomization>
    );
}

export default App;
