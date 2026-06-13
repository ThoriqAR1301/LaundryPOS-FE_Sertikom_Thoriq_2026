import React, { useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { setItem } from '../services/storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        icon: 'shirt-outline',
        iconBg: ['#1d4ed8', '#3b82f6', '#38bdf8'],
        title: 'Selamat Datang Di\nLaundryPOS',
        subtitle: 'Solusi Modern Untuk Memantau Status Cucian Anda Kapan Saja Dan Di Mana Saja',
        colors: ['#060d1a', '#0d1f3c', '#0f2952'],
        accent: '#38bdf8',
    },
    {
        id: '2',
        icon: 'notifications-outline',
        iconBg: ['#5b21b6', '#7c3aed', '#a855f7'],
        title: 'Pantau Status\nCucian Realtime',
        subtitle: 'Dari Antrian, Dicuci, Disetrika, Hingga Siap Diambil — Semua Bisa Dipantau Langsung Dari HP Anda',
        colors: ['#0f0a1e', '#1e0a3c', '#2e1065'],
        accent: '#a78bfa',
    },
    {
        id: '3',
        icon: 'checkmark-circle-outline',
        iconBg: ['#065f46', '#059669', '#10b981'],
        title: 'Mudah, Cepat,\ndan Terpercaya',
        subtitle: 'Login Dengan Akun Anda Dan Nikmati Kemudahan Layanan Laundry Profesional Di Genggaman Tangan',
        colors: ['#071a14', '#0a2e22', '#022c22'],
        accent: '#34d399',
    },
];

function DotIndicator({ total, current, accent }) {
    return (
        <View style={dot.wrap}>
            {Array.from({ length: total }).map((_, i) => (
                <Animated.View
                    key={i}
                    style={[
                        dot.dot,
                        i === current
                            ? { width: 24, backgroundColor: accent }
                            : { width: 8, backgroundColor: 'rgba(255,255,255,0.25)' },
                    ]}
                />
            ))}
        </View>
    );
}

const dot = StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot : { height: 8, borderRadius: 4, transition: 'all 0.3s' },
});

function SlideItem({ item }) {
    const floatAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: -12, duration: 1800, useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={[sl.slide, { width }]}>
            <LinearGradient colors={item.colors} style={sl.bg} start={{ x:0, y:0 }} end={{ x:1, y:1 }}>
                <View style={[sl.bubble, { width:220, height:220, top:-80, right:-70, opacity:0.05 }]} />
                <View style={[sl.bubble, { width:140, height:140, bottom:-40, left:-50, opacity:0.04 }]} />
                <View style={[sl.bubble, { width:80, height:80, top:100, left:30, opacity:0.03 }]} />

                <Animated.View style={[sl.iconWrap, { transform: [{ translateY: floatAnim }] }]}>
                    <View style={[sl.iconRing, { borderColor: item.accent + '33' }]}>
                        <View style={[sl.iconRingInner, { borderColor: item.accent + '55' }]}>
                            <LinearGradient colors={item.iconBg} style={sl.iconBox} start={{ x:0, y:0 }} end={{ x:1, y:1 }}>
                                <Ionicons name={item.icon} size={52} color="#fff" />
                            </LinearGradient>
                        </View>
                    </View>
                    <View style={[sl.iconGlow, { backgroundColor: item.accent + '20' }]} />
                </Animated.View>

                <View style={sl.textWrap}>
                    <Text style={sl.title}>{item.title}</Text>
                    <Text style={sl.subtitle}>{item.subtitle}</Text>
                </View>
            </LinearGradient>
        </View>
    );
}

