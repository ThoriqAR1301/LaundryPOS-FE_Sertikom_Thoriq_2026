import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { setItem } from '../services/storage';
import { login } from '../services/api';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);
    const [passFocus, setPassFocus] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const shakeAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const scaleAnim = useRef(new Animated.Value(0.92)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        ]).start();
    }, []);

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 12, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
        ]).start();
    };

    const handleLogin = async () => {
        setErrorMsg('');

        const emailValue = email.trim();
        const passwordValue = password.trim();

        if (!emailValue) {
            setErrorMsg('Email Tidak Boleh Kosong');
            shake(); return;
        }
        if (!passwordValue) {
            setErrorMsg('Password Tidak Boleh Kosong');
            shake(); return;
        }

        setLoading(true);
        try {
            const res = await login(emailValue, passwordValue);

            const data = res.data;
            const payload = data?.data || data;
            const token = payload?.token || payload?.access_token || payload?.auth_token || data?.token || data?.access_token;
            const user = payload?.user || payload?.customer || payload;
            const role = (user?.role || user?.type || user?.role_name || user?.level || user?.customer?.role || '').toString().toLowerCase();
            const customerProfile = !!user?.customer || !!payload?.customer || !!payload?.user?.customer;
            const isCustomer = ['customer', 'pelanggan'].includes(role) || customerProfile;

            if (!token) {
                setErrorMsg('Login Gagal. Token Tidak Diterima Dari Server');
                shake(); setLoading(false); return;
            }
            if (!isCustomer) {
                setErrorMsg('Akses Ditolak. Halaman Ini Hanya Untuk Pelanggan');
                shake(); setLoading(false); return;
            }

            await setItem('token', token);
            await setItem('user', JSON.stringify(user));

            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } catch (error) {
            const serverData = error.response?.data;
            const serverMessage = serverData?.message || serverData?.error || (Array.isArray(serverData?.errors) ? Object.values(serverData.errors).flat().join('\n') : undefined) || (typeof serverData === 'string' ? serverData : undefined);
            const status     = error.response?.status;
            const requestUrl = error.response?.config?.url || 'unknown URL';
            const msg = status === 404 ? `Endpoint Tidak Ditemukan : ${requestUrl}` : serverMessage || (status ? `Server Error ${status}` : error.message) || 'Login Gagal. Periksa Email Dan Password Anda';

            setErrorMsg(msg);
            shake();
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="light-content" backgroundColor="#060d1a" />

            <LinearGradient
                colors={['#060d1a', '#0d1f3c', '#0f2952', '#0c3a6e']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />

            <View style={[dec.circle, { width: 320, height: 320, top: -120, right: -100, backgroundColor: 'rgba(59,130,246,0.06)' }]} />
            <View style={[dec.circle, { width: 200, height: 200, top: height * 0.35, left: -80, backgroundColor: 'rgba(6,182,212,0.05)' }]} />
            <View style={[dec.circle, { width: 150, height: 150, bottom: 60, right: -50, backgroundColor: 'rgba(139,92,246,0.07)' }]} />

            <View style={dec.lightLine1} />
            <View style={dec.lightLine2} />

            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[styles.inner, {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                }]}>

                    <View style={styles.logoSection}>
                        <LinearGradient
                            colors={['#3b82f6', '#06b6d4']}
                            style={styles.logoBox}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="shirt" size={38} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.brand}>LaundryPOS</Text>
                        <Text style={styles.tagline}>Pantau Status Cucian Anda</Text>

                        <View style={styles.dotRow}>
                            {[0,1,2].map(i => (
                                <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
                            ))}
                        </View>
                    </View>

                    <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>

                        <LinearGradient
                            colors={['rgba(56,189,248,0.3)', 'rgba(139,92,246,0.15)', 'rgba(56,189,248,0.05)']}
                            style={styles.cardGlowBorder}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        />

                        <View style={styles.cardInner}>
                            <Text style={styles.cardTitle}>Selamat Datang! 👋</Text>
                            <Text style={styles.cardSubtitle}>Masuk Ke Akun Pelanggan Anda</Text>

                            {errorMsg !== '' && (
                                <View style={styles.errorBox}>
                                    <View style={styles.errorIcon}>
                                        <Ionicons name="alert-circle" size={18} color="#f87171" />
                                    </View>
                                    <Text style={styles.errorText} numberOfLines={3}>{errorMsg}</Text>
                                </View>
                            )}

                            <View style={styles.fieldWrap}>
                                <Text style={styles.fieldLabel}>
                                    <Ionicons name="mail-outline" size={10} color="#64748b" /> EMAIL
                                </Text>
                                <View style={[styles.inputWrap, emailFocus && styles.inputFocus]}>
                                    <View style={[styles.inputIconWrap, emailFocus && { backgroundColor: 'rgba(56,189,248,0.15)' }]}>
                                        <Ionicons name="mail-outline" size={16} color={emailFocus ? '#38bdf8' : '#475569'} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="email@contoh.com"
                                        placeholderTextColor="#2d3f55"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        value={email}
                                        onChangeText={setEmail}
                                        onFocus={() => setEmailFocus(true)}
                                        onBlur={() => setEmailFocus(false)}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldWrap}>
                                <Text style={styles.fieldLabel}>
                                    <Ionicons name="lock-closed-outline" size={10} color="#64748b" /> PASSWORD
                                </Text>
                                <View style={[styles.inputWrap, passFocus && styles.inputFocus]}>
                                    <View style={[styles.inputIconWrap, passFocus && { backgroundColor: 'rgba(56,189,248,0.15)' }]}>
                                        <Ionicons name="lock-closed-outline" size={16} color={passFocus ? '#38bdf8' : '#475569'} />
                                    </View>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="••••••••"
                                        placeholderTextColor="#2d3f55"
                                        secureTextEntry={!showPass}
                                        autoCapitalize="none"
                                        value={password}
                                        onChangeText={setPassword}
                                        onFocus={() => setPassFocus(true)}
                                        onBlur={() => setPassFocus(false)}
                                    />
                                    <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                                        <Ionicons
                                            name={showPass ? 'eye-off-outline' : 'eye-outline'}
                                            size={18}
                                            color="#334155"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.btnLogin, loading && styles.btnDisabled]}
                                onPress={handleLogin}
                                disabled={loading}
                                activeOpacity={0.88}
                            >
                                <LinearGradient
                                    colors={loading ? ['#1e293b','#1e293b'] : ['#1d4ed8','#0ea5e9']}
                                    style={styles.btnGradient}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <>
                                            <Ionicons name="log-in-outline" size={18} color="#fff" />
                                            <Text style={styles.btnText}>Masuk Sekarang</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                        </View>
                    </Animated.View>

                    <Text style={styles.footer}>© {new Date().getFullYear()} LaundryPOS. All Rights Reserved</Text>

                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const dec = StyleSheet.create({
    circle: { position: 'absolute', borderRadius: 999 },
    lightLine1: {
        position: 'absolute', width: 1, height: height * 0.5,
        backgroundColor: 'rgba(56,189,248,0.06)',
        top: 0, left: width * 0.3,
        transform: [{ rotate: '15deg' }],
    },
    lightLine2: {
        position: 'absolute', width: 1, height: height * 0.4,
        backgroundColor: 'rgba(139,92,246,0.05)',
        bottom: 0, right: width * 0.25,
        transform: [{ rotate: '-20deg' }],
    },
});

