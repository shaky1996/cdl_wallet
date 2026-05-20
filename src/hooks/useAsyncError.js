import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';

// Wraps async operations with consistent error handling + user feedback
export const useAsyncError = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const run = useCallback(async (asyncFn, options = {}) => {
        const {
            onSuccess,
            errorMessage = t('common.genericError'),
            showAlert = true
        } = options;

        setLoading(true);
        setError(null);

        try {
            const result = await asyncFn();
            if (onSuccess) onSuccess(result);
            return result;
        } catch (e) {
            console.error(e);
            setError(e.message);
            if (showAlert) Alert.alert(t('common.error'), e.message || errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, [t]);

    return { loading, error, run };
};
