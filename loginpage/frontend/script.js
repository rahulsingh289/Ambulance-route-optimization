function login(){
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let message = document.getElementById("message");

    if(email === "" || password === ""){
        message.innerHTML = "⚠ Please fill all fields";
        message.style.color = "yellow";
        return;
    }

    if(email === "admin@gmail.com" && password === "1234"){
        message.innerHTML = "✅ Login Successful!";
        message.style.color = "lightgreen";

        setTimeout(()=>{
            alert("Redirecting to Dashboard...");
        },1000);
    } else {
        message.innerHTML = "❌ Invalid credentials";
        message.style.color = "red";
    }
}
