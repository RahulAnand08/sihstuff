const form = document.querySelector("#login-form");
const message = document.querySelector("#message");
const signupbtn = document.querySelector("#signup");
const googleauthbtn = document.querySelector("#googleauth");
const gitauthbtn = document.querySelector("#gitauth");
const signinbtn = document.querySelector("#signin");
const supabase = window.supabase.createClient('https://jxasieuljeucnbmlneve.supabase.co', 'sb_publishable_YYOWZb4RZ3u3gurJd0gqmg_s7GKRE0y');

if(signupbtn){
signupbtn.addEventListener("click", async () => {
const email = document.querySelector("#emailfield").value;
const password = document.querySelector("#passfield").value;
let role = document.querySelector("#prof").value;
const {data,error}=await 
    supabase.auth.signUp({email,password});
    if (error) {
    message.textContent = error.message;
    return;
    }
		if (!data.user) {
			message.textContent = "Could not create the account. Please try again.";
			return;
    }
  if(role=="tourist"){
  window.location.href="/map/map.html";
  }
  else if(role=="seller"){
  window.location.href="/marketplace/marketplace.html";
  }
});
}
if(signinbtn){
signinbtn.addEventListener("click",async()=>{
const email = document.querySelector("#emailfield").value;
const password = document.querySelector("#passfield").value;
let role = document.querySelector("#prof").value;

  const {error}=await supabase.auth.signInWithPassword({email,password});
    if (error) {
    message.textContent = error.message;
    return;
    }
  if(role=="tourist"){
  window.location.href="/map/map.html";
  }
  else if(role=="seller"){
  window.location.href="/marketplace/marketplace.html";
  }
});
}
if(googleauthbtn){
let role = document.querySelector("#prof").value;
  googleauthbtn.addEventListener("click",async()=>{
  const { data, error } = await
  supabase.auth.signInWithOAuth({ provider:'google' });
  if(error){
    message.textContent = error.message;
    return;
  }
  if(role=="tourist"){
  window.location.href="/map/map.html";
  }
  else if(role=="seller"){
  window.location.href="/marketplace/marketplace.html";
  }
  });
}

if(gitauthbtn){
  gitauthbtn.addEventListener("click",async()=>{
let role = document.querySelector("#prof").value;
  let redirect;
  if(role=="tourist"){
  redirect="https://rahulanand08.github.io/sihstuff/map/map.html";
  }
  else if(role=="seller"){
  redirect="https://rahulanand08.github.io/sihstuff/marketplace/marketplace.html";
  }
  const { data, error } = await
      supabase.auth.signInWithOAuth({
    provider:'github',
    options: {
      redirectTo: redirect
    }  
  });
  if(error){
    message.textContent = error.message;
    return;
  }
  });
}

const signoutbtn = document.querySelector("#signout");
if(signoutbtn){
signoutbtn.addEventListener("click",async ()=>{
const {error} = await supabase.auth.signOut();
if(error){
message.textContent = error.message;
    return;
}  
window.location.href="/login/login.html";
});}

