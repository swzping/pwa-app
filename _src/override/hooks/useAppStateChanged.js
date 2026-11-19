import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export const useAppStateChanged = ({
    whenAppInForeground,
    whenAppInBackGround,
}) => {
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                whenAppInForeground && whenAppInForeground();
            }
            else if (nextAppState.match(/inactive|background/)) {
                whenAppInBackGround && whenAppInBackGround();
            }
            appState.current = nextAppState;
        });
        return () => {
            subscription.remove();
        };
    }, []);
    return appState.current;
};

export default useAppStateChanged;
