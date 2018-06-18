import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  CardGroup,
  Card,
  CardBody,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from "reactstrap";
import { Redirect } from "react-router-dom";

import Socket from "../../../socket";
import FuncIsLoggedIn from "../../../auth";

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      isLoggedIn: false,
      isSubmitted: false,
      isSocketAvailable: false
    };

    this.submitForm = this.submitForm.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.callbackLogin = this.callbackLogin.bind(this);
  }

  submitForm(event) {
    console.log("[Login.submitForm] triggered, this.state:", this.state);

    let request;

    event.preventDefault();
    if (
      this.state.username === "" ||
      this.state.password === "" ||
      this.state.password.length < 6
    ) {
      alert("Invalid Username or password");
      return;
    }

    this.setState({ isSubmitted: true });

    request = {
      username: this.state.username,
      password: this.state.password
    };

    Socket.emit("user:auth", JSON.stringify(request), this.callbackLogin);
  }

  callbackLogin(stringResponse) {
    let response = JSON.parse(stringResponse);

    console.log("[Login.callbackLogin] response:", response);

    if (response.code !== 200) {
      if (this.state.isSubmitted === true) {
        alert(
          "[DEBUG] unauthorized access. server response: " + stringResponse
        );
      }
      localStorage.setItem("authState", "false");
      return;
    }

    localStorage.setItem("superuser", stringResponse);
    localStorage.setItem("authState", "true");

    this.setState({
      isLoggedIn: true,
      isSocketAvailable: true
    });
  }

  onChangeUsername(event) {
    console.log("[Login.onChangeUsername] triggered");

    this.setState({ username: event.target.value });
  }

  onChangePassword(event) {
    console.log("[Login.onChangePassword] triggered");

    this.setState({ password: event.target.value });
  }

  render() {
    const { isLoggedIn } = this.state;
    const { isSocketAvailable } = this.state;

    if (localStorage.getItem("socketConnected") !== "true") {
      return (
        <div>
          Connecting to the server... please wait.
        </div>
      )
    }

    if (FuncIsLoggedIn()) {
      return <Redirect to="/mozhgan" />;
    }

    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <h1>Login</h1>
                    <p className="text-muted">Sign In to your account</p>
                    <form onSubmit={this.submitForm}>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          type="text"
                          placeholder="Username"
                          onChange={this.onChangeUsername}
                          value={this.state.username}
                        />
                      </InputGroup>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          type="password"
                          placeholder="Password"
                          onChange={this.onChangePassword}
                          value={this.state.password}
                        />
                      </InputGroup>
                      <Row>
                        <Col xs="6">
                          <Button
                            color="primary"
                            type="submit"
                            className="px-4"
                          >
                            Login
                          </Button>
                        </Col>
                        {/* <Col xs="6" className="text-right">
                          <Button color="link" className="px-0">Forgot password?</Button>
                        </Col> */}
                      </Row>
                    </form>
                  </CardBody>
                </Card>
                {/* <Card className="text-white bg-primary py-5 d-md-down-none" style={{ width: 44 + '%' }}>
                  <CardBody className="text-center">
                    <div>
                      <h2>Sign up</h2>
                      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.</p>
                      <Button color="primary" className="mt-3" active>Register Now!</Button>
                    </div>
                  </CardBody>
                </Card> */}
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Login;
