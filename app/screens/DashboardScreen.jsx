import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Animated, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getItem } from '../services/storage';
import { getStatusLaundry } from '../services/api';

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
    'antrian': {
        label: 'Antrian',
        icon: 'time-outline',
        colors: ['#451a03', '#78350f', '#92400e'],
        badge: 'rgba(254,243,199,0.15)',
        badgeText: '#fcd34d',
        dot: '#f59e0b',
        glow: 'rgba(245,158,11,0.3)',
    },
    'dicuci': {
        label: 'Dicuci',
        icon: 'water-outline',
        colors: ['#0c1a3d', '#1e3a8a', '#1d4ed8'],
        badge: 'rgba(219,234,254,0.15)',
        badgeText: '#93c5fd',
        dot: '#3b82f6',
        glow: 'rgba(59,130,246,0.3)',
    },
    'disetrika': {
        label: 'Disetrika',
        icon: 'flash-outline',
        colors: ['#2e1065', '#4c1d95', '#6d28d9'],
        badge: 'rgba(237,233,254,0.15)',
        badgeText: '#c4b5fd',
        dot: '#7c3aed',
        glow: 'rgba(124,58,237,0.3)',
    },
    'siap diambil': {
        label: 'Siap Diambil',
        icon: 'checkmark-circle-outline',
        colors: ['#022c22', '#064e3b', '#065f46'],
        badge: 'rgba(209,250,229,0.15)',
        badgeText: '#6ee7b7',
        dot: '#10b981',
        glow: 'rgba(16,185,129,0.3)',
    },
    'diambil': {
        label: 'Selesai',
        icon: 'flag-outline',
        colors: ['#0f172a', '#1e293b', '#334155'],
        badge: 'rgba(241,245,249,0.1)',
        badgeText: '#94a3b8',
        dot: '#64748b',
        glow: 'rgba(100,116,139,0.2)',
    },
};

const PAYMENT_CONFIG = {
    paid: { label: 'Lunas', icon: 'checkmark-circle', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
    pending: { label: 'Pending', icon: 'time', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
};

const STATUS_STEPS = ['antrian', 'dicuci', 'disetrika', 'siap diambil', 'diambil'];

function ProgressBar({ currentStatus }) {
    const currentIndex = STATUS_STEPS.indexOf(currentStatus);
    return (
        <View style={pb.wrap}>
            {STATUS_STEPS.map((step, i) => {
                const done = i < currentIndex;
                const active = i === currentIndex;
                const cfg = STATUS_CONFIG[step];
                return (
                    <React.Fragment key={step}>
                        {i > 0 && (
                            <View style={[pb.line, (done || active) && { backgroundColor: 'rgba(255,255,255,0.35)' }]} />
                        )}
                        <View style={[
                            pb.dot,
                            done && { backgroundColor: cfg.dot, borderColor: cfg.dot },
                            active && { borderColor: cfg.dot, borderWidth: 2.5, backgroundColor: 'rgba(255,255,255,0.08)' },
                            !done && !active && { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1.5 },
                        ]}>
                            {done && <Ionicons name="checkmark" size={9} color="#fff" />}
                            {active && <View style={[pb.dotInner, { backgroundColor: cfg.dot }]} />}
                        </View>
                    </React.Fragment>
                );
            })}
        </View>
    );
}

const pb = StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'center', marginVertical: 14, paddingHorizontal: 2 },
    line: { flex: 1, height: 1.5, backgroundColor: 'rgba(255,255,255,0.1)' },
    dot: {
        width: 22, height: 22, borderRadius: 11,
        alignItems: 'center', justifyContent: 'center',
    },
    dotInner: { width: 8, height: 8, borderRadius: 4 },
});

