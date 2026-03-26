let isLogin = true;

function toggleForm() {
    isLogin = !isLogin;
    const title = document.getElementById("form-title");
    const btn = document.getElementById("submit-btn");
    const toggleText = document.getElementById("toggle-text");

    if(isLogin){
        title.innerText = "Ambulance Login";
        btn.innerText = "Login";
        toggleText.innerHTML = `Don't have an account? <span onclick="toggleForm()">Register</span>`;
    } else {
        title.innerText = "Register Account";
        btn.innerText = "Register";
        toggleText.innerHTML = `Already have an account? <span onclick="toggleForm()">Login</span>`;
    }
}

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    if(email === "" || password === ""){
        message.innerText = "Please fill all fields";
        return;
    }

    if(isLogin){
        message.style.color = "green";
        message.innerText = "Login Successful (Demo)";
    } else {
        message.style.color = "green";
        message.innerText = "Registered Successfully (Demo)";
    }
}

function socialLogin(platform){
    const message = document.getElementById("message");
    message.style.color = "green";
    message.innerText = `Logged in with ${platform} (Demo)`;
}
