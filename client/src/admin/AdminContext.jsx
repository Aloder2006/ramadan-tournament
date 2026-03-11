import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { getTeams, getMatches, getSettings } from '../services/api';
import { applySettingsColors } from './panels/SettingsPanel';

const AdminContext = createContext(null);

const initialState = {
    teams: [],
    matches: [],
    settings: null,
    loading: true,
    error: null,
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_DATA':
            return {
                ...state,
                teams: action.payload.teams,
                matches: action.payload.matches,
                settings: action.payload.settings,
                loading: false,
                error: null,
            };
        case 'SET_TEAMS':
            return { ...state, teams: action.payload };
        case 'SET_MATCHES':
            return { ...state, matches: action.payload };
        case 'SET_SETTINGS':
            return { ...state, settings: action.payload };
        default:
            return state;
    }
}

export function AdminProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const fetchAll = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const [teams, matches, settings] = await Promise.all([
                getTeams(),
                getMatches(),
                getSettings(),
            ]);
            const safeTeams = Array.isArray(teams) ? teams : [];
            const safeMatches = Array.isArray(matches) ? matches : [];
            const safeSettings = settings && !settings.message ? settings : null;
            if (safeSettings) applySettingsColors(safeSettings);
            dispatch({
                type: 'SET_DATA',
                payload: { teams: safeTeams, matches: safeMatches, settings: safeSettings },
            });
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err.message });
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const value = {
        ...state,
        dispatch,
        fetchAll,
        groupMatches: state.matches.filter(m => m.phase !== 'knockout'),
        koMatches: state.matches.filter(m => m.phase === 'knockout'),
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
    return ctx;
}