function TransactionCard({ item, onPress, index }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 450, delay: index * 80, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 450, delay: index * 80, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, delay: index * 80, tension: 80, friction: 9, useNativeDriver: true }),
        ]).start();
    }, []);

    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG['diambil'];
    const payCfg = PAYMENT_CONFIG[item.payment_status] || PAYMENT_CONFIG['pending'];

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
            <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.88}>
                <LinearGradient colors={cfg.colors} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>

                    <View style={[styles.cardDeco, { width: 100, height: 100, top: -35, right: -30, backgroundColor: 'rgba(255,255,255,0.04)' }]} />
                    <View style={[styles.cardDeco, { width: 60, height: 60, bottom: -20, left: -15, backgroundColor: 'rgba(255,255,255,0.03)' }]} />

                    <View style={styles.cardHeader}>
                        <View style={[styles.statusIconWrap, { backgroundColor: cfg.badge, borderColor: 'rgba(255,255,255,0.1)', shadowColor: cfg.glow }]}>
                            <Ionicons name={cfg.icon} size={16} color={cfg.badgeText} />
                        </View>
                        <View style={styles.invoiceBadge}>
                            <Ionicons name="receipt-outline" size={10} color="rgba(255,255,255,0.5)" style={{ marginRight: 4 }} />
                            <Text style={styles.invoiceText}>{item.invoice_code}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: cfg.badge, borderColor: 'rgba(255,255,255,0.1)' }]}>
                            <Text style={[styles.statusBadgeText, { color: cfg.badgeText }]}>
                                {cfg.label}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.serviceName} numberOfLines={1}>
                        {item.service?.service_name
                            ? item.service.service_name.charAt(0).toUpperCase() + item.service.service_name.slice(1)
                            : '-'}
                    </Text>
                    <Text style={styles.serviceUnit}>
                        {(() => {
                            const qty = parseFloat(item.service_unit);
                            const unit = item.service?.unit || 'kg';
                            const price = parseFloat(item.service?.price_per_unit);
                            if (isNaN(qty)) return '—';
                            const qtyStr = qty % 1 === 0 ? qty.toFixed(0) : parseFloat(qty.toFixed(2)).toString();
                            const priceStr = price > 0
                                ? `  ·  Rp ${price.toLocaleString('id-ID')} / ${unit}`
                                : '';
                            return `${qtyStr} ${unit}${priceStr}`;
                        })()}
                    </Text>

                    <ProgressBar currentStatus={item.status} />

                    <View style={styles.divider} />

                    <View style={styles.cardFooter}>
                        <View style={styles.footerLeft}>
                            <Text style={styles.totalLabel}>Total Tagihan</Text>
                            <Text style={styles.totalAmount}>
                                Rp {parseInt(item.total_price).toLocaleString('id-ID')}
                            </Text>
                        </View>
                        <View style={styles.footerRight}>
                            <View style={[styles.payBadge, { backgroundColor: payCfg.bg, borderColor: payCfg.border }]}>
                                <Ionicons name={payCfg.icon} size={11} color={payCfg.color} />
                                <Text style={[styles.payBadgeText, { color: payCfg.color }]}>
                                    {payCfg.label}
                                </Text>
                            </View>
                            <View style={styles.detailBtn}>
                                <Text style={styles.detailBtnText}>Lihat Detail</Text>
                                <Ionicons name="chevron-forward" size={12} color="rgba(255,255,255,0.9)" />
                            </View>
                        </View>
                    </View>

                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

function EmptyState() {
    const pulseAnim = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.85, duration: 1800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.emptyWrap}>
            <LinearGradient colors={['#111827', '#0f172a']} style={styles.emptyBox}>
                <Animated.View style={[styles.emptyIconRing, { transform: [{ scale: pulseAnim }] }]}>
                    <View style={styles.emptyIconInner}>
                        <Ionicons name="shirt-outline" size={36} color="#475569" />
                    </View>
                </Animated.View>
                <Text style={styles.emptyTitle}>Belum Ada Cucian</Text>
                <Text style={styles.emptySubtitle}>
                    Transaksi Laundry Anda Akan Muncul Di Sini Setelah Admin Menginput Data
                </Text>
                <View style={styles.emptyDots}>
                    {[0,1,2,3,4].map(i => (
                        <View key={i} style={[styles.emptyDot, i === 2 && styles.emptyDotCenter]} />
                    ))}
                </View>
            </LinearGradient>
        </View>
    );
}

function SummaryChip({ label, value, color, icon }) {
    return (
        <View style={styles.summaryChip}>
            <View style={[styles.summaryIconWrap, { backgroundColor: color + '22' }]}>
                <Ionicons name={icon} size={14} color={color} />
            </View>
            <Text style={[styles.summaryVal, { color }]}>{value}</Text>
            <Text style={styles.summaryLabel}>{label}</Text>
        </View>
    );
}

