import {useEffect, useState} from 'react';
import {Outlet} from 'react-router-dom';

// material-ui
import {useTheme} from '@mui/material/styles';
import {Box, Toolbar, useMediaQuery} from '@mui/material';

// project import
import Header from './Header';

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = ({children, headerContent}) => {
    const theme = useTheme();
    const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));

    // drawer toggler
    const [open, setOpen] = useState();
    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    // set media wise responsive drawer
    useEffect(() => {
        setOpen(!matchDownLG);
    }, [matchDownLG]);

    useEffect(() => {
        setOpen(false)
    }, []);

    return (
        <Box sx={{display: 'flex', width: '100%'}}>
            <Header open={open} handleDrawerToggle={handleDrawerToggle} children={headerContent}/>
            <Box component="main" sx={{width: '100%', flexGrow: 1, p: {xs: 2, sm: 3}}}>
                {/*<Breadcrumbs navigation={navigation} title />*/}
                <Toolbar sx={{mt: 2}} variant='dense'/>
                <Outlet/>
                {children}
            </Box>
        </Box>
    );
};

export default MainLayout;
