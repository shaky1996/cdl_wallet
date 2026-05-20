import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useLanguage } from '../i18n/LanguageContext';

export const useBiometrics = () => {
    const { t } = useLanguage();
    const [isLocked, setIsLocked] = useState(true);
    const [isChecking, setIsChecking] = useState(true);
    const [isSupported, setIsSupported] = useState(false);
    const [biometricType, setBiometricType] = useState(null);

    const appState = useRef(AppState.currentState);
    const isAuthenticating = useRef(false);

    // 🚨 KEY FIX: prevents Face ID loop after success
    const didJustAuthenticate = useRef(false);

    const authenticate = async () => {
        if (isAuthenticating.current) return false;

        isAuthenticating.current = true;

        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: t('biometrics.prompt'),
                disableDeviceFallback: false,
                cancelLabel: t('biometrics.cancel')
            });

            if (result.success) {
                setIsLocked(false);

                // prevent immediate re-trigger from AppState
                didJustAuthenticate.current = true;

                setTimeout(() => {
                    didJustAuthenticate.current = false;
                }, 2000);

                return true;
            }

            setIsLocked(true);
            return false;
        } catch (e) {
            console.log('Auth error:', e);
            setIsLocked(true);
            return false;
        } finally {
            isAuthenticating.current = false;
        }
    };

    const handleAppState = (nextState) => {
        const prev = appState.current;

        console.log('APP STATE:', prev, '→', nextState);

        // 🔒 lock only when truly leaving app
        if (prev === 'active' && nextState === 'background') {
            setIsLocked(true);
        }

        // 🔓 ONLY trigger when coming from BACKGROUND
        // (NOT inactive → fixes camera/gallery issue)
        if (
            prev === 'background' &&
            nextState === 'active' &&
            !didJustAuthenticate.current
        ) {
            setIsLocked(true);

            setTimeout(() => {
                authenticate();
            }, 500);
        }

        appState.current = nextState;
    };

    const init = async () => {
        setIsChecking(true);

        try {
            const [hardware, enrolled] = await Promise.all([
                LocalAuthentication.hasHardwareAsync(),
                LocalAuthentication.isEnrolledAsync()
            ]);

            const supported = hardware && enrolled;
            setIsSupported(supported);

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

                setIsLocked(true);
            } else {
                setIsLocked(false);
            }
        } catch (e) {
            console.log('init error:', e);
            setIsLocked(false);
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        init();

        const sub = AppState.addEventListener('change', handleAppState);

        return () => sub.remove();
    }, []);

    const biometricLabel =
        biometricType === 'face'
            ? 'Face ID'
            : biometricType === 'fingerprint'
              ? 'Touch ID'
              : 'Biometrics';

    return {
        isLocked,
        isChecking,
        isSupported,
        biometricType,
        biometricLabel,
        authenticate
    };
};
