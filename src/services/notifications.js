import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false
    })
});

export const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
};

export const scheduleExpiryReminders = async (docType, expiryDateStr) => {
    // Cancel old notifications for this doc type first
    await cancelDocReminders(docType);

    const label = docType === 'cdl' ? 'CDL' : 'Med Card';
    const expiry = new Date(expiryDateStr);

    const thirtyDay = new Date(expiry);
    thirtyDay.setDate(thirtyDay.getDate() - 30);
    thirtyDay.setHours(8, 0, 0, 0);

    const tenDay = new Date(expiry);
    tenDay.setDate(tenDay.getDate() - 10);
    tenDay.setHours(8, 0, 0, 0);

    const now = new Date();

    if (thirtyDay > now) {
        await Notifications.scheduleNotificationAsync({
            identifier: `${docType}_30`,
            content: {
                title: `${label} expiring soon`,
                body: `Your ${label} expires in 30 days. Time to renew.`,
                data: { docType }
            },
            trigger: { type: 'date', date: thirtyDay }
        });
    }

    if (tenDay > now) {
        await Notifications.scheduleNotificationAsync({
            identifier: `${docType}_10`,
            content: {
                title: `${label} — 10 days left`,
                body: `Don't get pulled off the road. Your ${label} expires in 10 days.`,
                data: { docType }
            },
            trigger: { type: 'date', 
                date: tenDay }
        });
    }
};

export const cancelDocReminders = async (docType) => {
    await Notifications.cancelScheduledNotificationAsync(`${docType}_30`);
    await Notifications.cancelScheduledNotificationAsync(`${docType}_10`);
};
