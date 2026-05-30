
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getItem, setItem, multiRemove } from '../services/storage';
import { getProfile, updateProfile, logout } from '../services/api';


function parseUserData(raw) {
    const u = raw?.user ?? raw?.data?.user ?? raw?.data ?? raw ?? {};
    const c = u.customer ?? u.profile ?? {};
    return {
        id: u.id,
        name: u.name || '',
        email: u.email || '',
        created_at: u.created_at || '',
        phone: c.phone ?? u.phone ?? '',
        address: c.address ?? u.address ?? '',
        plain_password: u.plain_password ?? c.plain_password ?? u.password_plain ?? null,
        customer: c,
    };
}


function InfoCard({ icon, iconBg, iconColor, label, value, isLast }) {
    return (
        <View style={[ic.row, !isLast && ic.border]}>
            <View style={[ic.iconWrap, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={15} color={iconColor} />
            </View>
            <View style={ic.textWrap}>
                <Text style={ic.label}>{label}</Text>
                <Text style={ic.value} numberOfLines={3}>{value || '-'}</Text>
            </View>
        </View>
    );
}
const ic = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 13 },
    border: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
    iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
    textWrap: { flex: 1 },
    label: { fontSize: 10, color: '#64748b', fontWeight: '700', letterSpacing: 0.5, marginBottom: 3, textTransform: 'uppercase' },
    value: { fontSize: 14, color: '#e2e8f0', fontWeight: '600', lineHeight: 20 },
});


