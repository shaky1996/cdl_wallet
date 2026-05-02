import { theme } from '../styles/theme'

export const STATUS_CONFIG = {
    valid: {
        label: 'Valid',
        bg: theme.colors.green + '33',
        border: theme.colors.green,
        text: theme.colors.green
    },
    expiring: {
        label: 'Expiring soon',
        bg: theme.colors.amber + '33',
        border: theme.colors.amber,
        text: theme.colors.amber
    },
    critical: {
        label: 'Almost expired',
        bg: theme.colors.red + '33',
        border: theme.colors.red,
        text: theme.colors.red
    },
    expired: {
        label: 'Expired',
        bg: theme.colors.red + '33',
        border: theme.colors.red,
        text: theme.colors.red
    },
    archived: {
        label: 'Archived',
        bg: theme.colors.amber + '33',
        border: theme.colors.amber,
        text: theme.colors.amber
    }
};