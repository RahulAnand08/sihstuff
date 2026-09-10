const form = document.querySelector("#login-form");
const message = document.querySelector("#message");
const signupbtn = document.querySelector("#signup");
const googleauthbtn = document.querySelector("#googleauth");
const gitauthbtn = document.querySelector("#gitauth");
const signinbtn = document.querySelector("#signin");
const resetbtn = document.querySelector("#resetbtn");
const signoutbtn = document.querySelector("#signout");
const supabase = window.supabase.createClient("https://jxasieuljeucnbmlneve.supabase.co", "sb_publishable_YYOWZb4RZ3u3gurJd0gqmg_s7GKRE0y");

const username = document.querySelector("#username");
const pass = document.querySelector("#passfield");
const e_mail = document.querySelector("#emailfield");

if (pass) {
  pass.addEventListener("focus", () => {
    if (pass.value == "Enter a password") {
      pass.value = "";
    }
  });
  pass.addEventListener("blur", () => {
    if (pass.value == "") {
      pass.value = "Enter a password";
    }
  });
}

if (e_mail) {
  e_mail.addEventListener("focus", () => {
    if (e_mail.value == "Enter E-Mail") {
      e_mail.value = "";
    }
  });
  e_mail.addEventListener("blur", () => {
    if (e_mail.value == "") {
      e_mail.value = "Enter E-Mail";
    }
  });
}

if (username) {
  username.addEventListener("focus", () => {
    if (username.value == "Enter a display name") {
      username.value = "";
    }
  });
  username.addEventListener("blur", () => {
    if (username.value == "") {
      username.value = "Enter a display name";
    }
  });
}

function getRedirect() {
  const role = document.querySelector("#prof").value;
  if (role === "tourist") {
    return "https://rahulanand08.github.io/sihstuff/map/map.html";
  }
  if (role === "seller") {
    return "https://rahulanand08.github.io/sihstuff/marketplace/marketplace.html";
  }
  return null;
}

function getrole() {
  const role = document.querySelector("#prof").value;
  return role;
}

if (signupbtn) {
  signupbtn.addEventListener("click", async () => {
    const email = document.querySelector("#emailfield").value;
    const password = document.querySelector("#passfield").value;
    const redirect = getRedirect();
    if (!redirect) {
      message.textContent = "Please select a profile.";
      return;
    }
    const {
      data,
      error
    } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) {
      message.textContent = error.message;
      return;
    }
    if (!data.user) {
      message.textContent = "Could not create the account. Please try again.";
      return;
    }
    const ID = data.user.id;
    const userole = getrole();
    const UserName = document.querySelector("#username");
    const {
      error: tablerror
    } = await supabase.from("UserData").insert({
      id: ID,
      created_at: data.user.created_at,
      points: 0,
      role: userole,
      username: UserName.value
    });
    if (tablerror) {
      message.textContent = tablerror.message;
      return;
    }
    window.location.href = redirect;
  });
}

if (signinbtn) {
  signinbtn.addEventListener("click", async () => {
    const email = document.querySelector("#emailfield").value;
    const password = document.querySelector("#passfield").value;
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      message.textContent = error.message;
      return;
    }
    const userdat = await supabase.auth.getUser();
    const uuid = userdat.data.user.id;
    const {
      data,
      error: sqlerror
    } = await supabase.from("UserData").select("*").eq("id", uuid).single();
    if (sqlerror) {
      message.textContent = sqlerror.message;
      return;
    }
    if (data.role == "tourist") {
      window.location.href = "https://rahulanand08.github.io/sihstuff/map/map.html";
    } else if (data.role == "seller") {
      window.location.href = "https://rahulanand08.github.io/sihstuff/marketplace/marketplace.html";
    }
  });
}

if (signoutbtn) {
  signoutbtn.addEventListener("click", async () => {
    const {
      error
    } = await supabase.auth.signOut();
    if (error) {
      message.textContent = error.message;
      return;
    }
    window.location.href = "https://rahulanand08.github.io/sihstuff/login/login.html";
  });
}

if (gitauthbtn) {
  gitauthbtn.addEventListener("click", async () => {
    const redirect = getRedirect();
    if (!redirect) {
      message.textContent = "Please select a profile.";
      return;
    }
    const {
      error
    } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: redirect
      }
    });
    if (error) {
      message.textContent = error.message;
      return;
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
    const {
      error
    } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirect
      }
    });
    if (error) {
      message.textContent = error.message;
      return;
    }
  });
}

if (resetbtn) {
  resetbtn.addEventListener("click", async () => {
    const email = document.querySelector("#emailfield").value;
    const {
      data,
      error
    } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://rahulanand08.github.io/sihstuff/login/resetpass.html"
    });

    if (error) {
      message.textContent = error.message;
      return;
    } else {
      message.textContent = "Password Reset Email Sent";
      return;
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
      const {
        data,
        error
      } = await supabase.auth.updateUser({
        password: pass
      });
      if (error) {
        message.textContent = error.message;
        return;
      } else {
        window.location.href = "login.html"
      }
    }
  });
}
