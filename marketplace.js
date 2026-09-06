let items=document.querySelector('.items-flex');

async function loadUserPoints() {
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        window.location.replace("index.html");
        return;
    }

    const { data: userData, error: userDataError } = await supabaseClient
        .from("UserData")
        .select("points")
        .eq("userId", user.id)
        .maybeSingle();

    if (userDataError) {
        console.error("Could not load user points:", userDataError.message);
        return;
    }

    document.querySelector("#points-total").textContent = Number(userData?.points ?? 0);
}

loadUserPoints();

import mydata from "./shops.json" with {type:"json"};
mydata.forEach((shop) => {
shop.items.forEach((item) => {
let temp = document.createElement("div");
temp.className = "item-flex";
items.appendChild(temp);
temp.innerHTML = `
              <img class="item-image" src="${shop.src}">
              <p class="shopname">${shop.name}</p>
              <h3 class="item-name">${item.name}</h3>
              <p>${item.desc}</p>
              <p>Price: ₹${item.price}</p>
              <p>Open Days: ${shop.opendays}</p>
              <p>Open hours: ${shop.openhours}</p>
              <p>Contacts: ${shop.contact}</p>
`;
});
});

function changeNavBar() {
    var x = document.getElementById("main-nav");
    if (x.className == "main-nav") {
        x.className += " responsive";
    } else {
        x.className = "main-nav"
    }
}

const searchInput = document.querySelector(".search-bar input");
console.log(searchInput);
const itemList = document.querySelector(".items-flex").children;
console.log(itemList);

searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();

    for (let i = 0; i < itemList.length; i++) {
        const itemName = itemList[i].querySelector(".item-name").textContent.toLowerCase();
        const shopName = itemList[i].querySelector(".shopname").textContent.toLowerCase();
        console.log(itemName, searchTerm);
        if (itemName.includes(searchTerm) || shopName.includes(searchTerm)) {
            itemList[i].style.display = "inline-block";
            console.log(itemList[i].textContent.toLowerCase());
        }
        else {
            itemList[i].style.display = "none";
            console.log(itemList[i].textContent.toLowerCase());
        }
    }
});

