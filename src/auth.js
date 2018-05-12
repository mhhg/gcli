

localStorage.removeItem('currentUser');

function FuncIsLoggedIn() {
  let state = localStorage.getItem('currentUser');
  console.log("[FuncIsLoggedIn] state", state);
  if (state !== null) {
    return true;
  }
  return false
}


export default FuncIsLoggedIn