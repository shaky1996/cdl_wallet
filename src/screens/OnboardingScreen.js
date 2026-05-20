import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';
import appLogo from '../../assets/CDL_Wallet_Icon.png';

const slides = [
    {
        icon: 'wallet-outline',
        titleKey: 'onboarding.intro.title',
        textKey: 'onboarding.intro.text',
        visual: 'intro'
    },
    {
        icon: 'cloud-upload-outline',
        titleKey: 'onboarding.home.title',
        textKey: 'onboarding.home.text',
        visual: 'home'
    },
    {
        icon: 'document-text-outline',
        titleKey: 'onboarding.viewer.title',
        textKey: 'onboarding.viewer.text',
        visual: 'viewer'
    },
    {
        icon: 'share-social-outline',
        titleKey: 'onboarding.share.title',
        textKey: 'onboarding.share.text',
        visual: 'share'
    },
    {
        icon: 'archive-outline',
        titleKey: 'onboarding.archive.title',
        textKey: 'onboarding.archive.text',
        visual: 'archive'
    },
    {
        icon: 'lock-closed-outline',
        titleKey: 'onboarding.security.title',
        textKey: 'onboarding.security.text',
        visual: 'security'
    }
];

function MiniHeader({ subtitle }) {
    return (
        <View style={styles.miniHeader}>
            <Text style={styles.miniApp}>{'CDL Wallet'}</Text>
            <Text style={styles.miniSub}>{subtitle}</Text>
        </View>
    );
}

function MiniDocCard({ label, status, color, empty }) {
    return (
        <View style={styles.miniCard}>
            <View style={styles.miniCardTop}>
                <View>
                    <Text style={styles.miniDocType}>{label}</Text>
                    <Text style={empty ? styles.miniUpload : styles.miniName}>
                        {empty ? 'Tap to upload' : label}
                    </Text>
                </View>
                {!empty ? (
                    <View style={[styles.statusPill, { borderColor: color }]}>
                        <Text style={[styles.statusText, { color }]}>
                            {status}
                        </Text>
                    </View>
                ) : null}
            </View>
            {!empty ? (
                <View style={styles.progressTrack}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: '70%', backgroundColor: color }
                        ]}
                    />
                </View>
            ) : null}
        </View>
    );
}