const sl = StyleSheet.create({
    slide: { height },
    bg: { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:32, position:'relative', overflow:'hidden' },
    bubble: { position:'absolute', borderRadius:999, backgroundColor:'#fff' },
    iconWrap: { alignItems:'center', marginBottom: 48 },
    iconRing: { width:180, height:180, borderRadius:90, borderWidth:1.5, alignItems:'center', justifyContent:'center' },
    iconRingInner:{ width:148, height:148, borderRadius:74, borderWidth:1, alignItems:'center', justifyContent:'center' },
    iconBox: { width:120, height:120, borderRadius:36, alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOffset:{width:0,height:12}, shadowOpacity:0.4, shadowRadius:20, elevation:16 },
    iconGlow: { width:120, height:30, borderRadius:60, marginTop:16, opacity:0.6 },
    textWrap: { alignItems:'center', paddingHorizontal:8 },
    title: { fontSize:30, fontWeight:'800', color:'#f1f5f9', textAlign:'center', lineHeight:38, marginBottom:16, letterSpacing:-0.5 },
    subtitle: { fontSize:15, color:'rgba(255,255,255,0.55)', textAlign:'center', lineHeight:24 },
});

export default function OnBoardingScreen({ navigation }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, { toValue:1, duration:600, useNativeDriver:true }).start();
    }, []);

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const goNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        }
    };

    const handleGetStarted = async () => {
        await setItem('onboarding_done', 'true');
        navigation.replace('Login');
    };

    const handleSkip = async () => {
        await setItem('onboarding_done', 'true');
        navigation.replace('Login');
    };

    const isLast = currentIndex === SLIDES.length - 1;
    const accent = SLIDES[currentIndex].accent;
    const bgColors = SLIDES[currentIndex].colors;

    return (
        <Animated.View style={[styles.screen, { opacity: fadeAnim }]}>
            <StatusBar barStyle="light-content" backgroundColor="#060d1a" />

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <SlideItem item={item} />}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                scrollEventThrottle={16}
            />

            <LinearGradient
                colors={[...bgColors].reverse()}
                style={styles.controlWrap}
                start={{ x:0, y:0 }} end={{ x:0, y:1 }}
            >
                <DotIndicator total={SLIDES.length} current={currentIndex} accent={accent} />

                <View style={styles.btnRow}>
                    {!isLast ? (
                        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
                            <Text style={styles.skipText}>Lewati</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flex: 1 }} />
                    )}

                    <TouchableOpacity
                        onPress={isLast ? handleGetStarted : goNext}
                        activeOpacity={0.88}
                        style={styles.nextBtnWrap}
                    >
                        <LinearGradient
                            colors={isLast
                                ? ['#065f46', '#059669', '#10b981']
                                : ['#1d4ed8', '#3b82f6', '#38bdf8']}
                            style={styles.nextBtn}
                            start={{ x:0, y:0 }} end={{ x:1, y:0 }}
                        >
                            <Text style={styles.nextBtnText}>
                                {isLast ? 'Mulai Sekarang' : 'Selanjutnya'}
                            </Text>
                            <Ionicons
                                name={isLast ? 'checkmark-circle-outline' : 'arrow-forward'}
                                size={18} color="#fff"
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    screen: { flex:1, backgroundColor:'#060d1a' },
    controlWrap: {
        position:'absolute', bottom:0, left:0, right:0,
        paddingTop:24, paddingBottom:44, paddingHorizontal:28,
        gap:24, alignItems:'center',
    },
    btnRow: { flexDirection:'row', alignItems:'center', width:'100%', gap:12 },
    skipBtn: { flex:1, paddingVertical:14, alignItems:'center', borderRadius:16, borderWidth:1, borderColor:'rgba(255,255,255,0.12)', backgroundColor:'rgba(255,255,255,0.05)' },
    skipText: { color:'rgba(255,255,255,0.5)', fontWeight:'600', fontSize:14 },
    nextBtnWrap: { flex:2 },
    nextBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, paddingVertical:15, borderRadius:16, shadowColor:'#3b82f6', shadowOffset:{width:0,height:6}, shadowOpacity:0.35, shadowRadius:12, elevation:8 },
    nextBtnText: { color:'#fff', fontWeight:'800', fontSize:15 },
});