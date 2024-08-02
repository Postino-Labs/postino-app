import { withAccountKitUi, createColorSet } from '@account-kit/react/tailwind';

// wrap your existing tailwind config with 'withAccountKitUi'
export default withAccountKitUi(
  {
    // your tailwind config here
    // docs on setting up tailwind here: https://tailwindcss.com/docs/installation/using-postcss
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      container: {
        padding: '2rem',
      },
      extend: {},
    },
    plugins: [],
  },
  {
    // override account kit themes
    colors: {
      'btn-primary': createColorSet('#363FF9', '#9AB7FF'),
      'fg-accent-brand': createColorSet('#363FF9', '#9AB7FF'),
    },
    borderRadius: 'none',
  }
);
