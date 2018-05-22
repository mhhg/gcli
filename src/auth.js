

// localStorage.removeItem('superuser');

function FuncIsLoggedIn() {
  let state = localStorage.getItem('authState');

  console.log("[INFO][FuncIsLoggedIn] state", state);

  if (state == "true") {
    console.log("[INFO][FuncIsLoggedIn] state TRUE", state);
    return true;
  }
  console.log("[INFO][FuncIsLoggedIn] state FALSE", state);

  return false;
}


export default FuncIsLoggedIn