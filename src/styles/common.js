import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const common = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.bg
    },
    screenBody: {
        flex: 1,
        backgroundColor: theme.colors.bgBody,
        padding: theme.spacing.lg
    },
    sectionLabel: {
        color: theme.colors.textMuted,
        fontSize: theme.font.sm,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: theme.spacing.sm
    },
    card: {
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.radius.lg,
        borderWidth: 0.5,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg
    },
    primaryBtn: {
        backgroundColor: theme.colors.accent,
        borderRadius: theme.radius.md,
        padding: theme.spacing.lg,
        alignItems: 'center'
    },
    primaryBtnText: {
        color: '#1a1200',
        fontSize: theme.font.lg,
        fontWeight: '600'
    },
    divider: {
        height: 0.5,
        backgroundColor: theme.colors.border,
        marginVertical: theme.spacing.sm
    }
});
