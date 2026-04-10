import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/colors';

import HomeScreen from '../screens/HomeScreen';
import DocViewerScreen from '../screens/DocViewerScreen';
import UploadScreen from '../screens/UploadScreen';
import ShareScreen from '../screens/ShareScreen';
import ArchiveScreen from '../screens/ArchiveScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
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

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: colors.bg,
                        borderTopColor: colors.border
                    },
                    tabBarActiveTintColor: colors.accent,
                    tabBarInactiveTintColor: colors.textMuted
                }}
            >
                <Tab.Screen
                    name='Wallet'
                    component={HomeStack}
                />
                <Tab.Screen
                    name='Share'
                    component={ShareScreen}
                />
                <Tab.Screen
                    name='Archive'
                    component={ArchiveScreen}
                />
                <Tab.Screen
                    name='Settings'
                    component={SettingsScreen}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
