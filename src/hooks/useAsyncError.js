import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

// Wraps async operations with consistent error handling + user feedback
export const useAsyncError = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const run = useCallback(async (asyncFn, options = {}) => {
        const {
            onSuccess,
            errorMessage = 'Something went wrong. Please try again.',
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
            if (showAlert) Alert.alert('Error', e.message || errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, run };
};
