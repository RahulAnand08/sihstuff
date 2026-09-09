import * as maplibregl from "https://unpkg.com/maplibre-gl@^6.4.1/dist/maplibre-gl.mjs";

import data from "./places.json" with { type: "json" };

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
let currentPlaceIndex = 0;
const awardedPlaceIds = new Set();
let awardNoticeTimeout;

async function loadUserPoints() {
    const {
        data: { user },
        error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        window.location.replace("index.html");
        return false;
    }

    const { data: userData, error: userDataError } = await supabaseClient
        .from("UserData")
        .select("points")
        .eq("userId", user.id)
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

    clearTimeout(awardNoticeTimeout);
    awardNoticeTimeout = setTimeout(() => {
        pointsAwardNotice.classList.remove("visible");
    }, 1800);
}

moreinfo.addEventListener("click", () => {
    navbar.classList.toggle("expanded");

    if (navbar.classList.contains("expanded")) {
        moreinfo.innerHTML =
            '<svg fill="#ffffff" width="25px" height="25px" viewBox="0 0 512 512" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"><path d="M256,478,80,302l21.2-21.21L241,420.6V34h30V420.6L410.84,280.75,432,302Z"/></svg>';
    } else {
        moreinfo.innerHTML =
            '<svg fill="#ffffff" width="25px" height="25px" viewBox="0 0 512 512" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"><path d="M256,34,432,210l-21.2,21.21L271,91.4V478H241V91.4L101.16,231.25,80,210Z"/></svg>';
    }
});

const placeFeatures = data.places.map((place) => {
    return {
        type: "Feature",

        geometry: {
            type: "Point",

            coordinates: [Number(place.longitude), Number(place.latitude)],
        },

        properties: {
            name: place.name ?? "Unknown location",
        },
    };
});

const placeGeoJSON = {
    type: "FeatureCollection",

    features: placeFeatures,
};

await new Promise((resolve) => {
    if (map.loaded()) {
        resolve();
    } else {
        map.once("load", resolve);
    }
});

map.addSource("places", {
    type: "geojson",

    data: placeGeoJSON,
});

map.addLayer({
    id: "place-points",

    type: "circle",

    source: "places",

    paint: {
        "circle-radius": 6,

        "circle-color": "#000000",

        "circle-stroke-color": "#ffffff",

        "circle-stroke-width": 2,
    },
});

map.addLayer({
    id: "place-labels",

    type: "symbol",

    source: "places",

    layout: {
        "text-field": ["get", "name"],

        "text-size": 14,

        "text-offset": [0, 1.2],

        "text-anchor": "top",

        "text-allow-overlap": true,
    },

    paint: {
        "text-color": "#000000",

        "text-halo-color": "#ffffff",

        "text-halo-width": 2,
    },
});

const navMarker = new maplibregl.Marker({
    element: arrowElement,
})
    .setLngLat([0, 0])
    .addTo(map);

let currentLng = 0;

let currentLat = 0;

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
        });
    });
}

async function positionupdater() {
    try {
        const myposition = await getCurrentPosition();

        // currentLng = myposition.coords.longitude;
        currentLng = 74.747432;

        // currentLat = myposition.coords.latitude;
        currentLat = 13.343971;

        map.setCenter([currentLng, currentLat]);

        navMarker.setLngLat([currentLng, currentLat]);

        checknearest(currentLng, currentLat);
    } catch (error) {
        console.error("Could not get location:", error);
    }
}

recenterbut.addEventListener("click", positionupdater);

if (await loadUserPoints()) {
    positionupdater();
}

function getDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371000;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;

    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const latitude1 = (lat1 * Math.PI) / 180;

    const latitude2 = (lat2 * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
}

function updatePointsForPosition(long, lat) {
    for (const place of data.places) {
        const placeId = place.id;
        const distance = getDistance(
            lat,
            long,
            Number(place.latitude),
            Number(place.longitude),
        );

        // Each place can reward the user only once.
        if (distance <= 5 && !awardedPlaceIds.has(placeId)) {
            awardedPlaceIds.add(placeId);
            addPoints(10);
        }
    }
}

function checknearest(long, lat) {
    let shortestDistance = Infinity;

    let placeindex = 0;

    for (let i = 0; i < data.places.length; i++) {
        const place = data.places[i];

        const placeLat = Number(place.latitude);

        const placeLng = Number(place.longitude);

        const distance = getDistance(lat, long, placeLat, placeLng);

        if (distance < shortestDistance) {
            shortestDistance = distance;

            placeindex = i;
        }
    }

    updatePointsForPosition(long, lat);

    currentPlaceIndex = placeindex;

    const placeName = document.querySelector(".data-name");
    const placeSignificance = document.querySelector(".data-significance");
    const placeKeyFeatures = document.querySelector(".data-keyfeatures");
    // const placeStudentLife = document.querySelector(".data-studentlife");

    nearestloctxt.innerText = data.places[placeindex].name;
    placeName.innerText = data.places[placeindex].name;
    placeSignificance.innerText = data.places[placeindex].significance;
    placeKeyFeatures.innerHTML = data.places[placeindex].keyFeatures
        .map((feature) => `<li>${feature}</li>`)
        .join("");
    // placeStudentLife.innerText = data.places[placeindex].studentLife;

    if (shortestDistance < 1000) {
        disttonearesttxt.innerText = `${Math.round(shortestDistance)} m`;
    } else {
        disttonearesttxt.innerText = `${(shortestDistance / 1000).toFixed(
            2,
        )} km`;
    }

    return placeindex;
}

