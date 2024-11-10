export const SELF_HOSTED = "self_hosted"
export const WEB = "web"

export function getMode() {
    if (window._env_) {
        return window._env_.REACT_APP_MODE
    } else {
        return WEB
    }
}

export function LoadComponent(componentsMap) {
    return componentsMap[getMode()]
}