function Visual({ type }) {
    const { t } = useLanguage();

    if (type === 'intro') {
        return (
            <View style={styles.visualScreen}>
                <View style={styles.walletMark}>
                    <Image
                        source={appLogo}
                        style={styles.visualLogo}
                    />
                </View>
                <Text style={styles.visualBigTitle}>{t('common.appName')}</Text>
                <Text style={styles.visualCenteredText}>
                    {t('onboarding.intro.visual')}
                </Text>
            </View>
        );
    }

    if (type === 'home') {
        return (
            <View style={styles.visualScreen}>
                <MiniHeader subtitle={t('header.home')} />
                <Text style={styles.sectionLabel}>{t('home.sectionLabel')}</Text>
                <MiniDocCard
                    label={t('docs.cdl')}
                    status={t('status.valid')}
                    color={colors.green}
                    empty
                />
                <MiniDocCard
                    label={t('docs.med_card')}
                    status={t('status.expiring')}
                    color={colors.amber}
                />
                <View style={styles.accentButton}>
                    <Text style={styles.accentButtonText}>
                        {t('home.shareButton')}
                    </Text>
                </View>
            </View>
        );
    }

    if (type === 'viewer') {
        return (
            <View style={styles.visualScreen}>
                <View style={styles.viewerTop}>
                    <Text style={styles.viewerBack}>{t('common.back')}</Text>
                    <Text style={styles.viewerTitle}>{t('docs.cdl')}</Text>
                    <View style={{ width: 42 }} />
                </View>
                <View style={styles.docImageMock}>
                    <Ionicons
                        name='image-outline'
                        size={48}
                        color={colors.textMuted}
                    />
                </View>
                <View style={styles.infoPanel}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('viewer.status')}</Text>
                        <View
                            style={[
                                styles.statusPill,
                                { borderColor: colors.green }
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    { color: colors.green }
                                ]}
                            >
                                {t('status.valid')}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('viewer.expires')}</Text>
                        <Text style={styles.infoValue}>04-25-2026</Text>
                    </View>
                </View>
                <View style={styles.actionRow}>
                    <View style={styles.smallAction}>
                        <Text style={styles.smallActionText}>
                            {t('viewer.replace')}
                        </Text>
                    </View>
                    <View style={styles.smallActionPrimary}>
                        <Text style={styles.smallActionPrimaryText}>
                            {t('common.share')}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    if (type === 'share') {
        return (
            <View style={styles.visualScreen}>
                <MiniHeader subtitle={t('header.share')} />
                <View style={styles.checkRow}>
                    <View style={styles.checkOn}>
                        <Text style={styles.checkMark}>✓</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.checkTitle}>{t('docs.cdl')}</Text>
                        <Text style={styles.checkSub}>PDF</Text>
                    </View>
                </View>
                <View style={styles.pdfConversion}>
                    <Ionicons
                        name='images-outline'
                        size={24}
                        color={colors.textMuted}
                    />
                    <Ionicons
                        name='arrow-forward'
                        size={20}
                        color={colors.accent}
                    />
                    <Ionicons
                        name='document-attach-outline'
                        size={28}
                        color={colors.accent}
                    />
                </View>
                <View style={styles.accentButton}>
                    <Text style={styles.accentButtonText}>
                        {t('shareScreen.emailDocuments')}
                    </Text>
                </View>
                <View style={styles.outlineButton}>
                    <Text style={styles.outlineButtonText}>
                        {t('shareScreen.shareDocuments')}
                    </Text>
                </View>
            </View>
        );
    }

    if (type === 'archive') {
        return (
            <View style={styles.visualScreen}>
                <MiniHeader subtitle={t('header.archive')} />
                {[t('docs.cdl'), t('docs.med_card')].map((label, index) => (
                    <View
                        key={label}
                        style={styles.archiveItem}
                    >
                        <View style={styles.archiveThumb}>
                            <Ionicons
                                name='image-outline'
                                size={22}
                                color={colors.textMuted}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.archiveTitle}>
                                {t('docs.oldDocument', { docLabel: label })}
                            </Text>
                            <Text style={styles.archiveSub}>
                                {index === 0 ? '04-25-2026' : '08-14-2025'}
                            </Text>
                        </View>
                    </View>
                ))}
                <View style={styles.outlineButton}>
                    <Text style={styles.outlineButtonText}>
                        {t('archive.uploadOldDocument')}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.visualScreen}>
            <View style={styles.lockCircle}>
                <Ionicons
                    name='lock-closed-outline'
                    size={46}
                    color={colors.green}
                />
            </View>
            <Text style={styles.visualBigTitle}>
                {t('settings.onDeviceOnly')}
            </Text>
            <View style={styles.securityRow}>
                <Ionicons
                    name='phone-portrait-outline'
                    size={20}
                    color={colors.green}
                />
                <Text style={styles.securityText}>
                    {t('onboarding.security.visual')}
                </Text>
            </View>
        </View>
    );
}