const styles = StyleSheet.create({
    scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
    inner: { width: '100%' },

    logoSection: { alignItems: 'center', marginBottom: 36 },
    logoGlow: {
        position: 'absolute', top: -10,
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(59,130,246,0.2)',
    },
    logoBox: {
        width: 80, height: 80, borderRadius: 24,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.6, shadowRadius: 20, elevation: 16,
    },
    brand: { fontSize: 30, fontWeight: '800', color: '#f1f5f9', letterSpacing: -0.5, marginBottom: 6 },
    tagline: { fontSize: 13, color: '#64748b', marginBottom: 16 },
    dotRow: { flexDirection: 'row', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1e3a5f' },
    dotActive : { width: 18, backgroundColor: '#38bdf8' },

    card : {
        borderRadius: 28,
        marginBottom: 28,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5, shadowRadius: 30, elevation: 20,
    },
    cardGlowBorder: {
        position: 'absolute', inset: 0,
        borderRadius: 28, padding: 1.5,
    },
    cardInner: {
        backgroundColor: 'rgba(14,26,48,0.92)',
        borderRadius: 28,
        padding: 26,
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.18)',
        margin: 1,
    },
    cardTitle: { fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 4 },
    cardSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 22 },

    errorBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderRadius: 14, padding: 14, marginBottom: 18,
        borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
        borderLeftWidth: 3, borderLeftColor: '#ef4444',
    },
    errorIcon: {
        width: 28, height: 28, borderRadius: 8,
        backgroundColor: 'rgba(239,68,68,0.15)',
        alignItems: 'center', justifyContent: 'center',
    },
    errorText : { color: '#fca5a5', fontSize: 12, flex: 1, lineHeight: 30 },

    fieldWrap: { marginBottom: 18 },
    fieldLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', letterSpacing: 1.2, marginBottom: 8 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        overflow: 'hidden',
        height: 54,
    },
    inputFocus: {
        borderColor: 'rgba(56,189,248,0.5)',
        backgroundColor: 'rgba(56,189,248,0.04)',
    },
    inputIconWrap: {
        width: 46, height: '100%',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.06)',
    },
    input: { flex: 1, color: '#e2e8f0', fontSize: 14, paddingHorizontal: 14 },
    eyeBtn: { paddingHorizontal: 14 },

    btnLogin: {
        borderRadius: 16, overflow: 'visible',
        marginTop: 6, position: 'relative',
    },
    btnDisabled: { opacity: 0.6 },
    btnGradient: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 10,
        paddingVertical: 16, borderRadius: 16,
    },
    btnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 },
    btnGlow: {
        position: 'absolute', bottom: -8,
        left: '20%', right: '20%', height: 16,
        backgroundColor: 'rgba(29,78,216,0.4)',
        borderRadius: 8,
    },

    footer: { textAlign: 'center', color: '#64748b', fontSize: 11 },
});