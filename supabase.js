const SUPABASE_URL = "https://jxasieuljeucnbmlneve.supabase.co";
const SUPABASE_KEY ="sb_publishable_YYOWZb4RZ3u3gurJd0gqmg_s7GKRE0y";

const email = document.query("#emailfield");
const password = document.query("#passfield");
const message = document.query("#message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    if (error) {
        message.textContent = error.message;
        return;
    }

    message.textContent = "Check your email to confirm your account.";
});

That's enough to create a Supabase user.

5. Login
const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
});

if (error) {
    console.error(error.message);
    return;
}

console.log("Logged in:", data.user);

You can then redirect:

window.location.href = "/index.html";
6. Check whether someone is logged in

This is particularly useful for your index.html:

const {
    data: { user }
} = await supabaseClient.auth.getUser();

if (user) {
    console.log("Logged in as:", user.email);
} else {
    console.log("Not logged in");
}

For example:

if (!user) {
    window.location.href = "/login.html";
}

So your site can have:

login.html
     ↓
  Supabase
     ↓
authenticated
     ↓
index.html
7. Logout

Very simple:

const { error } = await supabaseClient.auth.signOut();

if (!error) {
    window.location.href = "/login.html";
}

For example:

<button id="logout">Logout</button>
document.getElementById("logout").addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "/login.html";
});
8. Detect login/logout automatically

Supabase can notify your JS when authentication changes:

supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log(event);
    console.log(session);

    if (session) {
        console.log("User logged in:", session.user.email);
    } else {
        console.log("User logged out");
    }
});

This is useful for changing your UI:

supabaseClient.auth.onAuthStateChange((event, session) => {
    const loginButton = document.getElementById("login");
    const logoutButton = document.getElementById("logout");

    if (session) {
        loginButton.style.display = "none";
        logoutButton.style.display = "block";
    } else {
        loginButton.style.display = "block";
        logoutButton.style.display = "none";
    }
});
One important thing

If you're doing something like your personal/webring website where you have:

HTML
CSS
JS

you can absolutely use Supabase directly from the frontend, but you should understand the distinction:

Browser
   │
   │ publishable key
   ▼
Supabase Auth
   │
   ├── signup
   ├── login
   ├── logout
   └── session

The publishable key is not a secret.

But you should never do this:

const key = "service_role_key_here";

in browser JavaScript.

If you later want user profiles, posts, comments, etc., that's where Supabase's Postgres + Row Level Security (RLS) becomes important. You can make rules such as:

user A can edit user A's profile
user A cannot edit user B's profile

without having to build your own backend.

If you want, I can also 
show you a clean vanilla-JS Supabase auth system with login.html, signup.html, auth.js, protected pages, sessions, and a user profile, structured like a normal modular JS project.

Ad

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
