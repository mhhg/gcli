import React from 'react';
import Loadable from 'react-loadable'

import DefaultLayout from './containers/DefaultLayout';

function Loading() {
  return <div>Loading...</div>;
}

const Login = Loadable({
  loader: () => import('./views/Pages/Login/Login'),
  loading: Loading,
});

const Providers = Loadable({
  loader: () => import('./views/Providers/Provider'),
  loading: Loading,
});


const routes = [
  { path: '/', exact: true, name: 'Home', component: DefaultLayout },
  { path: '/provider', name: 'Provider', component: Providers },
  { path: '/login', exact: true, name: 'Login', component: Login },
];

export default routes;
