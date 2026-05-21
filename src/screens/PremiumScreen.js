import React from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackButtonBar from '../components/BackButtonBar';
import { colors } from '../constants/colors';
import { theme } from '../styles/theme';
import { common } from '../styles/common';
import { useLanguage } from '../i18n/LanguageContext';
import { usePremium } from '../iap/PremiumContext';
import { getPackageKey } from '../services/revenueCat';

const icons = {
    monthly: 'calendar-outline',
    annual: 'trophy-outline',
    lifetime: 'infinite-outline'
};

export default function PremiumScreen({ navigation }) {
    const { t } = useLanguage();
    const {
        isConfigured,
        isPremium,
        loading,
        packages,
        purchase,
        purchasingPackageId,
        restore
    } = usePremium();

    return (
        <SafeAreaView style={common.safeArea}>
            <BackButtonBar
                title={t('premium.title')}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                style={common.screenBody}
                contentContainerStyle={styles.content}
            >
                <View style={styles.hero}>
                    <View style={styles.iconCircle}>
                        <Ionicons
                            name='shield-checkmark-outline'
                            size={34}
                            color={colors.accent}
                        />
                    </View>
                    <Text style={styles.title}>{t('premium.headline')}</Text>
                    <Text style={styles.subtitle}>{t('premium.subtitle')}</Text>
                </View>

                <View style={styles.featureList}>
                    {[
                        t('premium.featureWorkPermit'),
                        t('premium.featureRegistration'),
                        t('premium.featureInspection'),
                        t('premium.featureInsurance')
                        
                    ].map((feature) => (
                        <View
                            key={feature}
                            style={styles.featureRow}
                        >
                            <Ionicons
                                name='checkmark-circle'
                                size={18}
                                color={colors.green}
                            />
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>

                {!isConfigured ? (
                    <View style={styles.setupBanner}>
                        <Text style={styles.setupText}>
                            {t('premium.setupBanner')}
                        </Text>
                    </View>
                ) : null}

                {isPremium ? (
                    <View style={styles.activeBanner}>
                        <Text style={styles.activeText}>
                            {t('premium.active')}
                        </Text>
                    </View>
                ) : null}

                {packages.length ? (
                    <View style={styles.plans}>
                        {packages.map((pkg) => {
                            const key = getPackageKey(pkg);
                            const isPurchasing =
                                purchasingPackageId === pkg.identifier;
                            const price =
                                pkg.product?.priceString ||
                                pkg.storeProduct?.priceString ||
                                t('premium.priceUnavailable');

                            return (
                                <TouchableOpacity
                                    key={pkg.identifier}
                                    style={[
                                        styles.plan,
                                        key === 'annual' && styles.planFeatured
                                    ]}
                                    onPress={async () => {
                                        const purchased = await purchase(pkg);
                                        if (purchased) navigation.goBack();
                                    }}
                                    disabled={loading || !!purchasingPackageId}
                                >
                                    <View style={styles.planLeft}>
                                        <Ionicons
                                            name={icons[key]}
                                            size={22}
                                            color={colors.accent}
                                        />
                                        <View>
                                            <Text style={styles.planTitle}>
                                                {t(`premium.plans.${key}.title`)}
                                            </Text>
                                            <Text style={styles.planSub}>
                                                {t(`premium.plans.${key}.subtitle`)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.planRight}>
                                        <Text style={styles.price}>{price}</Text>
                                        {isPurchasing ? (
                                            <ActivityIndicator
                                                color={colors.accent}
                                                size='small'
                                            />
                                        ) : (
                                            <Ionicons
                                                name='chevron-forward'
                                                size={18}
                                                color={colors.textMuted}
                                            />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.unavailableBanner}>
                        <Text style={styles.unavailableTitle}>
                            {t('premium.unavailableTitle')}
                        </Text>
                        <Text style={styles.unavailableText}>
                            {t('premium.unavailableMessage')}
                        </Text>
                    </View>
                )}

                <Text style={styles.noticeText}>
                    {t('premium.subscriptionNotice')}
                </Text>

                <TouchableOpacity
                    style={styles.restoreBtn}
                    onPress={restore}
                    disabled={loading}
                >
                    <Text style={styles.restoreText}>
                        {t('premium.restore')}
                    </Text>
                </TouchableOpacity>

                <View style={styles.legalLinks}>
                    <TouchableOpacity
                        onPress={() =>
                            Linking.openURL(
                                'https://cdlwallet-privacypolicy.carrd.co/'
                            )
                        }
                    >
                        <Text style={styles.legalLink}>
                            {t('settings.privacyPolicy')}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.legalDot}>•</Text>
                    <TouchableOpacity
                        onPress={() =>
                            Linking.openURL(
                                'https://cdlwallet-termsofuse.carrd.co/'
                            )
                        }
                    >
                        <Text style={styles.legalLink}>
                            {t('settings.termsOfUse')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingBottom: 40,
        gap: theme.spacing.lg
    },
    hero: {
        alignItems: 'center',
        gap: theme.spacing.sm
    },
    iconCircle: {
        width: 68,
        height: 68,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2b2416',
        borderWidth: 1,
        borderColor: colors.accent + '55'
    },
    title: {
        color: colors.textPrimary,
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center'
    },
    subtitle: {
        color: colors.textMuted,
        fontSize: theme.font.base,
        lineHeight: 20,
        textAlign: 'center'
    },
    featureList: {
        backgroundColor: colors.bgCard,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: theme.spacing.lg,
        gap: theme.spacing.md
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm
    },
    featureText: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: theme.font.base
    },
    setupBanner: {
        backgroundColor: '#2b2416',
        borderColor: colors.accent + '66',
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md
    },
    setupText: {
        color: colors.accent,
        fontSize: theme.font.md,
        lineHeight: 18
    },
    unavailableBanner: {
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md
    },
    unavailableTitle: {
        color: colors.textPrimary,
        fontSize: theme.font.base,
        fontWeight: '700',
        marginBottom: 4
    },
    unavailableText: {
        color: colors.textMuted,
        fontSize: theme.font.md,
        lineHeight: 18
    },
    activeBanner: {
        backgroundColor: '#1a2a1e',
        borderColor: colors.green + '66',
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md
    },
    activeText: {
        color: colors.green,
        fontSize: theme.font.md,
        fontWeight: '600'
    },
    plans: {
        gap: theme.spacing.sm
    },
    plan: {
        minHeight: 82,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.bgCard,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: theme.spacing.lg,
        gap: theme.spacing.md
    },
    planFeatured: {
        borderColor: colors.accent
    },
    planLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md
    },
    planTitle: {
        color: colors.textPrimary,
        fontSize: theme.font.base,
        fontWeight: '700'
    },
    planSub: {
        color: colors.textMuted,
        fontSize: theme.font.md,
        marginTop: 3
    },
    planRight: {
        alignItems: 'flex-end',
        gap: 6
    },
    price: {
        color: colors.accent,
        fontSize: theme.font.lg,
        fontWeight: '800'
    },
    noticeText: {
        color: colors.textMuted,
        fontSize: theme.font.sm,
        lineHeight: 16,
        textAlign: 'center'
    },
    restoreBtn: {
        alignItems: 'center',
        padding: theme.spacing.md
    },
    restoreText: {
        color: colors.accent,
        fontSize: theme.font.base,
        fontWeight: '600'
    },
    legalLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.spacing.sm
    },
    legalLink: {
        color: colors.textMuted,
        fontSize: theme.font.md,
        fontWeight: '600'
    },
    legalDot: {
        color: colors.textMuted,
        fontSize: theme.font.md
    }
});
