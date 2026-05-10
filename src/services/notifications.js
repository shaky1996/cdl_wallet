import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { parseLocalDate } from '../utils/dateHelpers';

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

/* ---------------------------
   SCHEDULE REMINDERS
---------------------------- */
export const scheduleExpiryReminders = async (docType, expiryDateStr) => {
    const granted = await requestPermissions();
    if (!granted) return;

    await cancelDocReminders(docType);

    const label = docType === 'cdl' ? 'CDL' : 'Med Card';
    const expiry = parseLocalDate(expiryDateStr);

    if (!expiry) return;

    const now = new Date();

    const reminders = [
        {
            key: '30',
            daysBefore: 30,
            title: `CDL Wallet`,
            body: `Your ${label} expires in 30 days. Time to renew.`
        },
        {
            key: '10',
            daysBefore: 10,
            title: `CDL Wallet`,
            body: `Your ${label} expires in 10 days. Don't get pulled off the road.`
        },
        {
            key: '1',
            daysBefore: 1,
            title: `CDL Wallet`,
            body: `Your ${label} expires tomorrow. Immediate action required.`
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
