import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import { Alert, Linking, Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import {
    configureRevenueCat,
    getPackageKey,
    hasPremiumEntitlement
} from '../services/revenueCat';
import { useLanguage } from '../i18n/LanguageContext';

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
    const { t } = useLanguage();
    const [isPremium, setIsPremium] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);
    const [customerInfo, setCustomerInfo] = useState(null);
    const [offerings, setOfferings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasingPackageId, setPurchasingPackageId] = useState(null);

    const refreshCustomerInfo = useCallback(async () => {
        if (!isConfigured || Platform.OS === 'web') return null;

        const customerInfo = await Purchases.getCustomerInfo();
        setCustomerInfo(customerInfo);
        setIsPremium(hasPremiumEntitlement(customerInfo));
        return customerInfo;
    }, [isConfigured]);

    const loadOfferings = useCallback(async () => {
        if (!isConfigured || Platform.OS === 'web') {
            setOfferings(null);
            return;
        }

        const nextOfferings = await Purchases.getOfferings();
        setOfferings(nextOfferings);
    }, [isConfigured]);

    useEffect(() => {
        let isMounted = true;
        const configured = configureRevenueCat();
        setIsConfigured(configured);

        const init = async () => {
            try {
                if (configured) {
                    const customerInfo = await Purchases.getCustomerInfo();
                    if (!isMounted) return;
                    setCustomerInfo(customerInfo);
                    setIsPremium(hasPremiumEntitlement(customerInfo));

                    const nextOfferings = await Purchases.getOfferings();
                    if (!isMounted) return;
                    setOfferings(nextOfferings);
                } else {
                    setOfferings(null);
                }
            } catch (e) {
                console.warn('RevenueCat init failed:', e.message);
                if (isMounted) {
                    setOfferings(null);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        init();

        return () => {
            isMounted = false;
        };
    }, []);

    const purchase = useCallback(
        async (pkg) => {
            if (!isConfigured || Platform.OS === 'web') {
                Alert.alert(
                    t('premium.setupRequiredTitle'),
                    t('premium.setupRequiredMessage')
                );
                return false;
            }

            setPurchasingPackageId(pkg.identifier);

            try {
                const { customerInfo } = await Purchases.purchasePackage(pkg);
                const hasAccess = hasPremiumEntitlement(customerInfo);
                setCustomerInfo(customerInfo);
                setIsPremium(hasAccess);
                return hasAccess;
            } catch (e) {
                if (!e.userCancelled) {
                    Alert.alert(t('common.error'), t('premium.purchaseError'));
                }
                return false;
            } finally {
                setPurchasingPackageId(null);
            }
        },
        [isConfigured, t]
    );

    const restore = useCallback(async () => {
        if (!isConfigured || Platform.OS === 'web') {
            Alert.alert(
                t('premium.setupRequiredTitle'),
                t('premium.setupRequiredMessage')
            );
            return false;
        }

        setLoading(true);

        try {
            const customerInfo = await Purchases.restorePurchases();
            const hasAccess = hasPremiumEntitlement(customerInfo);
            setCustomerInfo(customerInfo);
            setIsPremium(hasAccess);

            Alert.alert(
                hasAccess ? t('premium.restoredTitle') : t('premium.noPurchasesTitle'),
                hasAccess
                    ? t('premium.restoredMessage')
                    : t('premium.noPurchasesMessage')
            );

            return hasAccess;
        } catch (e) {
            Alert.alert(t('common.error'), t('premium.restoreError'));
            return false;
        } finally {
            setLoading(false);
        }
    }, [isConfigured, t]);

    const openManagementUrl = useCallback(async () => {
        const url = customerInfo?.managementURL;

        if (url) {
            await Linking.openURL(url);
            return true;
        }

        Alert.alert(
            t('premium.managementUnavailableTitle'),
            t('premium.managementUnavailableMessage')
        );
        return false;
    }, [customerInfo, t]);

    const packages = useMemo(() => {
        const available = offerings?.current?.availablePackages || [];

        return [...available].sort((a, b) => {
            const order = { monthly: 0, annual: 1, lifetime: 2 };
            return order[getPackageKey(a)] - order[getPackageKey(b)];
        });
    }, [offerings]);

    const value = useMemo(
        () => ({
            isPremium,
            isConfigured,
            customerInfo,
            loading,
            managementURL: customerInfo?.managementURL || null,
            packages,
            purchasingPackageId,
            loadOfferings,
            openManagementUrl,
            purchase,
            refreshCustomerInfo,
            restore
        }),
        [
            isPremium,
            isConfigured,
            customerInfo,
            loading,
            packages,
            purchasingPackageId,
            loadOfferings,
            openManagementUrl,
            purchase,
            refreshCustomerInfo,
            restore
        ]
    );

    return (
        <PremiumContext.Provider value={value}>
            {children}
        </PremiumContext.Provider>
    );
}

export function usePremium() {
    const context = useContext(PremiumContext);

    if (!context) {
        throw new Error('usePremium must be used inside PremiumProvider');
    }

    return context;
}
