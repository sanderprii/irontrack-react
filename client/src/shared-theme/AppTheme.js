import * as React from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// ✅ Import kõik vajalikud failid alguses
import { inputsCustomizations } from './customizations/inputs';
import { dataDisplayCustomizations } from './customizations/dataDisplay';
import { feedbackCustomizations } from './customizations/feedback';
import { navigationCustomizations } from './customizations/navigation';
import { surfacesCustomizations } from './customizations/surfaces';
import { colorSchemes, typography, shadows, shape } from './themePrimitives';

// ✅ Loo teema kontekst
export const ThemeContext = React.createContext();

const defaultTypography = typography || {
    fontFamily: 'Roboto, Arial, sans-serif',
    fontWeightBold: 700,
};

const defaultColorSchemes = {
    light: {
        palette: {
            primary: { main: '#FFB347' }, // Pehme pastelne oranž (sobib logoga)
            secondary: { main: '#4A4A4A' }, // Tumehall tasakaalustamiseks
            background: {
                default: '#ECECEC',  // Kogu lehe taust
                paper: '#FFFFFF'  // Kaardid ja dialoogid
            },
            text: {
                primary: '#2B2B2B', // Sügavam hallikas must
                secondary: '#555555' // Kergem hall tasakaaluks
            },
        },
    },
    dark: {
        palette: {
            primary: { main: '#FFB347' }, // Oranž jääb esile ka tumedas režiimis
            secondary: { main: '#F5F5F5' }, // Helehall tasakaaluks
            background: {
                default: '#2B2B2B',  // Tumedam hallikas must
                paper: '#333333'  // Kaartide ja modaalide taust
            },
            text: {
                primary: '#CCCCCC', // Tume taust vajab heledat teksti
                secondary: '#BBBBBB' // Vähem kontrasti jaoks pehmem hall
            },
        },
    },
};


export default function AppTheme({ children, disableCustomTheme, themeComponents }) {
    const storedTheme = localStorage.getItem('themeMode') || 'light';
    const [mode, setMode] = React.useState(storedTheme);

    const theme = React.useMemo(() => {
        return disableCustomTheme
            ? {}
            : createTheme({
                palette: mode === 'dark' ? defaultColorSchemes.dark.palette : defaultColorSchemes.light.palette,
                typography: defaultTypography,
                shadows: shadows || [],
                shape: shape || { borderRadius: 8 },
                spacing: 8,
                components: {
                    ...inputsCustomizations,
                    ...dataDisplayCustomizations,
                    ...feedbackCustomizations,
                    ...navigationCustomizations,
                    ...surfacesCustomizations,
                    ...themeComponents,
                },
            });
    }, [mode, disableCustomTheme, themeComponents]);

    const toggleTheme = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        localStorage.setItem('themeMode', newMode);
    };

    if (disableCustomTheme) {
        return <React.Fragment>{children}</React.Fragment>;
    }

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <ThemeProvider theme={theme} disableTransitionOnChange>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}

AppTheme.propTypes = {
    children: PropTypes.node,
    disableCustomTheme: PropTypes.bool,
    themeComponents: PropTypes.object,
};
