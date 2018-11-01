import * as actionTypes from './types';

// User actions
export const setUser = user => {
    return {
        type: actionTypes.SET_USER,
        payload: {
            currentUser: user
        }
    }
}

export const clearUser = () => {
    return {
        type: actionTypes.CLEAR_USER,
    }
}

// Channel action
export const setCurrentChannel = channel => {
    return {
        type: actionTypes.SET_CURRENT_CHANNEL,
        payload: {
            currentChannel: channel,
        }
    }
}

export const setPrivateChannel = isPrivateChannel => {
    return {
        type: actionTypes.SET_CURRENT_CHANNEL,
        payload: {
            isPrivateChannel
        }
    }
}