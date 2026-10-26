// ===============================
// SPENDWISE LOGIN JAVASCRIPT
// ===============================

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("loginEmail");
const passwordInput = document.getElementById("loginPassword");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");


// ===============================
// SHOW / HIDE PASSWORD
// ===============================

togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        togglePassword.textContent = "Hide";

    } else {

        passwordInput.type = "password";
        togglePassword.textContent = "Show";

    }

});


// ===============================
// LOGIN FORM SUBMISSION
// ===============================

loginForm.addEventListener("submit", function (event) {

    // Stop the browser from refreshing the page
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Clear previous message
    loginMessage.textContent = "";
    loginMessage.className = "login-message";


    // ===============================
    // VALIDATION
    // ===============================

    if (email === "") {

        showError("Please enter your UPI ID or email.");
        emailInput.focus();
        return;

    }


    if (password === "") {

        showError("Please enter your password.");
        passwordInput.focus();
        return;

    }


    if (password.length < 6) {

        showError("Password must contain at least 6 characters.");
        passwordInput.focus();
        return;

    }


    // ===============================
    // SUCCESS
    // ===============================

    showSuccess("Login successful! Redirecting...");

    setTimeout(function () {

        window.location.href = "dashboard.html";

    }, 1000);

});


// ===============================
// MESSAGE FUNCTIONS
// ===============================

function showError(message) {

    loginMessage.textContent = message;
    loginMessage.className = "login-message error";

}


function showSuccess(message) {

    loginMessage.textContent = message;
    loginMessage.className = "login-message success";

}
