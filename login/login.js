import { createClient } from '@supabase/supabase-js'

const form = document.querySelector("#login-form");
const message = document.querySelector("#message");
const signupbtn = document.querySelector("#signup");
const email = document.querySelector("#emailfield").value;
const password = document.querySelector("#passfield").value;
const signinbtn = document.querySelector("#signin");
const supabase = createClient('https://jxasieuljeucnbmlneve.supabase.co', 'sb_publishable_YYOWZb4RZ3u3gurJd0gqmg_s7GKRE0y');


signupbtn.addEventListener("click", async () => {
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
});

signinbtn.addEventListener("click",async()=>{
    supabase.auth.signInWithPassword({email,password});
    if (error) {
    message.textContent = error.message;
    return;
    }
    
  window.location.href="/map/map.js";
});


async function SIGNOUT(){
const {error} = await supabase.auth.signOut();
if(error){
message.textContent = error.message;
    return;
}  
window.location.href="/login/login.html";
}

