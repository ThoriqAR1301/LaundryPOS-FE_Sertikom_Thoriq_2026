import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';

import AppNavigator from './app/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
    const [fontsLoaded, fontError] = Font.useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_800ExtraBold,
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded || fontError) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <SafeAreaProvider onLayout={onLayoutRootView}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#060d1a"
                translucent={false}
            />
            <AppNavigator />
        </SafeAreaProvider>
    );
}