import { AppAside, AppBreadcrumb, AppFooter, AppHeader, AppSidebar, AppSidebarFooter, AppSidebarForm, AppSidebarHeader, AppSidebarMinimizer, AppSidebarNav } from "@coreui/react";
import React, { Component } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";
import { Auth } from "../../config";
import routes from "../../routes"; // routes config
import navigation from "../../_nav"; // sidebar nav config
import DefaultAside from "./DefaultAside";
import DefaultFooter from "./DefaultFooter";
import DefaultHeader from "./DefaultHeader";

class DefaultLayout extends Component {
  render() {
    const main = (<main className="main k-rt">
      <AppBreadcrumb appRoutes={routes} />
      <Container fluid>
        <Switch>{routes.map((route, idx) => {
          return route.component ? (<Route key={idx}
            path={route.path} exact={route.exact} name={route.name}
            render={props => <route.component {...props} />} />) : null;
        })}
          <Redirect from="/" to="/dashboard" />
        </Switch>
      </Container>
    </main>);
    return Auth() ? (<div className="app">
      <AppHeader fixed><DefaultHeader /></AppHeader>
      <div className="app-body">
        <AppSidebar fixed display="lg">
          <AppSidebarHeader /><AppSidebarForm />
          <AppSidebarNav navConfig={navigation} {...this.props} />
          <AppSidebarFooter /><AppSidebarMinimizer />
        </AppSidebar>
        {main}
        <AppAside fixed hidden><DefaultAside /></AppAside>
      </div>
      <AppFooter><DefaultFooter /></AppFooter>
    </div>) : (<Redirect to="/login" />);
  }
}
export default DefaultLayout;
document.body.classList.toggle('sidebar-minimized');