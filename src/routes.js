import React from "react";
import Loadable from "react-loadable";

import DefaultLayout from "./containers/DefaultLayout";

function Loading() {
    return <div>Loading...</div>;
}

const Login = Loadable({
    loader: () => import("./views/Pages/Login/Login"),
    loading: Loading
});

const Users = Loadable({
    loader: () => import("./views/Users/User"),
    loading: Loading
});

const Providers = Loadable({
    loader: () => import("./views/Providers/Provider"),
    loading: Loading
});

const Map = Loadable({
    loader: () => import("./views/Map/Map"),
    loading: Loading
});

const External = Loadable({
    loader: () => import("./views/External/main"),
    loading: Loading
});

const repair = Loadable({
    loader: () => import("./views/Repair/main"),
    loading: Loading
});

const routes = [
    { path: "/", exact: true, name: "Home", component: DefaultLayout },
    { path: "/login", exact: true, name: "Login", component: Login },
    { path: "/user", name: "User", component: Users },
    // { path: "/provider", name: "Provider", component: Providers },
    { path: "/map", name: "Map", component: Map },
    { path: "/Provider", name: "Provider", component: External },
    { path: "/repair", name: "Repair", component: repair }
];

export default routes;
