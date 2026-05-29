import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, StatusBar, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../services/api';

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
    'antrian': { label:'Antrian', icon:'time-outline', colors:['#451a03','#78350f','#92400e'], dot:'#f59e0b', badge:'rgba(254,243,199,0.15)', badgeText:'#fcd34d', glow:'rgba(245,158,11,0.25)' },
    'dicuci': { label:'Dicuci', icon:'water-outline', colors:['#0c1a3d','#1e3a8a','#1d4ed8'], dot:'#3b82f6', badge:'rgba(219,234,254,0.15)', badgeText:'#93c5fd', glow:'rgba(59,130,246,0.25)' },
    'disetrika': { label:'Disetrika', icon:'flash-outline', colors:['#2e1065','#4c1d95','#6d28d9'], dot:'#7c3aed', badge:'rgba(237,233,254,0.15)', badgeText:'#c4b5fd', glow:'rgba(124,58,237,0.25)' },
    'siap diambil': { label:'Siap Diambil', icon:'checkmark-circle-outline', colors:['#022c22','#064e3b','#065f46'], dot:'#10b981', badge:'rgba(209,250,229,0.15)', badgeText:'#6ee7b7', glow:'rgba(16,185,129,0.25)' },
    'diambil': { label:'Selesai', icon:'flag-outline', colors:['#0f172a','#1e293b','#334155'], dot:'#64748b', badge:'rgba(241,245,249,0.1)',  badgeText:'#94a3b8', glow:'rgba(100,116,139,0.15)' },
};

const STATUS_STEPS = ['antrian','dicuci','disetrika','siap diambil','diambil'];

