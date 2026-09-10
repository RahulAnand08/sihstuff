const form = document.querySelector("#login-form");
const message = document.querySelector("#message");
const signupbtn = document.querySelector("#signup");
const googleauthbtn = document.querySelector("#googleauth");
const gitauthbtn = document.querySelector("#gitauth");
const signinbtn = document.querySelector("#signin");
const resetbtn = document.querySelector("#resetbtn");
const signoutbtn = document.querySelector("#signout");
const supabase = window.supabase.createClient("https://jxasieuljeucnbmlneve.supabase.co", "sb_publishable_YYOWZb4RZ3u3gurJd0gqmg_s7GKRE0y");

/// AESTHETICCCCCCCCCCCCCCCCCCCCC
const username = document.querySelector("#username");
const pass = document.querySelector("#passfield");
const e_mail = document.querySelector("#emailfield");
let fields=[pass,e_mail,username];
let defaults=["Enter a password","Enter E-Mail","Enter a display name"];
for(let i=0;i<3;i++){
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

function makeredirecturl(role){
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
    // signup 
    const email = document.querySelector("#emailfield").value;
    const password = document.querySelector("#passfield").value;
    const UserName = document.querySelector("#username").value;
    const role=getrole();
    const {data,error} = await supabase.auth.signUp({
      email,
      password,
      options:{
        emailRedirectTo: "https://rahulanand08.github.io/sihstuff",
        data: {
        ROLE:role,
        POINTS:0,
        USERNAME:UserName
        }
      }
    });
    if (error) {
      message.textContent = error.message;
      return;
    }
    if (!data.user) {
      message.textContent = "Could not create the account. Please try again.";
      return;
    }
  });
}
//////////////////////////////////////////////////////////////
if (signinbtn) {
  signinbtn.addEventListener("click", async () => {
    const email = document.querySelector("#emailfield").value;
    const password = document.querySelector("#passfield").value;
    const {error} = await supabase.auth.signInWithPassword({email,password});
    if (error) {
      message.textContent = error.message;
      return;
    }
    const { data: {user} }=await supabase.auth.getUser();
    const uuid=user.id;
    const {data,error:e} = await supabase.from("UserData").upsert({
      id: uuid,
      role: user.user_metadata.ROLE,
      points: user.user_metadata.POINTS
    });
    if (e) {
      message.textContent = e.message;
      return;
    }
    window.location.href=makeredirecturl(user.user_metadata.ROLE);
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
