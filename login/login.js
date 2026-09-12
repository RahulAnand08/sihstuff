import { auth, db, googleProvider, githubProvider } from "../firebase.js";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	sendEmailVerification,
	sendPasswordResetEmail,
	confirmPasswordReset,
	signOut,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const form = document.querySelector("#login-form");
const message = document.querySelector("#message");
const signupbtn = document.querySelector("#signup");
const googleauthbtn = document.querySelector("#googleauth");
const gitauthbtn = document.querySelector("#gitauth");
const signinbtn = document.querySelector("#signin");
const resetbtn = document.querySelector("#resetbtn");
const signoutbtn = document.querySelector("#signout");
const pendingProfileKey = "pendingUserProfile";

function showError(error) {
	message.textContent = error.message || "Something went wrong.";
}

function selectedRole() {
	return document.querySelector("#prof")?.value ||
		JSON.parse(localStorage.getItem(pendingProfileKey) || "null")?.role ||
		"tourist";
}

async function saveUserData(user, profile = {}) {
	const userDataRef = doc(db, "UserData", user.uid);
	const existing = await getDoc(userDataRef);

	if (!existing.exists()) {
		await setDoc(userDataRef, {
			id: user.uid,
			role: profile.role || "tourist",
			username: profile.username || user.displayName || user.email.split("@")[0],
			points: 0,
		});
	}

	return (await getDoc(userDataRef)).data();
}

async function redirectUser(user) {
	const userData = await getDoc(doc(db, "UserData", user.uid));
	const redirect = makeredirecturl(userData.data()?.role);

	if (!redirect) {
		message.textContent = "Invalid user role.";
		return;
	}

	window.location.href = redirect;
}

async function completeVerifiedProfile(user) {
	if (!user.emailVerified) {
		throw new Error("Please confirm your email before signing in.");
	}

	const profile = JSON.parse(localStorage.getItem(pendingProfileKey) || "null");
	await saveUserData(user, profile || {});
	localStorage.removeItem(pendingProfileKey);
}

/// AESTHETICCCCCCCCCCCCCCCCCCCCC
const username = document.querySelector("#username");
const pass = document.querySelector("#passfield");
const e_mail = document.querySelector("#emailfield");
let fields = [pass, e_mail, username];
let defaults = ["Enter a password", "Enter E-Mail", "Enter a display name"];
for (let i = 0; i < 3; i++) {
	if (fields[i]) {
		fields[i].addEventListener("focus", () => {
			if (fields[i].value == defaults[i]) {
				fields[i].value = "";
			}
		});
		fields[i].addEventListener("blur", () => {
			if (fields[i].value == "") {
				fields[i].value = defaults[i];
			}
		});
	}
}
///////////////////////////////////////////////

// Redirect helper funcsssssssssssssssss//////////
function getRedirect() {
	const role = selectedRole();
	if (role === "tourist") {
		return "https://rahulanand08.github.io/sihstuff/map/map.html";
	}
	if (role === "seller") {
		return "https://rahulanand08.github.io/sihstuff/marketplace/marketplace.html";
	}
	return null;
}

function getrole() {
	return selectedRole();
}

function makeredirecturl(role) {
	if (role === "tourist") {
		return "https://rahulanand08.github.io/sihstuff/map/map.html";
	}
	if (role === "seller") {
		return "https://rahulanand08.github.io/sihstuff/marketplace/marketplace.html";
	}
	return null;
}
///////////////////////////////////////////////////

//SIGNUP//////////////////////////////////////////////
if (signupbtn) {
	signupbtn.addEventListener("click", async () => {
		const email = document.querySelector("#emailfield").value;
		const password = document.querySelector("#passfield").value;
		const profile = {
			role: getrole(),
			username: document.querySelector("#username").value,
		};

		try {
			const credential = await createUserWithEmailAndPassword(auth, email, password);
			localStorage.setItem(pendingProfileKey, JSON.stringify(profile));
			await sendEmailVerification(credential.user, {
				url: "https://rahulanand08.github.io/sihstuff/login/login.html",
				handleCodeInApp: false,
			});
			await signOut(auth);
			message.textContent = "Account created. Confirm your email, then sign in.";
		} catch (error) {
			showError(error);
		}
	});
}
//////////////////////////////////////////////////////////////
if (signinbtn) {
	signinbtn.addEventListener("click", async () => {

		const email = document.querySelector("#emailfield").value;
		const password = document.querySelector("#passfield").value;

		// SIGN IN
		try {
			const credential = await signInWithEmailAndPassword(auth, email, password);
			await credential.user.reload();
			await completeVerifiedProfile(credential.user);
			await redirectUser(credential.user);
		} catch (error) {
			showError(error);
			if (auth.currentUser && !auth.currentUser.emailVerified) await signOut(auth);
		}
	});
}

if (signoutbtn) {
	signoutbtn.addEventListener("click", async () => {
		await signOut(auth);
		window.location.href = "https://rahulanand08.github.io/sihstuff/";
	});
}

if (gitauthbtn) {
	gitauthbtn.addEventListener("click", async () => {
		const redirect = getRedirect();
		if (!redirect) {
			message.textContent = "Please select a profile.";
			return;
		}
		try {
			const credential = await signInWithPopup(auth, githubProvider);
			await saveUserData(credential.user, { role: selectedRole() });
			window.location.href = redirect;
		} catch (error) {
			showError(error);
		}
	});
}

if (googleauthbtn) {
	googleauthbtn.addEventListener("click", async () => {
		const redirect = getRedirect();
		if (!redirect) {
			message.textContent = "Please select a profile.";
			return;
		}
		try {
			const credential = await signInWithPopup(auth, googleProvider);
			await saveUserData(credential.user, { role: selectedRole() });
			window.location.href = redirect;
		} catch (error) {
			showError(error);
		}
	});
}

if (resetbtn) {
	resetbtn.addEventListener("click", async () => {
		const email = document.querySelector("#emailfield").value;
		try {
			await sendPasswordResetEmail(auth, email, {
				url: "https://rahulanand08.github.io/sihstuff/login/resetpass.html",
				handleCodeInApp: true,
			});
			message.textContent = "Password Reset Email Sent";
		} catch (error) {
			showError(error);
		}
	});
}

const backtologin = document.querySelector("#login");
if (backtologin) {
	backtologin.addEventListener("click", async () => {
		const pass = document.querySelector("#passfield").value;
		const confirmpass = document.querySelector("#confirmpassfield").value;
		if (confirmpass != pass) {
			message.textContent = "Passwords Dont Match";
			return;
		} else {
			try {
				const code = new URLSearchParams(window.location.search).get("oobCode");
				if (!code) throw new Error("Password reset link is missing or expired.");
				await confirmPasswordReset(auth, code, pass);
				message.textContent = "Password updated successfully.";
				window.location.href = "login.html"
			} catch (error) {
				showError(error);
			}
		}
	});
}
