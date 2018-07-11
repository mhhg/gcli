// const Addr = "https://repo.reglazh.com";
// const Addr = "http://app.reglazh.com";
const Addr = "http://0.0.0.0";
const Port = "80";
module.exports = {
  Addr: Addr,
  Port: Port,
  Auth: FuncIsLoggedIn
}

function FuncIsLoggedIn() {
  let state = localStorage.getItem('authState');
  console.log("[INFO][auth.FuncIsLoggedIn] authState", state);
  if (state === "true") {
    return true;
  }
  return false;
}