setInterval(() => {
    checknearest(currentLng, currentLat);
}, 1000);

function updateCamera(zoomOffset, pitchOffset, bearingOffset, centerOffset) {
    currentLng += centerOffset[0];

    currentLat += centerOffset[1];

    const newZoom = Math.max(0, map.getZoom() + zoomOffset);

    const newPitch = Math.min(85, Math.max(0, map.getPitch() + pitchOffset));

    const newBearing = map.getBearing() + bearingOffset;

    map.easeTo({
        center: [currentLng, currentLat],

        zoom: newZoom,

        pitch: newPitch,

        bearing: newBearing,

        duration: 200,
    });

    navMarker.setLngLat([currentLng, currentLat]);
}

function appInput(event) {
    if (event.target === document.querySelector("#ai-assistant-moreinfo")) {
        return;
    }

    switch (event.key.toLowerCase()) {
        case "e":
            updateCamera(0.2, 0, 0, [0, 0]);

            break;

        case "q":
            updateCamera(-0.2, 0, 0, [0, 0]);

            break;

        case "w":
            updateCamera(0, 5, 0, [0, 0]);

            break;

        case "s":
            updateCamera(0, -5, 0, [0, 0]);

            break;

        case "a":
            updateCamera(0, 0, 10, [0, 0]);

            break;

        case "d":
            updateCamera(0, 0, -10, [0, 0]);

            break;

        case "arrowup":
            updateCamera(0, 0, 0, [0, 0.0001]);

            break;

        case "arrowdown":
            updateCamera(0, 0, 0, [0, -0.0001]);

            break;

        case "arrowleft":
            updateCamera(0, 0, 0, [-0.0001, 0]);

            break;

        case "arrowright":
            updateCamera(0, 0, 0, [0.0001, 0]);

            break;
        case "h":
            updateCamera(0, 0, 0, [0, 0.05]);

            break;

        case "j":
            updateCamera(0, 0, 0, [0, -0.05]);

            break;

        case "k":
            updateCamera(0, 0, 0, [-0.05, 0]);

            break;

        case "l":
            updateCamera(0, 0, 0, [0.05, 0]);

            break;
    }
}

window.addEventListener("keydown", (event) => {
    appInput(event);
});

map.on("click", "place-points", (event) => {
    const properties = event.features[0].properties;

    console.log("Clicked:", properties.name);

    nearestloctxt.textContent = properties.name;
});

map.on("mouseenter", "place-points", () => {
    map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "place-points", () => {
    map.getCanvas().style.cursor = "";
});

async function submit() {
    const aiResponse = document.querySelector("#ai-response");
    aiResponse.innerText = "Loading Response...";

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        {
            method: "POST",
            headers: {
                "x-goog-api-key": window.env.API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gemini-3.6-flash",
                input: `The user is asking a question about ${data.places[currentPlaceIndex].name}.\nSTRICTLY LIMIT the answer to NOT more than 2-3 sentences. ${aiAssistant.value}. Answer in the SAME language the question is asked!`,
            }),
        },
    );

    const responseData = await response.json();
    let recieved = responseData.steps[1].content[0].text;
    aiResponse.innerText = recieved;
}

aiAskButton.addEventListener("click", submit);

function onScanSuccess(decodedText) {
    console.log(`Ticket matched:  + ${decodedText}`);
    if (decodedText == "heritedge") {
        addPoints(10);
        qron = 1;
        toggleqrscreen();
    }
    html5QrcodeScanner.clear();
}

function onScanFailure(error) {
    // Notify user about failure to scan QR Code
    console.log(`The QR code scanner failed, try again!`);
}

const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: { width: 500, height: 500 } },
    false,
);

qrbut.addEventListener("click", toggleqrscreen);
let qron = 0;
function toggleqrscreen() {
    if (qron) {
        qrbut.style.zIndex = 1;
        qrcont.style.backgroundColor = "rgba(0,0,0,0)";
        qreader.style.display = "none";
        qron = 0;
    } else {
        qrbut.style.zIndex = 999999;
        qrcont.style.backgroundColor = "rgba(0,0,0,0.5)";
        qreader.style.display = "block";
        qron = 1;
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    }
}