export default function OnboardingScreen({ onFinish, saving }) {
    const { width } = useWindowDimensions();
    const { t } = useLanguage();
    const listRef = useRef(null);
    const [index, setIndex] = useState(0);
    const isLast = index === slides.length - 1;

    const goNext = () => {
        if (isLast) {
            onFinish();
            return;
        }

        listRef.current?.scrollToIndex({
            index: index + 1,
            animated: true
        });
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.topBar}>
                <Text style={styles.appName}>{t('common.appName')}</Text>
                {!isLast ? (
                    <TouchableOpacity onPress={onFinish}>
                        <Text style={styles.skipText}>
                            {t('onboarding.skip')}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.skipSpace} />
                )}
            </View>

            <FlatList
                ref={listRef}
                data={slides}
                keyExtractor={(item) => item.titleKey}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const nextIndex = Math.round(
                        event.nativeEvent.contentOffset.x / width
                    );
                    setIndex(nextIndex);
                }}
                getItemLayout={(_, itemIndex) => ({
                    length: width,
                    offset: width * itemIndex,
                    index: itemIndex
                })}
                renderItem={({ item }) => (
                    <View style={[styles.slide, { width }]}>
                        <View style={styles.iconCircle}>
                            {item.visual === 'intro' ? (
                                <Image
                                    source={appLogo}
                                    style={styles.logoIcon}
                                />
                            ) : (
                                <Ionicons
                                    name={item.icon}
                                    size={24}
                                    color={colors.accent}
                                />
                            )}
                        </View>
                        <Text style={styles.title}>{t(item.titleKey)}</Text>
                        <Text style={styles.subtitle}>{t(item.textKey)}</Text>

                        <View style={styles.visualWrap}>
                            <Visual type={item.visual} />
                        </View>
                    </View>
                )}
            />

            <View style={styles.footer}>
                <View style={styles.dots}>
                    {slides.map((slide, dotIndex) => (
                        <View
                            key={slide.titleKey}
                            style={[
                                styles.dot,
                                index === dotIndex && styles.dotActive
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.button, saving && styles.buttonDisabled]}
                    onPress={goNext}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color='#1a1200' />
                    ) : (
                        <>
                            <Text style={styles.buttonText}>
                                {isLast
                                    ? t('onboarding.getStarted')
                                    : t('onboarding.next')}
                            </Text>
                            <Ionicons
                                name='arrow-forward'
                                size={18}
                                color='#1a1200'
                            />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.bg
    },
    topBar: {
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.xl
    },
    appName: {
        color: colors.accent,
        fontSize: theme.font.lg,
        fontWeight: '700'
    },
    skipText: {
        color: colors.textMuted,
        fontSize: theme.font.md,
        fontWeight: '600'
    },
    skipSpace: {
        width: 42
    },
    slide: {
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.md,
        alignItems: 'center'
    },
    visualWrap: {
        width: '100%',
        height: 320,
        justifyContent: 'center',
        marginTop: theme.spacing.xl
    },
    visualScreen: {
        width: '100%',
        minHeight: 292,
        justifyContent: 'center',
        backgroundColor: colors.bgCard,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        gap: theme.spacing.md
    },
    miniHeader: {
        marginBottom: theme.spacing.sm
    },
    miniApp: {
        color: colors.accent,
        fontSize: theme.font.lg,
        fontWeight: '700'
    },
    miniSub: {
        color: colors.textMuted,
        fontSize: theme.font.md,
        marginTop: 2
    },
    sectionLabel: {
        color: colors.textMuted,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    walletMark: {
        width: 96,
        height: 96,
        borderRadius: 24,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2b2416',
        marginBottom: theme.spacing.md
    },
    visualBigTitle: {
        color: colors.textPrimary,
        fontSize: theme.font.xl,
        fontWeight: '800',
        textAlign: 'center'
    },
    visualCenteredText: {
        color: colors.textMuted,
        fontSize: theme.font.base,
        lineHeight: 21,
        textAlign: 'center'
    },
    miniCard: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        gap: theme.spacing.sm
    },
    miniCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: theme.spacing.sm
    },
    miniDocType: {
        color: colors.textMuted,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.7
    },
    miniName: {
        color: colors.textPrimary,
        fontSize: theme.font.base,
        fontWeight: '700',
        marginTop: 3
    },
    miniUpload: {
        color: colors.accent,
        fontSize: theme.font.base,
        fontWeight: '700',
        marginTop: 6
    },
    statusPill: {
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 8,
        paddingVertical: 3
    },
    statusText: {
        fontSize: theme.font.sm,
        fontWeight: '700'
    },
    progressTrack: {
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.border,
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%'
    },
    accentButton: {
        minHeight: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accent,
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.md
    },
    accentButtonText: {
        color: '#1a1200',
        fontSize: theme.font.md,
        fontWeight: '800',
        textAlign: 'center'
    },
    viewerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    viewerBack: {
        color: colors.accent,
        fontSize: theme.font.md,
        fontWeight: '700',
        width: 42
    },
    viewerTitle: {
        color: colors.textPrimary,
        fontSize: theme.font.lg,
        fontWeight: '800'
    },
    docImageMock: {
        height: 90,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.border,
        borderRadius: theme.radius.md
    },
    infoPanel: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: theme.radius.md,
        overflow: 'hidden'
    },
    infoRow: {
        minHeight: 42,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border
    },
    infoLabel: {
        color: colors.textMuted,
        fontSize: theme.font.md
    },
    infoValue: {
        color: colors.textPrimary,
        fontSize: theme.font.md,
        fontWeight: '700'
    },
    actionRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm
    },
    smallAction: {
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: theme.radius.md,
        paddingVertical: theme.spacing.sm
    },
    smallActionText: {
        color: colors.textPrimary,
        fontSize: theme.font.md,
        fontWeight: '700'
    },
    smallActionPrimary: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.accent,
        borderRadius: theme.radius.md,
        paddingVertical: theme.spacing.sm
    },
    smallActionPrimaryText: {
        color: '#1a1200',
        fontSize: theme.font.md,
        fontWeight: '800'
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        borderWidth: 1,
        borderColor: colors.accent,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md
    },
    checkOn: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 7,
        backgroundColor: colors.accent
    },
    checkMark: {
        color: '#1a1200',
        fontSize: theme.font.md,
        fontWeight: '900'
    },
    checkTitle: {
        color: colors.textPrimary,
        fontSize: theme.font.base,
        fontWeight: '700'
    },
    checkSub: {
        color: colors.textMuted,
        fontSize: theme.font.sm,
        marginTop: 2
    },
    pdfConversion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: theme.radius.md,
        paddingVertical: theme.spacing.md
    },
    outlineButton: {
        minHeight: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.md
    },
    outlineButtonText: {
        color: colors.accent,
        fontSize: theme.font.md,
        fontWeight: '800',
        textAlign: 'center'
    },
    archiveItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md
    },
    archiveThumb: {
        width: 58,
        height: 42,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.border
    },
    archiveTitle: {
        color: colors.textPrimary,
        fontSize: theme.font.md,
        fontWeight: '700'
    },
    archiveSub: {
        color: colors.textMuted,
        fontSize: theme.font.sm,
        marginTop: 4
    },
    lockCircle: {
        width: 104,
        height: 104,
        borderRadius: 52,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a2a1e',
        borderWidth: 1,
        borderColor: colors.green + '66'
    },
    securityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        borderWidth: 1,
        borderColor: colors.green + '66',
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        backgroundColor: '#1a2a1e'
    },
    securityText: {
        flex: 1,
        color: colors.green,
        fontSize: theme.font.md,
        lineHeight: 19,
        fontWeight: '700'
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2b2416',
        marginBottom: theme.spacing.md
    },
    logoIcon: {
        width: 36,
        height: 36,
        borderRadius: 8
    },
    visualLogo: {
        width: 72,
        height: 72,
        borderRadius: 16
    },
    title: {
        color: colors.textPrimary,
        fontSize: 26,
        fontWeight: '800',
        lineHeight: 31,
        textAlign: 'center',
        marginBottom: theme.spacing.sm
    },
    subtitle: {
        color: colors.textMuted,
        fontSize: theme.font.base,
        lineHeight: 21,
        textAlign: 'center'
    },
    footer: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
        gap: theme.spacing.lg
    },
    dots: {
        flexDirection: 'row',
        alignSelf: 'center',
        gap: 7
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: colors.border
    },
    dotActive: {
        width: 22,
        backgroundColor: colors.accent
    },
    button: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        backgroundColor: colors.amber,
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.lg
    },
    buttonDisabled: {
        opacity: 0.65
    },
    buttonText: {
        color: '#1a1200',
        fontSize: theme.font.lg,
        fontWeight: '700'
    }
});
