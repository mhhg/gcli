function FuncIsLoggedIn() {
    let state = localStorage.getItem('authState');
    console.log("[INFO][auth.FuncIsLoggedIn] authState", state);
    if (state === "true") {
        return true;
    }
    return false;
}

export default FuncIsLoggedIn