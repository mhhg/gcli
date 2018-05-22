

// localStorage.removeItem('superuser');

function FuncIsLoggedIn() {
  let state = localStorage.getItem('superuser');

  console.log("[INFO][FuncIsLoggedIn] state", state);

  if (state === null) {
    return false;
  }

  return true;
}


export default FuncIsLoggedIn