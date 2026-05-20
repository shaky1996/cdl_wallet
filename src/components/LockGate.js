import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Modal
} from 'react-native';

import { useBiometrics } from '../hooks/useBiometrics';
import { colors } from '../constants/colors';
import { useLanguage } from '../i18n/LanguageContext';

export default function LockGate({ children }) {
    const { isLocked, isChecking, authenticate } = useBiometrics();
    const { t } = useLanguage();

    if (isChecking) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: colors.bgBody
                }}
            >
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <>
            {children}

            <Modal
                visible={isLocked}
                animationType='fade'
                presentationStyle='fullScreen'
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: colors.bgBody
                    }}
                >
                    <Text
                        style={{
                            color: '#fff',
                            fontSize: 22,
                            marginBottom: 20
                        }}
                    >
                        {t('lock.unlock')}
                    </Text>

                    <TouchableOpacity
                        onPress={authenticate}
                        style={{
                            backgroundColor: '#F5A623',
                            padding: 14,
                            borderRadius: 12
                        }}
                    >
                        <Text
                            style={{
                                color: '#111',
                                fontWeight: '700'
                            }}
                        >
                            {t('lock.useFaceId')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </>
    );
}
