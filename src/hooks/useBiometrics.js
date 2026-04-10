import { useState, useEffect, useRef } from 'react';
import { AppState, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRICS_PREF_KEY = 'cdl_biometrics_enabled';
// How long the app can be backgrounded before requiring re-auth (ms)
const LOCK_AFTER_BACKGROUND_MS = 5 * 60 * 1000; // 5 minutes

export const useBiometrics = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [isEnabled, setIsEnabled] = useState(true);
    const [isChecking, setIsChecking] = useState(true);
    const [biometricType, setBiometricType] = useState(null); // 'face' | 'fingerprint' | null

    const appState = useRef(AppState.currentState);
    const backgroundedAt = useRef(null);

    useEffect(() => {
        initialCheck();

        // Re-lock when app comes back from background
        const subscription = AppState.addEventListener(
            'change',
            handleAppStateChange
        );
        return () => subscription.remove();
    }, []);

    const initialCheck = async () => {
        setIsChecking(true);
        try {
            const [compatible, enrolled, prefRaw] = await Promise.all([
                LocalAuthentication.hasHardwareAsync(),
                LocalAuthentication.isEnrolledAsync(),
                AsyncStorage.getItem(BIOMETRICS_PREF_KEY)
            ]);

            const supported = compatible && enrolled;
            const enabled = prefRaw !== 'false'; // default true if never set

            setIsSupported(supported);
            setIsEnabled(enabled);

            // Detect biometric type for UI label ("Face ID" vs "Touch ID")
            if (supported) {
                const types =
                    await LocalAuthentication.supportedAuthenticationTypesAsync();
                if (
                    types.includes(
                        LocalAuthentication.AuthenticationType
                            .FACIAL_RECOGNITION
                    )
                ) {
                    setBiometricType('face');
                } else if (
                    types.includes(
                        LocalAuthentication.AuthenticationType.FINGERPRINT
                    )
                ) {
                    setBiometricType('fingerprint');
                }
            }

            // If biometrics not supported or disabled by user, skip auth
            if (!supported || !enabled) {
                setAuthenticated(true);
            }
        } catch (e) {
            console.error('Biometrics check error:', e.message);
            // Fail open — don't lock out the user if biometrics crashes
            setAuthenticated(true);
        } finally {
            setIsChecking(false);
        }
    };

    const handleAppStateChange = async (nextState) => {
        // App going to background — record the time
        if (
            appState.current === 'active' &&
            (nextState === 'background' || nextState === 'inactive')
        ) {
            backgroundedAt.current = Date.now();
        }

        // App coming back to foreground
        if (
            (appState.current === 'background' ||
                appState.current === 'inactive') &&
            nextState === 'active'
        ) {
            const wasBackgroundedFor =
                Date.now() - (backgroundedAt.current || 0);

            // Re-lock only if app was in background for longer than the threshold
            if (wasBackgroundedFor > LOCK_AFTER_BACKGROUND_MS) {
                const enabled = await AsyncStorage.getItem(BIOMETRICS_PREF_KEY);
                if (enabled !== 'false' && isSupported) {
                    setAuthenticated(false);
                    // Automatically prompt — don't make user tap a button
                    await authenticate();
                }
            }
        }

        appState.current = nextState;
    };

    // Prompt the OS biometric dialog
    const authenticate = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock CDL Wallet',
                fallbackLabel: 'Use PIN',
                // Allow device PIN/passcode as fallback (required by Apple guidelines)
                disableDeviceFallback: false,
                cancelLabel: 'Cancel'
            });

            if (result.success) {
                setAuthenticated(true);
                return true;
            }

            // User cancelled or biometrics failed
            if (result.error === 'user_cancel') {
                // Don't show an alert — user chose to cancel
                return false;
            }

            // Too many failed attempts — device fallback kicks in automatically
            if (
                result.error === 'lockout' ||
                result.error === 'lockout_permanent'
            ) {
                Alert.alert(
                    'Too many attempts',
                    'Biometrics locked. Use your device PIN to unlock.'
                );
                return false;
            }

            // Any other error — show a generic message
            Alert.alert(
                'Authentication failed',
                'Could not verify your identity. Please try again.'
            );
            return false;
        } catch (e) {
            console.error('Authentication error:', e.message);
            // Fail open — if auth crashes, don't permanently lock the user out
            setAuthenticated(true);
            return true;
        }
    };

    // Human-readable label for UI ("Face ID", "Touch ID", "Biometrics")
    const biometricLabel =
        biometricType === 'face'
            ? 'Face ID'
            : biometricType === 'fingerprint'
              ? 'Touch ID'
              : 'Biometrics';

    return {
        // State
        authenticated,
        isSupported,
        isEnabled,
        isChecking,
        biometricType,
        biometricLabel,

        // Actions
        authenticate
    };
};
