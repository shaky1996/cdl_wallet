import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

export const PREMIUM_ENTITLEMENT = 'cdl_wallet_premium';

export const REVENUECAT_PRODUCT_IDS = {
    monthly: 'cdl_wallet_premium_monthly',
    annual: 'cdl_wallet_premium_annual',
    lifetime: 'cdl_wallet_premium_lifetime'
};

const API_KEYS = {
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '',
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || ''
};

let configured = false;

export const configureRevenueCat = () => {
    if (configured || Platform.OS === 'web') return false;

    const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;

    if (!apiKey) {
        console.warn(
            'RevenueCat API key missing. Set EXPO_PUBLIC_REVENUECAT_IOS_API_KEY and EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY.'
        );
        return false;
    }

    Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.configure({ apiKey });
    configured = true;

    return true;
};

export const hasPremiumEntitlement = (customerInfo) =>
    typeof customerInfo?.entitlements?.active?.[PREMIUM_ENTITLEMENT] !==
    'undefined';

export const getPackageKey = (pkg) => {
    const identifier =
        pkg?.identifier ||
        pkg?.product?.identifier ||
        pkg?.storeProduct?.identifier ||
        '';

    if (identifier.includes('annual') || identifier.includes('year')) {
        return 'annual';
    }

    if (identifier.includes('lifetime')) {
        return 'lifetime';
    }

    return 'monthly';
};
