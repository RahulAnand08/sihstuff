const form = document.querySelector("#login-form");
const message = document.querySelector("#message");
const signupbtn = document.querySelector("#signup");
const googleauthbtn = document.querySelector("#googleauth");
const gitauthbtn = document.querySelector("#gitauth");
const signinbtn = document.querySelector("#signin");
const resetbtn=document.querySelector("#resetbtn");
const signoutbtn = document.querySelector("#signout");
const supabase = window.supabase.createClient("https://jxasieuljeucnbmlneve.supabase.co", "sb_publishable_YYOWZb4RZ3u3gurJd0gqmg_s7GKRE0y");

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
    window.location.href = redirect;
  });
}

if (signinbtn) {
  signinbtn.addEventListener("click", async () => {
    const email = document.querySelector("#emailfield").value;
    const password = document.querySelector("#passfield").value;
    const redirect = getRedirect();
    if (!redirect) {
      message.textContent = "Please select a profile.";
      return;
    }
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
    window.location.href = redirect;
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

if(resetbtn){
  resetbtn.addEventListener("click",async()=>{
  const email = document.querySelector("#emailfield").value;
    const{data,error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo: "https://rahulanand08.github.io/sihstuff/login/resetpass.html"});
    
  if (error) {
    message.textContent = error.message;
    return;
  }
  else{
    message.textContent = "Password Reset Email Sent";
    return;
  }
  });
}

const backtologin=document.querySelector("#login");
if(backtologin){
  backtologin.addEventListener("click", async() =>{
    const pass=document.querySelector("#passfield").value;
    const confirmpass=document.querySelector("#confirmpassfield").value;
    if(confirmpass!=pass){
      message.textContent = "Passwords Dont Match";
      return;
    }
    else{
      const {data,error} = await supabase.auth.updateUser({password: pass});
      if(error){
      message.textContent = error.message;
      return;
      }
      else{
        window.location.href="login.html"
      }
    }
  });
}
