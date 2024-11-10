import { useTheme } from '@mui/material/styles';
import { AppBar, Toolbar } from '@mui/material';

const Header = ({ children }) => {
  const theme = useTheme();

  // common header
  const mainHeader = (
    <Toolbar>
      {children}
    </Toolbar>
  );

  // app-bar params
  const appBar = {
    position: 'fixed',
    color: 'inherit',
    elevation: 0,
    sx: {
      borderBottom: `1px solid ${theme.palette.divider}`
    }
  };

  return (
    <>
        <AppBar {...appBar}>{mainHeader}</AppBar>
    </>
  );
};

export default Header;
