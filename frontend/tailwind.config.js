/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // =====================================================================
        // MÓDULO GESTIÓN - Colores profesionales corporativos
        // =====================================================================
        gestion: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9', // Sky Blue - Professional
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          secondary: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b', // Slate - Elegant
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a', // Dark sidebar
          },
          success: {
            50: '#f0fdf4',
            500: '#10b981',
            600: '#059669',
          },
          warning: {
            50: '#fffbeb',
            500: '#f59e0b',
            600: '#d97706',
          },
          error: {
            50: '#fef2f2',
            500: '#ef4444',
            600: '#dc2626',
          },
        },
        // =====================================================================
        // MÓDULO PLATAFORMA - Tema Natural/Orgánico (Verde bosque + Terracota)
        // =====================================================================
        plataforma: {
          primary: {
            50: '#f0f5f3',  // Verde muy claro
            100: '#d9e7df', // Verde claro
            200: '#b3cfbf', // Verde suave
            300: '#8cb79f', // Verde medio-claro
            400: '#5d8973', // Verde medio
            500: '#2D4A3E', // Verde bosque (principal)
            600: '#253d33', // Verde oscuro
            700: '#1d3028', // Verde muy oscuro
            800: '#16241e', // Verde profundo
            900: '#0e1713', // Verde casi negro
          },
          secondary: {
            50: '#fbf1ed',  // Terracota muy claro
            100: '#f5ded5', // Terracota claro
            200: '#ebbdab', // Terracota suave
            300: '#e19c81', // Terracota medio-claro
            400: '#d78a6e', // Terracota medio
            500: '#D4846A', // Terracota (acentos cálidos)
            600: '#b86b54', // Terracota oscuro
            700: '#9c5340', // Terracota profundo
            800: '#7d4333', // Terracota muy oscuro
            900: '#5e3227', // Terracota casi negro
          },
          accent: {
            50: '#faf6ed',  // Crema muy claro
            100: '#f5ecd3', // Crema claro
            200: '#ecdab0', // Crema suave
            300: '#e2c88d', // Crema medio
            400: '#d9b66a', // Crema dorado
            500: '#B8860B', // Cobre/Oro (detalles especiales)
            600: '#9a7009', // Oro oscuro
            700: '#7c5a07', // Oro profundo
            800: '#5e4505', // Oro muy oscuro
            900: '#403003', // Oro casi negro
          },
          nature: {
            50: '#f2f4f1',  // Oliva muy claro
            100: '#e5e9e3', // Oliva claro
            200: '#cbd3c7', // Oliva suave
            300: '#b1bdab', // Oliva medio-claro
            400: '#97a78f', // Oliva medio
            500: '#7D8F69', // Verde oliva (detalles naturales)
            600: '#687656', // Oliva oscuro
            700: '#535e44', // Oliva profundo
            800: '#3f4733', // Oliva muy oscuro
            900: '#2a2f22', // Oliva casi negro
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'glow-blue': '0 0 20px rgba(14, 165, 233, 0.3)',
        'glow-amber': '0 0 20px rgba(217, 119, 6, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
