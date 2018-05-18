

localStorage.removeItem('superuser');

function FuncIsLoggedIn() {
  let state = localStorage.getItem('superuser');
  console.log("[FuncIsLoggedIn] state", state);
  if (state !== null) {
    return true;
  }
  return false
}


export default FuncIsLoggedIn