function ProgressTracker({ currentStatus }) {
    const currentIndex = STATUS_STEPS.indexOf(currentStatus);

    return (
        <View style={pt.container}>
            {STATUS_STEPS.map((step, i) => {
                const done = i < currentIndex;
                const active = i === currentIndex;
                const cfg = STATUS_CONFIG[step];
                const isLast = i === STATUS_STEPS.length - 1;

                return (
                    <View key={step} style={pt.stepRow}>
                        <View style={pt.leftCol}>
                            <View style={[
                                pt.dot,
                                done && { backgroundColor: cfg.dot, borderColor: cfg.dot, shadowColor: cfg.dot, shadowOpacity: 0.5, shadowRadius: 6, elevation: 4 },
                                active && { borderColor: cfg.dot, borderWidth: 2.5, backgroundColor: 'rgba(255,255,255,0.05)', shadowColor: cfg.dot, shadowOpacity: 0.6, shadowRadius: 8, elevation: 6 },
                                !done && !active && { backgroundColor: '#111827', borderColor: '#1e293b', borderWidth: 1.5 },
                            ]}>
                                {done && <Ionicons name="checkmark" size={13} color="#fff" />}
                                {active && <View style={[pt.dotCore, { backgroundColor: cfg.dot }]} />}
                                {!done && !active && <View style={pt.dotEmpty} />}
                            </View>
                            {!isLast && (
                                <View style={[
                                    pt.line,
                                    done && { backgroundColor: cfg.dot, opacity: 0.5 },
                                    active && { backgroundColor: 'rgba(255,255,255,0.08)' },
                                ]} />
                            )}
                        </View>

                        <View style={[pt.rightCol, !isLast && { paddingBottom: 26 }]}>
                            <View style={pt.labelRow}>
                                <View style={pt.labelWrap}>
                                    <Text style={[
                                        pt.stepLabel,
                                        done && { color: '#64748b' },
                                        active && { color: '#f1f5f9', fontWeight: '800' },
                                        !done && !active && { color: '#334155' },
                                    ]}>
                                        {cfg.label}
                                    </Text>
                                    {active && (
                                        <Text style={pt.stepDesc}>Status Cucian Saat Ini</Text>
                                    )}
                                </View>

                                {active && (
                                    <View style={[pt.badge, { backgroundColor: cfg.badge, borderColor: 'rgba(255,255,255,0.08)' }]}>
                                        <Ionicons name={cfg.icon} size={10} color={cfg.badgeText} />
                                        <Text style={[pt.badgeText, { color: cfg.badgeText }]}>Saat Ini</Text>
                                    </View>
                                )}
                                {done && (
                                    <View style={[pt.badge, { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.15)' }]}>
                                        <Ionicons name="checkmark-circle" size={10} color="#10b981" />
                                        <Text style={[pt.badgeText, { color: '#10b981' }]}>Selesai</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const pt = StyleSheet.create({
    container: { paddingLeft: 2, paddingTop: 4 },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
    leftCol: { alignItems: 'center', width: 38 },
    rightCol: { flex: 1, paddingLeft: 14, paddingTop: 2 },
    dot: {
        width: 30, height: 30, borderRadius: 15,
        alignItems: 'center', justifyContent: 'center',
    },
    dotCore: { width: 11, height: 11, borderRadius: 6 },
    dotEmpty: { width: 8,  height: 8,  borderRadius: 4, backgroundColor: '#1e293b' },
    line: { width: 2, flex: 1, backgroundColor: '#111827', minHeight: 20, marginTop: 2, borderRadius: 1 },
    labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
    labelWrap: { flex: 1 },
    stepLabel: { fontSize: 14, fontWeight: '600' },
    stepDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 9, paddingVertical: 3,
        borderRadius: 20, borderWidth: 1,
    },
    badgeText: { fontSize: 10, fontWeight: '700' },
});

function InfoRow({ label, value, valueStyle, isLast, icon }) {
    return (
        <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
            <View style={styles.infoLabelWrap}>
                {icon && <Ionicons name={icon} size={12} color="#64748b" style={{ marginRight: 5 }} />}
                <Text style={styles.infoLabel}>{label}</Text>
            </View>
            <Text style={[styles.infoValue, valueStyle]} numberOfLines={2}>{value}</Text>
        </View>
    );
}

export default function DetailScreen({ route, navigation }) {
    const { transaction } = route.params;
    const cfg = STATUS_CONFIG[transaction.status] || STATUS_CONFIG['diambil'];

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const scaleAnim = useRef(new Animated.Value(0.97)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
        ]).start();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    };

    const formatRp = (val) =>
        'Rp ' + parseInt(val || 0).toLocaleString('id-ID');

    const formatQty = (serviceUnit, unit) => {
        const qty = parseFloat(serviceUnit);
        if (isNaN(qty)) return `- ${unit || ''}`;
        const qtyStr = qty % 1 === 0 ? qty.toFixed(0) : parseFloat(qty.toFixed(2)).toString();
        return `${qtyStr} ${unit || ''}`.trim();
    };

    const clothPhotoUrl = transaction.cloth_photo
        ? `${BASE_URL.replace('/api', '')}/storage/${transaction.cloth_photo}`
        : null;

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" backgroundColor="#060d1a" />

            <LinearGradient
                colors={cfg.colors}
                style={styles.banner}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
                <View style={[styles.bubble, { width: 160, height: 160, top: -55, right: -50, opacity: 0.06 }]} />
                <View style={[styles.bubble, { width: 90, height: 90, bottom: -25, left: -25, opacity: 0.05 }]} />
                <View style={[styles.bubble, { width: 50, height: 50, top: 40, right: 90, opacity: 0.04 }]} />

                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={19} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>

                <View style={styles.bannerContent}>
                    <Text style={styles.bannerMeta}>Detail Transaksi</Text>

                    <Text style={styles.bannerInvoice}>{transaction.invoice_code}</Text>

                    <View style={styles.bannerDateRow}>
                        <Ionicons name="calendar-outline" size={11} color="rgba(186,230,253,0.7)" />
                        <Text style={styles.bannerDate}>{formatDate(transaction.created_at)}</Text>
                    </View>

                    <View style={[styles.statusChip, { backgroundColor: cfg.badge, borderColor: 'rgba(255,255,255,0.1)' }]}>
                        <Ionicons name={cfg.icon} size={12} color={cfg.badgeText} />
                        <Text style={[styles.statusChipText, { color: cfg.badgeText }]}>
                            {cfg.label}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <Animated.ScrollView
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                            <Ionicons name="git-branch-outline" size={14} color="#3b82f6" />
                        </View>
                        <Text style={styles.cardTitle}>Progress Cucian</Text>
                    </View>
                    <ProgressTracker currentStatus={transaction.status} />
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(3,105,161,0.15)' }]}>
                            <Ionicons name="receipt-outline" size={14} color="#38bdf8" />
                        </View>
                        <Text style={styles.cardTitle}>Info Transaksi</Text>
                    </View>

                    <InfoRow
                        label="Invoice"
                        value={transaction.invoice_code}
                        valueStyle={styles.invoiceVal}
                        icon="barcode-outline"
                    />
                    <InfoRow
                        label="Tanggal"
                        value={formatDate(transaction.created_at)}
                        icon="calendar-outline"
                    />
                    <InfoRow
                        label="Layanan"
                        value={transaction.service?.service_name
                            ? transaction.service.service_name.charAt(0).toUpperCase() + transaction.service.service_name.slice(1)
                            : '-'}
                        icon="shirt-outline"
                    />
                    <InfoRow
                        label="Jumlah"
                        value={formatQty(transaction.service_unit, transaction.service?.unit)}
                        icon="scale-outline"
                    />
                    <InfoRow
                        label="Total Harga"
                        value={formatRp(transaction.total_price)}
                        valueStyle={styles.totalVal}
                        icon="cash-outline"
                    />
                    <InfoRow
                        label="Pembayaran"
                        value={transaction.payment_method === 'cash' ? '💵 Cash' : '🏦 Transfer'}
                        icon="wallet-outline"
                    />
                    <InfoRow
                        label="Status Bayar"
                        value={transaction.payment_status === 'paid' ? '✅ Lunas' : '⏳ Pending'}
                        valueStyle={transaction.payment_status === 'paid' ? styles.paidVal : styles.pendingVal}
                        icon="checkmark-circle-outline"
                        isLast
                    />
                </View>

                <LinearGradient
                    colors={['#022c22', '#064e3b', '#065f46']}
                    style={styles.totalBox}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                    <View style={[styles.bubble, { width: 80, height: 80, top: -20, right: -20, opacity: 0.08 }]} />

                    <View>
                        <Text style={styles.totalBoxLabel}>Total Tagihan</Text>
                        <Text style={styles.totalBoxAmount}>{formatRp(transaction.total_price)}</Text>
                        <Text style={styles.totalBoxSub}>
                            {formatQty(transaction.service_unit, transaction.service?.unit)}
                            {transaction.service?.price_per_unit
                                ? `  ·  Rp ${parseInt(transaction.service.price_per_unit).toLocaleString('id-ID')} / ${transaction.service?.unit || ''}`
                                : ''}
                        </Text>
                    </View>
                    <View style={[
                        styles.totalBoxBadge,
                        { backgroundColor: transaction.payment_status === 'paid' ? 'rgba(209,250,229,0.2)' : 'rgba(254,243,199,0.2)',
                          borderColor: transaction.payment_status === 'paid' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)' }
                    ]}>
                        <Ionicons
                            name={transaction.payment_status === 'paid' ? 'checkmark-circle' : 'time'}
                            size={16}
                            color={transaction.payment_status === 'paid' ? '#34d399' : '#fbbf24'}
                        />
                        <Text style={[styles.totalBoxBadgeText,
                            { color: transaction.payment_status === 'paid' ? '#34d399' : '#fbbf24' }]}>
                            {transaction.payment_status === 'paid' ? 'LUNAS' : 'PENDING'}
                        </Text>
                    </View>
                </LinearGradient>

                {clothPhotoUrl && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(217,119,6,0.15)' }]}>
                                <Ionicons name="camera-outline" size={14} color="#f59e0b" />
                            </View>
                            <Text style={styles.cardTitle}>Foto Kondisi Baju</Text>
                        </View>
                        <Image
                            source={{ uri: clothPhotoUrl }}
                            style={styles.clothPhoto}
                            resizeMode="cover"
                        />
                        <View style={styles.clothPhotoNote}>
                            <Ionicons name="information-circle-outline" size={13} color="#f59e0b" />
                            <Text style={styles.clothPhotoNoteText}>
                                Foto Kondisi Baju Saat Masuk Laundry Untuk Menghindari Komplain
                            </Text>
                        </View>
                    </View>
                )}
                
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#060d1a' },
    scrollContent: { paddingBottom: 36 },

    bubble: { position: 'absolute', borderRadius: 999, backgroundColor: '#fff' },

    banner: {
        paddingTop: 54, paddingBottom: 26,
        paddingHorizontal: 20,
        position: 'relative', overflow: 'hidden',
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 18,
    },
    bannerContent: {},
    bannerMeta: { color: 'rgba(186,230,253,0.65)', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 },
    bannerInvoice: { color: '#fff', fontSize: 26, fontWeight: '800', fontFamily: 'monospace', marginBottom: 6, letterSpacing: 1 },
    bannerDateRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 14 },
    bannerDate: { color: 'rgba(186,230,253,0.7)', fontSize: 12 },
    statusChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        alignSelf: 'flex-start',
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20, borderWidth: 1,
    },
    statusChipText: { fontSize: 12, fontWeight: '700' },

    card: {
        backgroundColor: '#0d1a2e',
        marginHorizontal: 16, marginTop: 14,
        borderRadius: 22, padding: 18,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
    cardIconWrap: {
        width: 30, height: 30, borderRadius: 9,
        alignItems: 'center', justifyContent: 'center',
    },
    cardTitle: { fontSize: 15, fontWeight: '800', color: '#e2e8f0', letterSpacing: -0.2 },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    infoRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
    infoLabelWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    infoLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    infoValue: { fontSize: 13, color: '#cbd5e1', fontWeight: '600', textAlign: 'right', flex: 1.3, paddingLeft: 8 },
    invoiceVal: { color: '#60a5fa', fontFamily: 'monospace', fontWeight: '800', fontSize: 13 },
    totalVal: { color: '#f1f5f9', fontWeight: '800', fontSize: 15 },
    paidVal: { color: '#34d399', fontWeight: '700' },
    pendingVal: { color: '#fbbf24', fontWeight: '700' },

    totalBox: {
        marginHorizontal: 16, marginTop: 14,
        borderRadius: 22, padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)',
        overflow: 'hidden', position: 'relative',
        shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
    },
    totalBoxLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4, fontWeight: '600', letterSpacing: 0.3 },
    totalBoxAmount: { color: '#fff', fontWeight: '800', fontSize: 24, letterSpacing: -0.5 },
    totalBoxSub: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 4 },
    totalBoxBadge: {
        paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 16, borderWidth: 1,
        alignItems: 'center', gap: 5,
    },
    totalBoxBadgeText: { fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },

    clothPhoto: {
        width: '100%', height: 210, borderRadius: 16,
        marginBottom: 12, backgroundColor: '#0f172a',
    },
    clothPhotoNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
    clothPhotoNoteText: { color: '#b45309', fontSize: 12, flex: 1, lineHeight: 17 },

    backButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginHorizontal: 16, marginTop: 16,
        paddingVertical: 14,
        backgroundColor: '#0d1a2e',
        borderRadius: 18,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    backButtonText: { color: '#64748b', fontWeight: '600', fontSize: 14 },
});