export default function DashboardScreen({ navigation }) {
    const [transactions, setTransactions] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const headerAnim = useRef(new Animated.Value(-50)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadUser();
        fetchTransactions();
        Animated.parallel([
            Animated.timing(headerAnim, { toValue: 0, duration: 550, useNativeDriver: true }),
            Animated.timing(headerOpacity, { toValue: 1, duration: 550, useNativeDriver: true }),
        ]).start();
    }, []);

    const loadUser = async () => {
        const stored = await getItem('user');
        if (stored) setUser(JSON.parse(stored));
    };

    const fetchTransactions = async () => {
        setError('');
        try {
            const res = await getStatusLaundry();
            setTransactions(res.data.data || []);
        } catch (err) {
            setError('Gagal Memuat Data. Tarik Ke Bawah Untuk Refresh');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTransactions();
    }, []);

    const summary = {
        aktif: transactions.filter(t => !['diambil'].includes(t.status)).length,
        selesai: transactions.filter(t => t.status === 'diambil').length,
        total: transactions.length,
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 11) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    const renderHeader = () => (
        <Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerAnim }] }}>

            <LinearGradient
                colors={['#060d1a', '#0d1f3c', '#0f2952', '#0c3a6e']}
                style={styles.greetingWrap}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
                <View style={[styles.bubble, { width: 180, height: 180, top: -70, right: -60, opacity: 0.06 }]} />
                <View style={[styles.bubble, { width: 100, height: 100, bottom: -30, left: -30, opacity: 0.05 }]} />
                <View style={[styles.bubble, { width: 60,  height: 60, top: 30, right: 80, opacity: 0.04 }]} />

                <View style={styles.greetingRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.greetTime}>{getGreeting()},</Text>
                        <Text style={styles.greetHi} numberOfLines={1}>
                            {user?.name?.split(' ')[0] || 'Pelanggan'} 👋
                        </Text>
                        <Text style={styles.greetSub}>Pantau Status Cucian Anda Di Sini</Text>
                    </View>
                    <View style={styles.avatarWrap}>
                        <LinearGradient
                            colors={['#1d4ed8', '#3b82f6', '#38bdf8']}
                            style={styles.avatarCircle}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0).toUpperCase() || '?'}
                            </Text>
                        </LinearGradient>
                        <View style={styles.onlineDot} />
                    </View>
                </View>

                <View style={styles.headerDivider} />

                <View style={styles.summaryRow}>
                    <SummaryChip label="Total" value={summary.total} color="#38bdf8" icon="layers-outline" />
                    <View style={styles.summaryDivider} />
                    <SummaryChip label="Aktif" value={summary.aktif} color="#34d399" icon="sync-outline" />
                    <View style={styles.summaryDivider} />
                    <SummaryChip label="Selesai" value={summary.selesai} color="#a78bfa" icon="checkmark-done-outline" />
                </View>
            </LinearGradient>

            <View style={styles.sectionRow}>
                <View style={styles.sectionTitleWrap}>
                    <View style={styles.sectionDot} />
                    <Text style={styles.sectionTitle}>Daftar Cucian Saya</Text>
                </View>
                <View style={styles.sectionCountBadge}>
                    <Text style={styles.sectionCount}>{transactions.length} Transaksi</Text>
                </View>
            </View>

        </Animated.View>
    );

    if (loading) {
        return (
            <View style={styles.loadingWrap}>
                <StatusBar barStyle="light-content" backgroundColor="#060d1a" />
                <LinearGradient colors={['#0f172a', '#1e3a5f']} style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#38bdf8" />
                    <Text style={styles.loadingText}>Memuat Data Cucian...</Text>
                    <Text style={styles.loadingSubtext}>Mohon Tunggu Sebentar</Text>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" backgroundColor="#060d1a" />

            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <TransactionCard
                        item={item}
                        index={index}
                        onPress={(trx) => navigation.navigate('Detail', { transaction: trx })}
                    />
                )}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={<EmptyState />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#38bdf8"
                        colors={['#38bdf8']}
                        progressBackgroundColor="#0f172a"
                    />
                }
            />

            {error !== '' && (
                <Animated.View style={styles.errorBanner}>
                    <View style={styles.errorIconWrap}>
                        <Ionicons name="wifi-outline" size={16} color="#fca5a5" />
                    </View>
                    <Text style={styles.errorBannerText}>{error}</Text>
                    <TouchableOpacity onPress={fetchTransactions} style={styles.errorRetryBtn}>
                        <Text style={styles.errorRetryText}>Retry</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#060d1a' },
    listContent: { paddingBottom: 36 },

    loadingWrap: { flex: 1, backgroundColor: '#060d1a', justifyContent: 'center', alignItems: 'center', padding: 24 },
    loadingBox: { borderRadius: 24, padding: 36, alignItems: 'center', gap: 14, width: '100%', maxWidth: 280 },
    loadingText: { color: '#93c5fd', fontSize: 15, fontWeight: '700', marginTop: 4 },
    loadingSubtext: { color: '#334155', fontSize: 12 },

    bubble: { position: 'absolute', borderRadius: 999, backgroundColor: '#fff' },

    greetingWrap: {
        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24,
        position: 'relative', overflow: 'hidden',
    },
    greetingRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
    greetTime: { fontSize: 12, color: '#60a5fa', fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
    greetHi: { fontSize: 26, fontWeight: '800', color: '#f1f5f9', marginBottom: 4, letterSpacing: -0.5 },
    greetSub: { fontSize: 12, color: '#64748b' },
    avatarWrap: { position: 'relative', marginLeft: 12 },
    avatarCircle: {
        width: 50, height: 50, borderRadius: 25,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
    },
    avatarText: { color: '#fff', fontWeight: '800', fontSize: 20 },
    onlineDot: {
        position: 'absolute', bottom: 1, right: 1,
        width: 13, height: 13, borderRadius: 7,
        backgroundColor: '#10b981',
        borderWidth: 2, borderColor: '#060d1a',
    },

    headerDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 16 },

    summaryRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', paddingVertical: 14, paddingHorizontal: 8 },
    summaryChip: { flex: 1, alignItems: 'center', gap: 6 },
    summaryIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    summaryVal: { fontSize: 22, fontWeight: '800', lineHeight: 26 },
    summaryLabel: { fontSize: 10, color: '#64748b', fontWeight: '600', letterSpacing: 0.3 },
    summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.06)' },

    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
    sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionDot: { width: 4, height: 18, borderRadius: 2, backgroundColor: '#3b82f6' },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#e2e8f0', letterSpacing: -0.3 },
    sectionCountBadge: { backgroundColor: 'rgba(56,189,248,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)' },
    sectionCount: { fontSize: 11, color: '#38bdf8', fontWeight: '700' },

    card: {
        marginHorizontal: 20, marginBottom: 14,
        borderRadius: 22, padding: 18,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
        overflow: 'hidden', position: 'relative',
    },
    cardDeco: { position: 'absolute', borderRadius: 999 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },

    statusIconWrap: {
        width: 34, height: 34, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, elevation: 4,
    },
    invoiceBadge: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 8,
    },
    invoiceText: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 11, fontFamily: 'monospace', letterSpacing: 0.5 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
    statusBadgeText: { fontSize: 11, fontWeight: '700' },

    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 5 },

    serviceName: { color: '#fff', fontWeight: '800', fontSize: 19, marginTop: 10, letterSpacing: -0.3 },
    serviceUnit: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 2 },
    footerLeft: {},
    footerRight: { alignItems: 'flex-end', gap: 8 },
    totalLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 2, fontWeight: '600', letterSpacing: 0.3 },
    totalAmount: { color: '#fff', fontWeight: '800', fontSize: 20, letterSpacing: -0.5 },

    payBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
    payBadgeText: { fontSize: 11, fontWeight: '700' },

    detailBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    },
    detailBtnText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700' },

    emptyWrap: { marginHorizontal: 20, marginTop: 8 },
    emptyBox: { borderRadius: 24, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    emptyIconRing: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    emptyIconInner: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { color: '#475569', fontWeight: '800', fontSize: 16, marginBottom: 6 },
    emptySubtitle: { color: '#334155', fontSize: 12, textAlign: 'center', lineHeight: 18, maxWidth: 220 },
    emptyDots: { flexDirection: 'row', gap: 5, marginTop: 20, alignItems: 'center' },
    emptyDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#1e293b' },
    emptyDotCenter: { width: 18, height: 5, borderRadius: 3, backgroundColor: '#334155' },

    errorBanner: {
        position: 'absolute', bottom: 86, left: 16, right: 16,
        backgroundColor: 'rgba(69,10,10,0.97)',
        borderRadius: 16, padding: 14,
        flexDirection: 'row', alignItems: 'center', gap: 10,
        borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)',
        shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
    },
    errorIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.2)', alignItems: 'center', justifyContent: 'center' },
    errorBannerText: { color: '#fca5a5', fontSize: 12, flex: 1, lineHeight: 16 },
    errorRetryBtn: { backgroundColor: 'rgba(239,68,68,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
    errorRetryText: { color: '#fca5a5', fontSize: 11, fontWeight: '700' },
});