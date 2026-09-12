import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import * as maplibregl from 'https://unpkg.com/maplibre-gl@^6.9.0/dist/maplibre-gl.mjs';

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
    const user = await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            unsubscribe();
            resolve(currentUser);
        });
    });

    if (!user) {
        window.location.replace("../index.html");
        return false;
    }

    currentUserId = user.id;

    const userData = await getDoc(doc(db, "UserData", user.uid));
    totalPoints = Number(userData.data()?.points ?? 0);
    pointsTotal.textContent = totalPoints;
    return true;
}

function addPoints(amount) {
    totalPoints += amount;
    pointsTotal.textContent = totalPoints;
    pointsAwardNotice.classList.add("visible");

    pointsSavePromise = pointsSavePromise.then(async () => {
        try {
            await updateDoc(doc(db, "UserData", currentUserId), { points: totalPoints });
        } catch (error) {
            console.error("Could not save user points:", error.message);
        }
    });
}

loadUserPoints();
