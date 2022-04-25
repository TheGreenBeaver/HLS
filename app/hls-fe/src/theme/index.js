import { createTheme } from '@mui/material';
import { amber, green } from '@mui/material/colors';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 700,
      md: 900,
      lg: 1100,
      xl: 1400
    }
  },
  palette: {
    primary: { main: green[700] },
    secondary: { main: amber[500] }
  }
});

export default theme;