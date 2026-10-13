// =============================================
// ANIMATED INTRO — Transición del splash nativo a la app
// Arranca idéntico al splash (rosa + logo) para que el relevo sea invisible,
// late mientras carga y luego se funde al negro llevando el logo al header
// =============================================
import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

// Deben coincidir con el plugin expo-splash-screen en app.json
const SPLASH_BACKGROUND = '#D88CAC';
const SPLASH_IMAGE_WIDTH = 240;

// Centro aproximado del texto "✦ YAIKI" en el header del Home
const HEADER_LOGO_CENTER = { x: 80, y: 70 };

const MIN_VISIBLE_MS = 900;

interface Props {
  /** true cuando la app terminó de cargar lo necesario para el Home */
  ready: boolean;
  onFinish: () => void;
}

export default function AnimatedIntro({ ready, onFinish }: Props) {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [minTimeDone, setMinTimeDone] = useState(false);

  const pulse = useSharedValue(1);
  const exit = useSharedValue(0); // 0 = splash, 1 = app

  // Esconder el splash nativo apenas este overlay (idéntico) está pintado
  const handleLayout = () => {
    SplashScreen.hideAsync().catch(() => {});
  };

  useEffect(() => {
    const t = setTimeout(() => setMinTimeDone(true), MIN_VISIBLE_MS);
    if (!reduceMotion) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 600, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      );
    }
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || !minTimeDone) return;
    cancelAnimation(pulse);
    pulse.value = withTiming(1, { duration: 150 });
    exit.value = withTiming(
      1,
      { duration: reduceMotion ? 250 : 750, easing: Easing.inOut(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(onFinish)();
      },
    );
  }, [ready, minTimeDone]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(exit.value, [0, 0.6], [SPLASH_BACKGROUND, Colors.background]),
    // Se desvanece al final para revelar el Home debajo
    opacity: interpolate(exit.value, [0.55, 1], [1, 0], 'clamp'),
  }));

  const logoStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { transform: [{ scale: 1 }], opacity: 1 - exit.value };
    }
    const dx = HEADER_LOGO_CENTER.x - width / 2;
    const dy = HEADER_LOGO_CENTER.y - height / 2;
    return {
      opacity: interpolate(exit.value, [0.4, 0.9], [1, 0], 'clamp'),
      transform: [
        { translateX: interpolate(exit.value, [0, 1], [0, dx]) },
        { translateY: interpolate(exit.value, [0, 1], [0, dy]) },
        { scale: pulse.value * interpolate(exit.value, [0, 1], [1, 0.3]) },
      ],
    };
  });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.container, containerStyle]}
      onLayout={handleLayout}
      pointerEvents="none"
    >
      <Animated.Image
        source={require('@/assets/splash-icon.png')}
        style={[styles.logo, logoStyle]}
        resizeMode="contain"
        fadeDuration={0}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  logo: {
    width: SPLASH_IMAGE_WIDTH,
    height: SPLASH_IMAGE_WIDTH,
  },
});
