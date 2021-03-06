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

const Repair = Loadable({
    loader: () => import("./views/Repair/Repair"),
    loading: Loading
});

const routes = [
    {
        path: "/",
        exact: true,
        name: "Home",
        component: DefaultLayout
    },
    {
        path: "/login",
        exact: true,
        name: "Login",
        component: Login
    },
    {
        path: "/user",
        name: "User",
        component: Users
    },
    {
        path: "/provider",
        name: "Provider",
        component: Providers
    },
    {
        path: "/map",
        name: "Map",
        component: Map
    },
    {
        path: "/repair",
        name: "Repair",
        component: Repair
    }
];

export default routes;
