import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getItem } from '../services/storage';

import OnBoardingScreen from '../screens/OnBoardingScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import DetailScreen from '../screens/DetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabBarIcon({ route, focused, color }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.82, duration: 90, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
        ]).start();
    }, [focused]);

    const icons = {
        Dashboard: { active: 'shirt', inactive: 'shirt-outline' },
        Profile: { active: 'person-circle', inactive: 'person-circle-outline' },
    };

    const iconName = focused
        ? icons[route.name]?.active
        : icons[route.name]?.inactive;

    return (
        <Animated.View style={[tb.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
            {focused && <View style={tb.activeGlow} />}
            <Ionicons name={iconName} size={focused ? 24 : 22} color={color} />
        </Animated.View>
    );
}

function TabBarLabel({ label, focused }) {
    return (
        <Text style={[tb.label, focused && tb.labelActive]}>{label}</Text>
    );
}

const tb = StyleSheet.create({
    iconWrap: { alignItems: 'center', justifyContent: 'center', width: 44, height: 36, borderRadius: 12, position: 'relative' },
    activeGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12, backgroundColor: 'rgba(56,189,248,0.1)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.15)' },
    label: { fontSize: 10, fontWeight: '600', color: '#334155', marginTop: 7.5, letterSpacing: 0.3 },
    labelActive: { color: '#38bdf8', fontWeight: '700' },
});

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#060d1a',
                    borderTopColor: 'rgba(255,255,255,0.06)',
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 82 : 66,
                    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
                    paddingTop: 8,
                    paddingHorizontal: 16,
                    elevation: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                },
                tabBarActiveTintColor: '#38bdf8',
                tabBarInactiveTintColor: '#334155',
                tabBarIcon: ({ focused, color }) => (
                    <TabBarIcon route={route} focused={focused} color={color} />
                ),
                tabBarLabel: ({ focused }) => {
                    const labels = { Dashboard: 'Cucian Saya', Profile: 'Profil' };
                    return <TabBarLabel label={labels[route.name]} focused={focused} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

function LoadingScreen() {
    const pulseAnim = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.6, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={ls.screen}>
            <LinearGradient
                colors={['#060d1a', '#0d1f3c', '#0f2952']}
                style={ls.gradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
                <View style={[ls.bubble, { width: 200, height: 200, top: -80, right: -60 }]} />
                <View style={[ls.bubble, { width: 120, height: 120, bottom: -40, left: -40 }]} />

                <Animated.View style={[ls.logoWrap, { opacity: pulseAnim }]}>
                    <LinearGradient
                        colors={['#1d4ed8', '#3b82f6', '#38bdf8']}
                        style={ls.logoBox}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="shirt" size={32} color="#fff" />
                    </LinearGradient>
                </Animated.View>

                <Text style={ls.brand}>LaundryPOS</Text>
                <Text style={ls.tagline}>Memuat Aplikasi...</Text>
                <ActivityIndicator size="small" color="#38bdf8" style={{ marginTop: 24 }} />
            </LinearGradient>
        </View>
    );
}

const ls = StyleSheet.create({
    screen: { flex: 1 },
    gradient: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
    bubble: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.04)' },
    logoWrap: { marginBottom: 16 },
    logoBox: {
        width: 72, height: 72, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5, shadowRadius: 20, elevation: 14,
    },
    brand: { color: '#f1f5f9', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    tagline: { color: '#475569', fontSize: 13, marginTop: 6 },
});

export default function AppNavigator() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [onboardingDone, setOnboardingDone] = useState(false);

    useEffect(() => {
        checkInitialState();
    }, []);

    const checkInitialState = async () => {
        try {
            const [token, obDone] = await Promise.all([
                getItem('token'),
                getItem('onboarding_done'),
            ]);
            setIsAuthenticated(!!token);
            setOnboardingDone(obDone === 'true');
        } catch {
            setIsAuthenticated(false);
            setOnboardingDone(false);
        } finally {
            setIsLoading(false);
        }
    };

    const getInitialRoute = () => {
        if (!onboardingDone) return 'OnBoarding';
        if (isAuthenticated) return 'Main';
        return 'Login';
    };

    if (isLoading) return <LoadingScreen />;

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={getInitialRoute()}
            >
                <Stack.Screen name="OnBoarding" component={OnBoardingScreen} options={{ animation: 'fade' }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
                <Stack.Screen name="Main" component={MainTabs} options={{ animation: 'fade' }} />
                <Stack.Screen name="Detail" component={DetailScreen} options={{ animation: 'slide_from_right' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}