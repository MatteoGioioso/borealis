import {lazy} from 'react';
import Loadable from './components/Loadable';
import MainLayout from './components/MainLayout';
import {useRoutes} from "react-router-dom";
import HeaderContentSelfHosted from "./components/SelfHosted/HeaderContent";

const ClustersLoadableSelfHosted = Loadable(lazy(() => import('./components/SelfHosted/Activities')));
const ClustersListLoadableSelfHosted = Loadable(lazy(() => import('./components/SelfHosted/ClustersList')))
const PlansLoadableSelfHosted = Loadable(lazy(() => import('./components/SelfHosted/Plans')))
const QueryDetailsLoadableSelfHosted = Loadable(lazy(() => import('./components/SelfHosted/QueryDetails')))


const Routes = () => ({
    path: '/',
    element: <MainLayout headerContent={<HeaderContentSelfHosted/>}/>,
    children: [
        {
            path: '/',
            element: <ClustersListLoadableSelfHosted/>
        },
        {
            path: '/clusters',
            element: <ClustersListLoadableSelfHosted/>
        },
        {
            path: '/clusters/:cluster_id',
            element: <ClustersLoadableSelfHosted/>
        },
        {
            path: '/clusters/:cluster_id/plans',
            element: <PlansLoadableSelfHosted/>
        },
        {
            path: '/clusters/:cluster_id/queries/:query_fingerprint',
            element: <QueryDetailsLoadableSelfHosted/>
        },
    ]
})

export default function Router() {
    return useRoutes([Routes()]);
}

