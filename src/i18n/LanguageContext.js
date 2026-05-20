import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import { AppState, NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGES, LANGUAGE_KEY, translations } from './translations';

const LanguageContext = createContext(null);

const getValue = (source, path) =>
    path.split('.').reduce((current, key) => current?.[key], source);

const interpolate = (value, params = {}) => {
    if (typeof value !== 'string') return value;

    return Object.keys(params).reduce(
        (text, key) => text.replaceAll(`{${key}}`, String(params[key])),
        value
    );
};

const getDeviceLanguage = () => {
    const settings = NativeModules.SettingsManager?.settings;
    const iosLanguage =
        settings?.AppleLocale ||
        settings?.AppleLanguages?.[0] ||
        settings?.NSLanguages?.[0];
    const androidLanguage = NativeModules.I18nManager?.localeIdentifier;
    const deviceLanguage =
        Platform.OS === 'ios' ? iosLanguage : androidLanguage;

    return String(deviceLanguage || 'en').toLowerCase().startsWith('ru')
        ? 'ru'
        : 'en';
};

export function LanguageProvider({ children }) {
    const [languagePreference, setLanguagePreference] = useState('system');
    const [systemLanguage, setSystemLanguage] = useState(getDeviceLanguage);

    const language =
        languagePreference === 'system' ? systemLanguage : languagePreference;

    useEffect(() => {
        AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
            if (stored && LANGUAGES[stored]) {
                setLanguagePreference(stored);
            }
        });
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                setSystemLanguage(getDeviceLanguage());
            }
        });

        return () => subscription.remove();
    }, []);

    const setLanguage = useCallback(async (nextLanguage) => {
        if (!LANGUAGES[nextLanguage]) return;

        setLanguagePreference(nextLanguage);
        setSystemLanguage(getDeviceLanguage());
        await AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage);
    }, []);

    const t = useCallback(
        (key, params) => {
            const translated =
                getValue(translations[language], key) ??
                getValue(translations.en, key) ??
                key;

            return interpolate(translated, params);
        },
        [language]
    );

    const formatDate = useCallback(
        (date) =>
            date.toLocaleDateString(LANGUAGES[language].locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
        [language]
    );

    const value = useMemo(
        () => ({
            language,
            languagePreference,
            locale: LANGUAGES[language].locale,
            languages: LANGUAGES,
            setLanguage,
            t,
            formatDate
        }),
        [formatDate, language, languagePreference, setLanguage, t]
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error('useLanguage must be used inside LanguageProvider');
    }

    return context;
}
