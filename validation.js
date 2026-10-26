
console.log("Validate");

const registrationForm = document.getElementById("registration-form");

const nameInput = document.getElementById("full-name");
const emailInput = document.getElementById("email");
const githubInput = document.getElementById("github");
const avatarInput = document.getElementById("avatar");

const formNotice = document.getElementById("form-notice");

const MAX_FILE_SIZE = 500 * 1024;
const STORAGE_KEY = "codingConfRegistration";

// Display an error beside a field.
function showError(input, message) {
    const errorElement = document.getElementById(input.id + "-error");

    errorElement.textContent = message;
    input.setAttribute("aria-invalid", "true");
}

// Clear an error when the field is corrected.
function clearError(input) {
    const errorElement = document.getElementById(input.id + "-error");

    errorElement.textContent = "";
    input.removeAttribute("aria-invalid");
}

// Check whether an email has a valid basic structure.
function isValidEmail(email) {
    const emailPattern =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    return emailPattern.test(email);
}

// Check the GitHub username, including its required @ prefix.
function isValidGithub(username) {
    const githubPattern =
        /^@[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

    return githubPattern.test(username);
}

// Validate the text fields and the selected avatar.
function validateForm() {
    let isValid = true;

    const fullName = nameInput.value.trim();
    const email = emailInput.value.trim();
    const github = githubInput.value.trim();
    const avatar = avatarInput.files[0];

    clearError(nameInput);
    clearError(emailInput);
    clearError(githubInput);
    clearError(avatarInput);

    formNotice.textContent = "";

    // Full name must not be empty or contain only spaces.
    if (fullName === "") {
        showError(nameInput, "Please enter your full name.");
        isValid = false;
    }

    // Email must follow a basic user@domain.com structure.
    if (!isValidEmail(email)) {
        showError(emailInput, "Enter a valid email address.");
        isValid = false;
    }

    // GitHub username must begin with @.
    if (!isValidGithub(github)) {
        showError(
            githubInput,
            "Enter a valid GitHub username beginning with @."
        );
        isValid = false;
    }

    // An avatar must be selected.
    if (!avatar) {
        showError(avatarInput, "Please upload a profile image.");
        isValid = false;
    } else {
        // Only JPEG and PNG images are permitted.
        const allowedTypes = ["image/jpeg", "image/png"];

        if (!allowedTypes.includes(avatar.type)) {
            showError(
                avatarInput,
                "Your image must be a JPEG or PNG file."
            );
            isValid = false;
        }

        // The file must be strictly smaller than 500 KB.
        if (isValid===true && avatar.size >= MAX_FILE_SIZE) {
            showError(
                avatarInput,
                "Your image must be smaller than 500 KB."
            );
            isValid = false;
        }
    }

    return isValid;
}

// Clear field errors as the user edits their information.
[nameInput, emailInput, githubInput, avatarInput].forEach(function (input) {
    input.addEventListener("input", function () {
        clearError(input);
        formNotice.textContent = "";
    });

    input.addEventListener("change", function () {
        clearError(input);
        formNotice.textContent = "";
    });
});

// Read the uploaded avatar as a data URL.
function readAvatar(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();

        reader.onload = function () {
            resolve(reader.result);
        };

        reader.onerror = function () {
            reject(new Error("The selected image could not be read."));
        };

        reader.readAsDataURL(file);
    });
}

// Intercept submission instead of immediately reloading the page.
registrationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validateForm()) {
        const firstInvalidField =
            registrationForm.querySelector('[aria-invalid="true"]');

        if (firstInvalidField) {
            firstInvalidField.focus();
        }

        return;
    }

    const submitButton = registrationForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Preparing your ticket...";

    try {
        const avatar = avatarInput.files[0];
        const avatarData = await readAvatar(avatar);

        const registrationData = {
            fullName: nameInput.value.trim(),
            email: emailInput.value.trim(),
            github: githubInput.value.trim(),
            avatar: avatarData,
            ticketSerial: "#" + String(
                Math.floor(Math.random() * 90000) + 10000
            ),
            registeredAt: new Date().toISOString()
        };

        // Save the data so the ticket page can retrieve it.
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(registrationData)
        );

        // Navigate to the confirmation page.
        window.location.href = "ticket.html";
    } catch (error) {
        formNotice.textContent =
            error.message ||
            "Unable to save your registration. Please try again.";

        submitButton.disabled = false;
        submitButton.textContent = "Generate My Ticket →";
    }
});
