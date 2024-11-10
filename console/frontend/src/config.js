// ==============================|| THEME CONFIG  ||============================== //

const config = {
    defaultPath: '/dashboard/default',
    fontFamily: `'Public Sans', sans-serif`,
    i18n: 'en',
    miniDrawer: false,
    container: true,
    mode: 'light',
    presetColor: 'default',
    themeDirection: 'ltr'
};

export default config;

// ==============================|| Environment CONFIG  ||============================== //
export const drawerWidth = 260;
export const SELF_HOSTED = "self_hosted"
export const WEB = "web"

export function getMode() {
    if (window._env_) {
        return window._env_.REACT_APP_MODE
    } else {
        return WEB
    }
}

export function getBackendOrigin() {
    if (window._env_) {
        return window._env_.REACT_APP_BACKEND_ORIGIN
    } else {
        return "http://localhost:8080"
    }
}

export function LoadComponent(componentsMap) {
    return componentsMap[getMode()]
}

