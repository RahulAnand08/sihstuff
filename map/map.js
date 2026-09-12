const form = document.querySelector("#login-form");
const message = document.querySelector("#message");
const signupbtn = document.querySelector("#signup");

signupbtn.addEventListener("click", async () => {
    const email = document.querySelector("#emailfield").value;
    const password = document.querySelector("#passfield").value;

import "../login/login.js"

const map = new maplibregl.Map({
    container: "map",
    style: "https://tiles.openfreemap.org/styles/liberty",
    // center: [0, 0],
    center: [74.747432, 13.343971],
    pitch: 60,
    zoom: 18,
    bearing: 10,
});

const arrowElement = document.querySelector("#arrow");
const qrbut = document.querySelector(".qr");
const qrcont = document.querySelector(".readercont");
const qreader = document.querySelector("#reader");
const recenterbut = document.querySelector(".recenter");
const pointsButton = document.querySelector("#points-button");
const pointsTotal = document.querySelector("#points-total");
const pointsAwardNotice = document.querySelector("#points-award-notice");
const navbar = document.querySelector("#navbar");
const moreinfo = document.querySelector("#moreinfo");
const nearestloctxt = document.querySelector("#nearestloc");
const disttonearesttxt = document.querySelector("#disttonearest");
const aiAssistant = document.querySelector("#ai-assistant-moreinfo");
const aiAskButton = document.querySelector("#ai-ask-button");

let totalPoints = 0;
let currentUserId = null;
let currentPlaceIndex = 0;
const awardedPlaceIds = new Set();
let awardNoticeTimeout;
let pointsSavePromise = Promise.resolve();

async function loadUserPoints() {
    const {
        data: { user },
        error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        window.location.replace("index.html");
        return false;
    }

    currentUserId = user.id;

    const { data: userData, error: userDataError } = await supabaseClient
        .from("UserData")
        .select("points")
        .eq("id", user.id)
        .maybeSingle();

    if (userDataError) {
        console.error("Could not load user points:", userDataError.message);
        return false;
    }

    totalPoints = Number(userData?.points ?? 0);
    pointsTotal.textContent = totalPoints;
    return true;
}

function addPoints(amount) {
    totalPoints += amount;
    pointsTotal.textContent = totalPoints;
    pointsAwardNotice.classList.add("visible");

    pointsSavePromise = pointsSavePromise.then(async () => {
        const { error } = await supabaseClient
            .from("UserData")
            .update({ points: totalPoints })
            .eq("id", currentUserId);

        if (error) {
            console.error("Could not save user points:", error.message);
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

    const { error: profileError } = await supabaseClient
        .from("UserData")
        .upsert(
            {
                userId: data.user.id,
                points: 0,
                visitedPlaces: 0,
            },
            { onConflict: "userId", ignoreDuplicates: true },
        );

    if (profileError) {
        message.textContent = `Account created, but profile setup failed: ${profileError.message}`;
        return;
    }

    message.textContent = "Account created! You can now sign in.";
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#emailfield").value;
    const password = document.querySelector("#passfield").value;

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

    if (error) {
        message.textContent = error.message;
        return;
    }

    message.textContent = "Login successful!";

    window.location.href = "map.html";
});

async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        window.location.href = "map.html";
    }
}
