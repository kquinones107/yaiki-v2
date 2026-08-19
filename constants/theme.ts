// =============================================
// DESIGN SYSTEM — YAIKI ACCESORIOS
// Paleta de colores, tipografía y constantes
// =============================================

export const Colors = {
  // Paleta principal — Elegante dorado/oscuro
  primary: '#D4AF37',        // Dorado principal
  primaryLight: '#F0D060',   // Dorado claro
  primaryDark: '#A07820',    // Dorado oscuro

  // Fondos
  background: '#0D0D0D',     // Negro profundo
  backgroundCard: '#1A1A2E', // Azul noche (cards)
  backgroundSurface: '#16213E', // Superficie elevada

  // Textos
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#666666',
  textGold: '#D4AF37',

  // Acciones
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',

  // Admin
  adminAccent: '#7C3AED',    // Púrpura para admin
  adminLight: '#A78BFA',

  // Transparencias
  overlay: 'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(0,0,0,0.3)',
  goldOverlay: 'rgba(212,175,55,0.15)',

  // Bordes
  border: '#2A2A3E',
  borderGold: 'rgba(212,175,55,0.4)',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  // Cuando cargues fuentes custom:
  // heading: 'Caveat-Bold',
  // body: 'Exo2-Regular',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadow = {
  card: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
};

export const ADMIN_TAP_COUNT = 5; // Número de taps para acceder al admin
