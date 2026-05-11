import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    AppState
} from 'react-native';

import { useBiometrics } from '../hooks/useBiometrics';
import { theme } from '../styles/theme';
import { colors } from '../constants/colors';

export default function LockGate({ children }) {
    const {
        authenticated,
        isChecking,
        isSupported,
        isEnabled,
        authenticate,
        biometricLabel
    } = useBiometrics();

    const appState = useRef(AppState.currentState);

    //  Auto-trigger biometric on mount / state change
    useEffect(() => {
        if (!isChecking && isSupported && isEnabled && !authenticated) {
            authenticate();
        }
    }, [isChecking, isSupported, isEnabled, authenticated]);

    //  Re-trigger when app comes back from background
    useEffect(() => {
        const subscription = AppState.addEventListener(
            'change',
            (nextAppState) => {
                if (
                    appState.current.match(/inactive|background/) &&
                    nextAppState === 'active'
                ) {
                    if (isSupported && isEnabled) {
                        authenticate();
                    }
                }

                appState.current = nextAppState;
            }
        );

        return () => subscription.remove();
    }, [isSupported, isEnabled, authenticate]);

    // Initial loading state
    if (isChecking) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator color={theme.colors.accent} />
            </View>
        );
    }

    // Locked screen
    if (!authenticated) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 16,
                    backgroundColor: colors.bgBody
                }}
            >
                <Text style={{ color: theme.colors.textPrimary, fontSize: 18 }}>
                    Unlock CDL Wallet
                </Text>

                <TouchableOpacity
                    style={{
                        backgroundColor: theme.colors.accent,
                        padding: 14,
                        borderRadius: 10
                    }}
                    onPress={authenticate}
                >
                    <Text style={{ color: '#1a1200', fontWeight: '600' }}>
                        Use {biometricLabel}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Unlocked app
    return children;
}