function EditField({ label, icon, iconColor, value, onChangeText, placeholder, multiline, keyboardType }) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={ef.wrap}>
            <Text style={ef.label}>{label}</Text>
            <View style={[ef.inputWrap, focused && ef.focused, multiline && { alignItems: 'flex-start' }]}>
                <Ionicons
                    name={icon} size={15}
                    color={focused ? iconColor : '#475569'}
                    style={[ef.icon, multiline && { marginTop: 14 }]}
                />
                <TextInput
                    style={[ef.input, multiline && { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#334155"
                    multiline={multiline}
                    keyboardType={keyboardType || 'default'}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    autoCapitalize="none"
                />
            </View>
        </View>
    );
}
const ef = StyleSheet.create({
    wrap: { marginBottom: 14 },
    label: { fontSize: 10, fontWeight: '700', color: '#64748b', letterSpacing: 0.8, marginBottom: 7, textTransform: 'uppercase' },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#060d1a', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, minHeight: 50 },
    focused: { borderColor: 'rgba(56,189,248,0.5)', backgroundColor: 'rgba(56,189,248,0.04)' },
    icon: { marginRight: 10 },
    input: { flex: 1, color: '#f1f5f9', fontSize: 14, paddingVertical: 12 },
});


export default function ProfileScreen({ navigation }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [showPass, setShowPass] = useState(false);

    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        fetchProfile();
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]).start();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res  = await getProfile();
            console.log('RAW PROFILE RESPONSE:', JSON.stringify(res.data, null, 2));
            const data = parseUserData(res.data);
            console.log('PARSED plain_password:', data.plain_password);
            setUserData(data);
            setName(data.name);
            setPhone(data.phone);
            setAddress(data.address);
            
            await setItem('user', JSON.stringify(res.data?.user ?? res.data?.data ?? res.data ?? {}));
        } catch {
            
            const stored = await getItem('user');
            if (stored) {
                const raw = JSON.parse(stored);
                const data = parseUserData(raw);
                setUserData(data);
                setName(data.name);
                setPhone(data.phone);
                setAddress(data.address);
            }
        } finally {
            setLoading(false);
        }
    };

    const openEdit = () => {
        setSuccessMsg('');
        setErrorMsg('');
        setEditMode(true);
    };

    const cancelEdit = () => {
        if (userData) {
            setName(userData.name);
            setPhone(userData.phone);
            setAddress(userData.address);
        }
        setErrorMsg('');
        setEditMode(false);
    };

    const handleSave = async () => {
        setErrorMsg('');
        setSuccessMsg('');
        if (!name.trim()) { setErrorMsg('Nama Tidak Boleh Kosong'); return; }
        if (!phone.trim()) { setErrorMsg('Nomor HP Tidak Boleh Kosong'); return; }
        if (!address.trim()) { setErrorMsg('Alamat Tidak Boleh Kosong'); return; }

        setSaving(true);
        try {
            await updateProfile({ name: name.trim(), phone: phone.trim(), address: address.trim() });
            const updated = { ...userData, name: name.trim(), phone: phone.trim(), address: address.trim() };
            setUserData(updated);
            setSuccessMsg('Profil Berhasil Diperbarui!');
            setEditMode(false);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Gagal Menyimpan Perubahan');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Keluar Dari Aplikasi?',
            'Anda Akan Keluar Dari Akun Ini',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text    : 'Ya, Keluar',
                    style   : 'destructive',
                    onPress : async () => {
                        setLoggingOut(true);
                        try { await logout(); } catch { /* ignore */ }
                        finally {
                            await multiRemove(['token', 'user']);
                            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingWrap}>
                <StatusBar barStyle="light-content" backgroundColor="#060d1a" />
                <LinearGradient colors={['#0f172a', '#1e3a5f']} style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#38bdf8" />
                    <Text style={styles.loadingText}>Memuat Profil...</Text>
                </LinearGradient>
            </View>
        );
    }

    const initial = userData?.name?.charAt(0).toUpperCase() || '?';
    const plainPass = userData?.plain_password ?? userData?.customer?.plain_password ?? null;
    const displayPass = plainPass ?? null;

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.screen}>
                <StatusBar barStyle="light-content" backgroundColor="#060d1a" />

                <Animated.ScrollView
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    
                    <LinearGradient
                        colors={['#060d1a', '#0d1f3c', '#0f2952', '#0c3a6e']}
                        style={styles.header}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    >
                        <View style={[styles.bubble, { width: 180, height: 180, top: -70, right: -60, opacity: 0.06 }]} />
                        <View style={[styles.bubble, { width: 100, height: 100, bottom: -30, left: -30, opacity: 0.05 }]} />

                        
                        <View style={styles.avatarWrap}>
                            <LinearGradient
                                colors={['#5b21b6', '#7c3aed', '#a855f7']}
                                style={styles.avatar}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.avatarText}>{initial}</Text>
                            </LinearGradient>
                            <View style={styles.onlineDot} />
                        </View>

                        <Text style={styles.headerName}>{userData?.name || '-'}</Text>
                        <Text style={styles.headerEmail}>{userData?.email || '-'}</Text>

                        <View style={styles.roleBadge}>
                            <Ionicons name="person-circle-outline" size={12} color="#7c3aed" />
                            <Text style={styles.roleText}>Customer</Text>
                        </View>
                    </LinearGradient>

                    
                    {successMsg !== '' && (
                        <View style={styles.successBox}>
                            <Ionicons name="checkmark-circle" size={16} color="#34d399" />
                            <Text style={styles.successText}>{successMsg}</Text>
                        </View>
                    )}
                    {errorMsg !== '' && (
                        <View style={styles.errorBox}>
                            <Ionicons name="alert-circle" size={16} color="#f87171" />
                            <Text style={styles.errorText}>{errorMsg}</Text>
                        </View>
                    )}

                    
                    {!editMode && (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.cardIcon, { backgroundColor: 'rgba(124,58,237,0.15)' }]}>
                                    <Ionicons name="person-outline" size={14} color="#a78bfa" />
                                </View>
                                <Text style={styles.cardTitle}>Informasi Akun</Text>
                                <TouchableOpacity style={styles.editBtn} onPress={openEdit}>
                                    <Ionicons name="create-outline" size={13} color="#38bdf8" />
                                    <Text style={styles.editBtnText}>Edit</Text>
                                </TouchableOpacity>
                            </View>

                            <InfoCard
                                icon="person-outline"
                                iconBg="rgba(124,58,237,0.15)" iconColor="#a78bfa"
                                label="Nama Lengkap"
                                value={userData?.name}
                            />
                            <InfoCard
                                icon="mail-outline"
                                iconBg="rgba(59,130,246,0.15)" iconColor="#60a5fa"
                                label="Email"
                                value={userData?.email}
                            />
                            <InfoCard
                                icon="logo-whatsapp"
                                iconBg="rgba(16,185,129,0.15)" iconColor="#34d399"
                                label="No. WhatsApp"
                                value={userData?.phone}
                            />
                            <InfoCard
                                icon="map-outline"
                                iconBg="rgba(249,115,22,0.15)" iconColor="#fb923c"
                                label="Alamat"
                                value={userData?.address}
                            />
                            <InfoCard
                                icon="calendar-outline"
                                iconBg="rgba(100,116,139,0.15)" iconColor="#94a3b8"
                                label="Terdaftar Sejak"
                                value={userData?.created_at
                                    ? new Date(userData.created_at).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' })
                                    : '-'}
                                isLast
                            />
                        </View>
                    )}

                    
                    {editMode && (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.cardIcon, { backgroundColor: 'rgba(56,189,248,0.15)' }]}>
                                    <Ionicons name="create-outline" size={14} color="#38bdf8" />
                                </View>
                                <Text style={styles.cardTitle}>Edit Profil</Text>
                                <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                                    <Ionicons name="close-outline" size={13} color="#94a3b8" />
                                    <Text style={styles.cancelBtnText}>Batal</Text>
                                </TouchableOpacity>
                            </View>

                            <EditField
                                label="Nama Lengkap"
                                icon="person-outline" iconColor="#a78bfa"
                                value={name} onChangeText={setName}
                                placeholder="Nama Lengkap Anda"
                            />
                            <EditField
                                label="No. WhatsApp"
                                icon="logo-whatsapp" iconColor="#34d399"
                                value={phone} onChangeText={setPhone}
                                placeholder="08xxxxxxxxxx"
                                keyboardType="phone-pad"
                            />
                            <EditField
                                label="Alamat"
                                icon="map-outline" iconColor="#fb923c"
                                value={address} onChangeText={setAddress}
                                placeholder="Alamat Lengkap Anda"
                                multiline
                            />

                            <View style={styles.emailNote}>
                                <Ionicons name="information-circle-outline" size={13} color="#475569" />
                                <Text style={styles.emailNoteText}>Email Tidak Dapat Diubah</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                                onPress={handleSave}
                                disabled={saving}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={saving ? ['#1e293b','#1e293b'] : ['#0369a1','#0ea5e9']}
                                    style={styles.saveBtnInner}
                                    start={{ x:0, y:0 }} end={{ x:1, y:0 }}
                                >
                                    {saving
                                        ? <ActivityIndicator color="#fff" size="small" />
                                        : <>
                                            <Ionicons name="save-outline" size={15} color="#fff" />
                                            <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
                                          </>
                                    }
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.cardIcon, { backgroundColor: 'rgba(217,119,6,0.15)' }]}>
                                <Ionicons name="shield-checkmark-outline" size={14} color="#fbbf24" />
                            </View>
                            <Text style={styles.cardTitle}>Keamanan</Text>
                        </View>

                        
                        <View style={styles.passRow}>
                            <View style={[styles.passIconWrap, { backgroundColor: 'rgba(217,119,6,0.12)' }]}>
                                <Ionicons name="lock-closed-outline" size={14} color="#fbbf24" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.passLabel}>Password</Text>
                                <Text style={styles.passValue}>
                                    {showPass
                                        ? (displayPass || '(Password Tidak Tersedia)')
                                        : '••••••••'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowPass(!showPass)}
                                style={styles.passToggleBtn}
                                activeOpacity={0.75}
                            >
                                <Ionicons
                                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                                    size={17}
                                    color={showPass ? '#38bdf8' : '#475569'}
                                />
                            </TouchableOpacity>
                        </View>

                        
                        <View style={styles.securityNote}>
                            <Ionicons name="information-circle-outline" size={12} color="#64748b" />
                            <Text style={styles.securityNoteText}>
                                Jaga Kerahasiaan Password Anda Dan Jangan Bagikan Ke Siapapun
                            </Text>
                        </View>
                    </View>

                    
                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={handleLogout}
                        disabled={loggingOut}
                        activeOpacity={0.8}
                    >
                        {loggingOut
                            ? <ActivityIndicator color="#ef4444" size="small" />
                            : <>
                                <View style={styles.logoutIconWrap}>
                                    <Ionicons name="log-out-outline" size={17} color="#ef4444" />
                                </View>
                                <Text style={styles.logoutText}>Keluar Dari Akun</Text>
                                <Ionicons name="chevron-forward" size={15} color="rgba(239,68,68,0.4)" />
                              </>
                        }
                    </TouchableOpacity>

                    <Text style={styles.footer}>© {new Date().getFullYear()} LaundryPOS · v1.0.0</Text>

                </Animated.ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#060d1a' },
    scrollContent: { paddingBottom: 36 },

    
    loadingWrap: { flex: 1, backgroundColor: '#060d1a', justifyContent: 'center', alignItems: 'center', padding: 24 },
    loadingBox: { borderRadius: 24, padding: 36, alignItems: 'center', gap: 14, width: '100%', maxWidth: 280 },
    loadingText: { color: '#93c5fd', fontSize: 15, fontWeight: '700' },

    
    bubble: { position: 'absolute', borderRadius: 999, backgroundColor: '#fff' },

    
    header: {
        paddingTop: 54, paddingBottom: 30,
        paddingHorizontal: 24,
        alignItems: 'center',
        position: 'relative', overflow: 'hidden',
    },
    avatarWrap: { position: 'relative', marginBottom: 16 },
    avatar: {
        width: 84, height: 84, borderRadius: 42,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5, shadowRadius: 18, elevation: 14,
    },
    avatarText: { color: '#fff', fontSize: 34, fontWeight: '800' },
    onlineDot: {
        position: 'absolute', bottom: 2, right: 2,
        width: 16, height: 16, borderRadius: 8,
        backgroundColor: '#10b981',
        borderWidth: 2.5, borderColor: '#060d1a',
    },
    headerName: { color: '#f1f5f9', fontSize: 22, fontWeight: '800', marginBottom: 4, letterSpacing: -0.3 },
    headerEmail: { color: '#60a5fa', fontSize: 13, marginBottom: 14 },
    roleBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(124,58,237,0.15)',
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)',
    },
    roleText: { color: '#a78bfa', fontSize: 12, fontWeight: '700' },

    
    successBox: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: 'rgba(16,185,129,0.1)',
        borderRadius: 14, padding: 13,
        marginHorizontal: 16, marginTop: 14,
        borderWidth: 1, borderColor: 'rgba(52,211,153,0.25)',
    },
    successText: { color: '#34d399', fontSize: 13, flex: 1 },
    errorBox: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderRadius: 14, padding: 13,
        marginHorizontal: 16, marginTop: 14,
        borderWidth: 1, borderColor: 'rgba(248,113,113,0.25)',
    },
    errorText: { color: '#fca5a5', fontSize: 13, flex: 1 },

    
    card: {
        backgroundColor: '#0d1a2e',
        marginHorizontal: 16, marginTop: 14,
        borderRadius: 22, padding: 18,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    cardIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    cardTitle: { fontSize: 15, fontWeight: '800', color: '#e2e8f0', flex: 1, letterSpacing: -0.2 },
    editBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(56,189,248,0.1)',
        paddingHorizontal: 11, paddingVertical: 6, borderRadius: 10,
        borderWidth: 1, borderColor: 'rgba(56,189,248,0.15)',
    },
    editBtnText: { color: '#38bdf8', fontSize: 12, fontWeight: '700' },
    cancelBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(148,163,184,0.08)',
        paddingHorizontal: 11, paddingVertical: 6, borderRadius: 10,
        borderWidth: 1, borderColor: 'rgba(148,163,184,0.12)',
    },
    cancelBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },

    
    emailNote: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 14, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    emailNoteText: { color: '#475569', fontSize: 12 },

    
    saveBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 2 },
    saveBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    
    passRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', marginBottom: 10 },
    passIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    passLabel: { fontSize: 10, color: '#64748b', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' },
    passValue: { fontSize: 15, color: '#e2e8f0', fontWeight: '600', letterSpacing: 1 },
    passToggleBtn: {
        width: 38, height: 38, borderRadius: 11,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
        alignItems: 'center', justifyContent: 'center',
    },
    securityNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
    securityNoteText: { color: '#64748b', fontSize: 11, flex: 1, lineHeight: 16 },

    
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        marginHorizontal: 16, marginTop: 14,
        paddingVertical: 16, paddingHorizontal: 18,
        backgroundColor: 'rgba(239,68,68,0.07)',
        borderRadius: 18,
        borderWidth: 1, borderColor: 'rgba(239,68,68,0.18)',
    },
    logoutIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.12)', alignItems: 'center', justifyContent: 'center' },
    logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 15, flex: 1 },

    
    footer: { textAlign: 'center', color: '#64748b', fontSize: 11, marginTop: 22 },
});