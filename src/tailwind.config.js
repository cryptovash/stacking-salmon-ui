const plugin = require('tailwindcss/plugin');
const colors = require('tailwindcss/colors');

const { BREAKPOINTS } = require('./utils/constants/styles');

/*
const TAROT_BLACK_HAZE = Object.freeze({
  50: '#ffffff',
  100: '#fefefe',
  200: '#fdfdfd',
  300: '#fbfbfc',
  400: '#f8f9f9',
  500: '#f5f6f7',
  600: '#ddddde',
  700: '#b8b9b9',
  800: '#939494',
  900: '#787979'
});
*/
/*
const TAROT_BLACK_HAZE = Object.freeze({
  50: '#866E46',
  100: '#78633F',
  200: '#6B5838',
  300: '#5E4D31',
  400: '#50422A',
  500: '#433723',
  600: '#352C1C',
  700: '#282115',
  800: '#1B160E',
  900: '#0D0B07'
});
*/
const TAROT_ROSE_GRAY = Object.freeze({
  50: '#f4edec',
  100: '#ebdedc',
  200: '#e1cecc',
  300: '#d8bfbc',
  400: '#c5a09b',
  500: '#bc918b',
  600: '#b3827b',
  700: '#a9736b',
  800: '#8e5a52',
  900: '#6e4640'
});
const TAROT_MISTY_ROSE = Object.freeze({
  50: '#fffbfa',
  100: '#ffe4e1',
  200: '#ffcdc7',
  300: '#ff9f94',
  400: '#ff7161',
  500: '#ff432e',
  600: '#fa1900',
  700: '#7b0c00',
  800: '#610a00',
  900: '#480700'
});
const TAROT_BLACK_HAZE = Object.freeze({
  50: '#4c6666',
  100: '#445b5b',
  200: '#3c5151',
  300: '#354747',
  400: '#2d3d3d',
  500: '#263333',
  600: '#1e2828',
  700: '#161e1e',
  750: '#131a1a',
  800: '#0f1414',
  850: '#070a0a',
  900: '#040505'
});
/*
const TAROT_JADE = Object.freeze({
  50: '#f2fbf8',
  100: '#e6f8f1',
  200: '#bfeddc',
  300: '#99e1c7',
  400: '#4dcb9d',
  500: '#00b573',
  600: '#00a368',
  700: '#008856',
  800: '#006d45',
  900: '#005938'
});
*/
const TAROT_JADE = Object.freeze({
  50: '#866E46',
  100: '#78633F',
  200: '#6B5838',
  300: '#5E4D31',
  400: '#50422A',
  500: '#433723',
  600: '#352C1C',
  700: '#282115',
  800: '#1B160E',
  900: '#0D0B07'
});
const TAROT_CARNATION = Object.freeze({
  50: '#fef6f6',
  100: '#fdeeee',
  200: '#fad4d4',
  300: '#f7bbbb',
  400: '#f18787',
  500: '#eb5454',
  600: '#d44c4c',
  700: '#b03f3f',
  800: '#8d3232',
  900: '#732929'
});
const TAROT_ASTRAL = Object.freeze({
  50: '#f5f8fa',
  100: '#eaf1f5',
  200: '#cbdce6',
  300: '#abc7d7',
  400: '#6d9db8',
  500: '#2e739a',
  600: '#29688b',
  700: '#235674',
  800: '#1c455c',
  900: '#17384b'
});
const TAROT_MERCURY = Object.freeze({
  50: '#fefefe',
  100: '#fdfdfd',
  200: '#f9f9f9',
  300: '#f5f5f5',
  400: '#eeeeee',
  500: '#e7e7e7',
  600: '#d0d0d0',
  700: '#adadad',
  800: '#8b8b8b',
  900: '#717171'
});

