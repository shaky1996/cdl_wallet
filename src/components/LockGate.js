import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useBiometrics } from '../hooks/useBiometrics';
import { theme } from '../styles/theme';

export default function LockGate({ children }) {
    const {
        authenticated,
        isChecking,
        isSupported,
        isEnabled,
        authenticate,
        biometricLabel
    } = useBiometrics();

    // 🔥 auto-trigger Face ID
    useEffect(() => {
        if (!isChecking && isSupported && isEnabled && !authenticated) {
            authenticate();
        }
    }, [isChecking]);

    // ⏳ initial check
    if (isChecking) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator color={theme.colors.accent} />
            </View>
        );
    }

    // 🔒 LOCK SCREEN
    if (!authenticated) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 16
                }}
            >
                <Text style={{ color: theme.colors.textPrimary, fontSize: 18 }}>
                    Unlock with {biometricLabel}
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

    // ✅ UNLOCKED → show app
    return children;
}
