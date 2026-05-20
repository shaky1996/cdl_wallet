import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import DocViewerScreen from '../screens/DocViewerScreen';
import UploadScreen from '../screens/UploadScreen';
import ShareScreen from '../screens/ShareScreen';
import ArchiveScreen from '../screens/ArchiveScreen';
import ArchivedDocViewerScreen from '../screens/ArchivedDocViewerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LockGate from '../components/LockGate';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useLanguage } from '../i18n/LanguageContext';



const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const ONBOARDING_KEY = 'cdl_onboarding_complete';

function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                animation: 'slide_from_right',
                gestureEnabled: true,
                headerShown: false
            }}
        >
            <Stack.Screen
                name='Home'
                component={HomeScreen}
            />
            <Stack.Screen
                name='DocViewer'
                component={DocViewerScreen}
            />
            <Stack.Screen
                name='Upload'
                component={UploadScreen}
            />
        </Stack.Navigator>
    );
}

function Tabs() {
    const { t } = useLanguage();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.bg,
                    borderTopColor: colors.border
                },
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textMuted,
                lazy: true,
                unmountOnBlur: false,
                tabBarIcon: ({ color, size }) => {
                    let iconName;

                    if (route.name === 'Wallet') {
                        iconName = 'wallet-outline';
                    } else if (route.name === 'Share') {
                        iconName = 'share-outline';
                    } else if (route.name === 'Archive') {
                        iconName = 'archive-outline';
                    } else if (route.name === 'Settings') {
                        iconName = 'settings-outline';
                    }

                    return (
                        <Ionicons
                            name={iconName}
                            size={size}
                            color={color}
                        />
                    );
                }
            })}
        >
            <Tab.Screen
                name='Wallet'
                component={HomeStack}
                options={{ tabBarLabel: t('tabs.wallet') }}
            />
            <Tab.Screen
                name='Share'
                component={ShareScreen}
                options={{ tabBarLabel: t('tabs.share') }}
            />
            <Tab.Screen
                name='Archive'
                component={ArchiveScreen}
                options={{ tabBarLabel: t('tabs.archive') }}
            />
            <Tab.Screen
                name='Settings'
                component={SettingsScreen}
                options={{ tabBarLabel: t('tabs.settings') }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const [checkingOnboarding, setCheckingOnboarding] = useState(true);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [savingOnboarding, setSavingOnboarding] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(ONBOARDING_KEY)
            .then((value) => setOnboardingComplete(value === 'true'))
            .finally(() => setCheckingOnboarding(false));
    }, []);

    const handleFinishOnboarding = async () => {
        setSavingOnboarding(true);

        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            setOnboardingComplete(true);
        } finally {
            setSavingOnboarding(false);
        }
    };

    return (
        <SafeAreaProvider>
                    

            <NavigationContainer>
                {checkingOnboarding ? (
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.bgBody
                        }}
                    >
                        <ActivityIndicator color={colors.accent} />
                    </View>
                ) : onboardingComplete ? (
                    <LockGate>
                        <RootStack.Navigator
                            screenOptions={{ headerShown: false }}
                        >
                            {/* MAIN APP */}
                            <RootStack.Screen
                                name='Tabs'
                                component={Tabs}
                            />

                            {/* GLOBAL DETAIL SCREEN (FIX) */}
                            <RootStack.Screen
                                name='ArchivedDocViewer'
                                component={ArchivedDocViewerScreen}
                            />
                            <RootStack.Screen
                                name='ArchiveUpload'
                                component={UploadScreen}
                            />
                        </RootStack.Navigator>
                    </LockGate>
                ) : (
                    <OnboardingScreen
                        onFinish={handleFinishOnboarding}
                        saving={savingOnboarding}
                    />
                )}
            </NavigationContainer>
            
        </SafeAreaProvider>
    );
}