module.exports = {
  purge: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    boxShadow: {
      sm: '0 1px 2px 0 rgba(200, 214, 214, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(200, 214, 214, 0.1), 0 1px 2px 0 rgba(200, 214, 214, 0.06)',
      md: '0 4px 6px -1px rgba(200, 214, 214, 0.1), 0 2px 4px -1px rgba(200, 214, 214, 0.06)',
      lg: '0 10px 15px -3px rgba(200, 214, 214, 0.1), 0 4px 6px -2px rgba(200, 214, 214, 0.05)',
      xl: '0 20px 25px -5px rgba(200, 214, 214, 0.07), 0 10px 10px -5px rgba(200, 214, 214, 0.03)',
      '2xl': '0 25px 50px -12px rgba(200, 214, 214, 0.25)',
      '3xl': '0 35px 60px -15px rgba(200, 214, 214, 0.3)',
      inner: 'inset 0 2px 4px 0 rgba(200, 214, 214, 0.06)',
      none: 'none'
    },
    screens: BREAKPOINTS,
    extend: {
      maxWidth: {
        half: '50%'
      },
      animation: {
        'ping-slow-once': 'ping 6s cubic-bezier(0, 0, 0.2, 1) 2s forwards',
        'ping-slow': 'ping 5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-out': 'fadeOut 1s linear 2s forwards',
        'fade-in': 'fadeIn 1s linear 2s forwards',
        'rotate-slow': 'rotate 80000ms linear infinite',
        'rotate-slower': 'rotate 240000ms linear infinite',
        'rotate-slow-clockwise': 'rotateClockwise 80000ms linear infinite',
        'scale-down': 'scaleDown 1s linear infinite',
        'loading-fade-out': 'fadeOut 2s linear 1s forwards',
        'loading-fade-out-fast': 'fadeOut 1s linear 500ms forwards',
        'cards-ping-slow-once': 'scaleUp 6s ease-out 500ms forwards',
        'fade-in-slow-delay': 'fadeIn 2s linear 2s forwards'
      },
      keyframes: () => ({
        scaleDown: {
          '0%': { opacity: 1, transform: 'scale3d(1, 1, 1)' },
          '50%': { opacity: .8, transform: 'scale3d(.95, .95, .95)' },
          '100%': { opacity: 1, transform: 'scale3d(1, 1, 1)' }
        },
        rotate: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' }
        },
        rotateClockwise: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 }
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        scaleUp: {
          '0%': { opacity: 1, transform: 'scale3d(1, 1, 1)' },
          '50%': { opacity: .25, transform: 'scale3d(2, 2, 2)' },
          '100%': { opacity: 0, transform: 'scale3d(3, 3, 3)' }
        }
      }),
      saturate: {
        25: '.25',
        75: '.75'
      },
      transitionDuration: {
        350: '350ms'
      },
      colors: {
        tarotRoseGray: {
          50: TAROT_ROSE_GRAY[50],
          100: TAROT_ROSE_GRAY[100],
          200: TAROT_ROSE_GRAY[200],
          300: TAROT_ROSE_GRAY[300],
          400: TAROT_ROSE_GRAY[400],
          500: TAROT_ROSE_GRAY[500],
          600: TAROT_ROSE_GRAY[600],
          700: TAROT_ROSE_GRAY[700],
          800: TAROT_ROSE_GRAY[800],
          DEFAULT: TAROT_ROSE_GRAY[900]
        },
        tarotMistyRose: {
          50: TAROT_MISTY_ROSE[50],
          100: TAROT_MISTY_ROSE[100],
          200: TAROT_MISTY_ROSE[200],
          300: TAROT_MISTY_ROSE[300],
          400: TAROT_MISTY_ROSE[400],
          500: TAROT_MISTY_ROSE[500],
          600: TAROT_MISTY_ROSE[600],
          700: TAROT_MISTY_ROSE[700],
          800: TAROT_MISTY_ROSE[800],
          DEFAULT: TAROT_MISTY_ROSE[900]
        },
        tarotBlackHaze: {
          50: TAROT_BLACK_HAZE[50],
          100: TAROT_BLACK_HAZE[100],
          200: TAROT_BLACK_HAZE[200],
          300: TAROT_BLACK_HAZE[300],
          400: TAROT_BLACK_HAZE[400],
          500: TAROT_BLACK_HAZE[500],
          600: TAROT_BLACK_HAZE[600],
          700: TAROT_BLACK_HAZE[700],
          750: TAROT_BLACK_HAZE[750],
          800: TAROT_BLACK_HAZE[800],
          850: TAROT_BLACK_HAZE[850],
          DEFAULT: TAROT_BLACK_HAZE[900]
        },
        tarotJade: {
          50: TAROT_JADE[50],
          100: TAROT_JADE[100],
          200: TAROT_JADE[200],
          300: TAROT_JADE[300],
          400: TAROT_JADE[400],
          DEFAULT: TAROT_JADE[500],
          600: TAROT_JADE[600],
          700: TAROT_JADE[700],
          800: TAROT_JADE[800],
          900: TAROT_JADE[900]
        },
        tarotCarnation: {
          50: TAROT_CARNATION[50],
          100: TAROT_CARNATION[100],
          200: TAROT_CARNATION[200],
          300: TAROT_CARNATION[300],
          400: TAROT_CARNATION[400],
          DEFAULT: TAROT_CARNATION[500],
          600: TAROT_CARNATION[600],
          700: TAROT_CARNATION[700],
          800: TAROT_CARNATION[800],
          900: TAROT_CARNATION[900]
        },
        tarotAstral: {
          50: TAROT_ASTRAL[50],
          100: TAROT_ASTRAL[100],
          200: TAROT_ASTRAL[200],
          300: TAROT_ASTRAL[300],
          400: TAROT_ASTRAL[400],
          500: TAROT_ASTRAL[500],
          DEFAULT: TAROT_ASTRAL[500],
          600: TAROT_ASTRAL[600],
          700: TAROT_ASTRAL[700],
          800: TAROT_ASTRAL[800],
          900: TAROT_ASTRAL[900]
        },
        tarotMercury: {
          50: TAROT_MERCURY[50],
          100: TAROT_MERCURY[100],
          200: TAROT_MERCURY[200],
          300: TAROT_MERCURY[300],
          400: TAROT_MERCURY[400],
          500: TAROT_MERCURY[500],
          DEFAULT: TAROT_MERCURY[500],
          600: TAROT_MERCURY[600],
          700: TAROT_MERCURY[700],
          800: TAROT_MERCURY[800],
          900: TAROT_MERCURY[900]
        },
        primary: {
          50: TAROT_JADE[50],
          100: TAROT_JADE[100],
          200: TAROT_JADE[200],
          300: TAROT_JADE[300],
          400: TAROT_JADE[400],
          DEFAULT: TAROT_JADE[500],
          600: TAROT_JADE[600],
          700: TAROT_JADE[700],
          800: TAROT_JADE[800],
          900: TAROT_JADE[900],
          contrastText: '#333333'
        }
      },
      backgroundColor: {
        default: TAROT_BLACK_HAZE[800]
      },
      textColor: {
        textPrimary: colors.coolGray[200],
        textSecondary: colors.coolGray[400]
      },
      // MEMO: inspired by https://material-ui.com/customization/default-theme/
      zIndex: {
        tarotMobileStepper: 1000,
        tarotSpeedDial: 1050,
        tarotAppBar: 1100,
        tarotDrawer: 1200,
        tarotModal: 1300,
        tarotSnackbar: 1400,
        tarotTooltip: 1500
      }
    }
  },
  variants: {
    extend: {
      borderWidth: ['hover', 'focus'],
      saturate: ['hover', 'focus'],
      opacity: ['disabled'],
      cursor: ['disabled'],
      borderRadius: [
        'first',
        'last'
      ],
      margin: ['important']
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    plugin(function ({
      addBase,
      theme,
      addVariant
    }) {
      // MEMO: inspired by https://tailwindcss.com/docs/adding-base-styles#using-a-plugin
      addBase({
        body: {
          color: theme('textColor.textPrimary')
        }
      });

      // MEMO: inspired by https://github.com/tailwindlabs/tailwindcss/issues/493#issuecomment-610907147
      addVariant('important', ({ container }) => {
        container.walkRules(rule => {
          rule.selector = `.\\!${rule.selector.slice(1)}`;
          rule.walkDecls(decl => {
            decl.important = true;
          });
        });
      });
    })
  ]
};