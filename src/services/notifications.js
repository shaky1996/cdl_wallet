import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

import { parseLocalDate } from '../utils/dateHelpers';
import { LANGUAGE_KEY, translations } from '../i18n/translations';

/* ---------------------------
   HANDLER
---------------------------- */
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false
    })
});

/* ---------------------------
   PERMISSIONS
---------------------------- */
export const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
};

// /* ---------------------------
//    ANDROID SETUP (call once)
// ---------------------------- */
// export const setupNotifications = async () => {
//     if (Platform.OS === 'android') {
//         await Notifications.setNotificationChannelAsync('default', {
//             name: 'default',
//             importance: Notifications.AndroidImportance.HIGH,
//             sound: true
//         });
//     }
// };

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

const getNotificationLanguage = async () => {
    const preference = await AsyncStorage.getItem(LANGUAGE_KEY);

    if (preference === 'en' || preference === 'ru') {
        return preference;
    }

    return getDeviceLanguage();
};

const translate = (language, key, params = {}) => {
    const value =
        key
            .split('.')
            .reduce((current, part) => current?.[part], translations[language]) ||
        key
            .split('.')
            .reduce((current, part) => current?.[part], translations.en) ||
        key;

    return Object.keys(params).reduce(
        (text, param) => text.replaceAll(`{${param}}`, String(params[param])),
        value
    );
};

/* ---------------------------
   SCHEDULE REMINDERS
---------------------------- */
export const scheduleExpiryReminders = async (docType, expiryDateStr) => {
    const granted = await requestPermissions();
    if (!granted) return;

    await cancelDocReminders(docType);

    const language = await getNotificationLanguage();
    const label = translate(language, `docs.${docType}`);
    const expiry = parseLocalDate(expiryDateStr);

    if (!expiry) return;

    const now = new Date();

    const reminders = [
        {
            key: '30',
            daysBefore: 30,
            title: `CDL Wallet`,
            body: translate(language, 'notifications.expiresIn30', {
                docLabel: label
            })
        },
        {
            key: '10',
            daysBefore: 10,
            title: `CDL Wallet`,
            body: translate(language, 'notifications.expiresIn10', {
                docLabel: label
            })
        },
        {
            key: '1',
            daysBefore: 1,
            title: `CDL Wallet`,
            body: translate(language, 'notifications.expiresTomorrow', {
                docLabel: label
            })
        }
    ];

    for (const r of reminders) {
        const triggerDate = new Date(expiry);
        triggerDate.setDate(triggerDate.getDate() - r.daysBefore);
        triggerDate.setHours(8, 0, 0, 0);

        if (triggerDate <= now) continue;

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: r.title,
                body: r.body,
                data: { docType }
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate
            }
        });

        await AsyncStorage.setItem(`${docType}_${r.key}_id`, id);
    }
};

/* ---------------------------
   CANCEL REMINDERS
---------------------------- */
export const cancelDocReminders = async (docType) => {
    const keys = ['30', '10', '1'];

    for (const key of keys) {
        const id = await AsyncStorage.getItem(`${docType}_${key}_id`);

        if (id) {
            await Notifications.cancelScheduledNotificationAsync(id);
            await AsyncStorage.removeItem(`${docType}_${key}_id`);
        }
    }
};
