import React, { Component } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import {
  AppAside,
  AppBreadcrumb,
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppSidebarNav
} from "@coreui/react";
// sidebar nav config
import navigation from "../../_nav";
// routes config
import routes from "../../routes";
import DefaultAside from "./DefaultAside";
import DefaultFooter from "./DefaultFooter";
import DefaultHeader from "./DefaultHeader";
import FuncIsLoggedIn from "../../auth";

import Socket from "../../socket";

class DefaultLayout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      isLoggedIn: false,
      isSubmitted: false,
      isSocketAvailable: false
    };

    this.callbackLogin = this.callbackLogin.bind(this);

    const localStorageSession = localStorage.getItem("superuser");
    localStorage.clear("superuser");

    if (localStorageSession !== null) {
      const user = JSON.parse(localStorageSession);

      if (user.token !== "") {
        console.log(
          "[DefaultLayout.constructor] parsed superuser session, user:",
          user
        );

        const request = {
          token: user.token
        };

        console.log("[DefaultLayout.constructor] emit login request:", request);

        Socket.emit("user:auth", JSON.stringify(request), this.callbackLogin);
      }
    }
  }

  callbackLogin(stringResponse) {
    let response = JSON.parse(stringResponse);

    console.log("[DefaultLayout.callbackLogin] response:", response);

    if (response.code !== 200) {
      if (this.state.isSubmitted === true) {
        alert(
          "[DEBUG] unauthorized access. server response: " + stringResponse
        );
      }
      return;
    }

    localStorage.setItem("superuser", stringResponse);

    this.setState({
      isLoggedIn: true,
      isSocketAvailable: true
    });
  }

  render() {
    return this.state.isLoggedIn ? (
      <div className="app">
        <AppHeader fixed>
          <DefaultHeader />
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed display="lg">
            <AppSidebarHeader />
            <AppSidebarForm />
            <AppSidebarNav navConfig={navigation} {...this.props} />
            <AppSidebarFooter />
            <AppSidebarMinimizer />
          </AppSidebar>
          <main className="main">
            <AppBreadcrumb appRoutes={routes} />
            <Container fluid>
              <Switch>
                {routes.map((route, idx) => {
                  return route.component ? (
                    <Route
                      key={idx}
                      path={route.path}
                      exact={route.exact}
                      name={route.name}
                      render={props => <route.component {...props} />}
                    />
                  ) : null;
                })}
                <Redirect from="/" to="/dashboard" />
              </Switch>
            </Container>
          </main>
          <AppAside fixed hidden>
            <DefaultAside />
          </AppAside>
        </div>
        <AppFooter>
          <DefaultFooter />
        </AppFooter>
      </div>
    ) : (
      <Redirect to="/login" />
    );
  }
}

export default DefaultLayout;
