import {Box, IconButton, Stack, Link, Typography, useMediaQuery, Button} from '@mui/material';
import {GithubOutlined} from '@ant-design/icons';
import {Link as RouterLink, useLocation, useNavigation, useParams} from 'react-router-dom';

// project import
import Search from '../MainLayout/Header/HeaderContent/Search';

const HeaderContent = () => {
    const {cluster_id} = useParams();
    const {pathname} = useLocation();

    return (
        <>
            {
                pathname !== `/clusters/${cluster_id}` && (
                    <Button component={RouterLink} to={`/clusters/${cluster_id}`} variant='outlined' sx={{ml: 1, pt: 0.3, pb: 0.3}}>
                        <Box sx={{flexShrink: 0}}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{p: 0.5}}>
                                <Typography variant="subtitle1">Query analytics</Typography>
                            </Stack>
                        </Box>
                    </Button>
                )
            }

            {/*{!matchesXs && <Search/>}*/}

            <Box sx={{width: '100%', ml: 1}}/>

            <Box sx={{flexShrink: 0, ml: 0.75, pr: 1.5}}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{p: 0.5}}>
                    <Typography variant="subtitle1">Borealis</Typography>
                </Stack>
            </Box>

            <IconButton
                component={Link}
                href="https://github.bus.zalan.do/mgioioso/borealis"
                target="_blank"
                disableRipple
                color="secondary"
                title="Github"
                sx={{color: 'text.primary', bgcolor: 'grey.100'}}
            >
                <GithubOutlined/>
            </IconButton>
        </>
    );
};

export default HeaderContent;
