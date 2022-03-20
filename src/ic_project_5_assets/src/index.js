import {createActor, ic_project_5} from "../../declarations/ic_project_5";

async function post() {
    let error = document.getElementById("error");
    error.innerText = "";
    let post_button = document.getElementById("post");
    post_button.disabled = true;
    let textarea = document.getElementById("message");
    let text = textarea.value;
    let otp = document.getElementById("otp").value;
    try {
        await ic_project_5.post(otp, text);
        textarea.value = "";
    } catch (e) {
        console.log(e);
        error.innerText = "Post Failed!";
    }
    post_button.disabled = false;
    await loadTimeline();
}

async function loadTimeline() {
    console.log("start to load timeline");
    let timelineElement = document.getElementById("timeline");
    let refreshTimeline = document.getElementById("refreshTimeline");
    refreshTimeline.disabled = true;
    refreshTimeline.innerText = "loading";
    timelineElement.replaceChildren([]);
    try {
        let posts = await ic_project_5.timeline(0n);
        let trs = "";
        for (let i = 0; i < posts.length; i++) {
            const author = posts[i].author;
            const postText = posts[i].text;
            const time = new Date(posts[i].time.toString() / 1e6);
            trs = trs + `<tr><td>${author}</td><td>${postText}</td><td>${time}</td></tr>`;
        }
        timelineElement.innerHTML = `<table><tr><th>Author</th><th>Post</th><th>Time</th></tr>${trs}</table>`;
        console.log("timeline loaded");
    } catch (e) {
        console.log("failed to load timeline", e);
    }
    refreshTimeline.disabled = false;
    refreshTimeline.innerText = "refresh timeline";
}

async function loadPosts(canisterId) {
    let canister;
    if (typeof canisterId === 'string' || canisterId instanceof String) {
        canister = createActor(canisterId);
    } else {
        console.log("invalid canisterId: " + canisterId);
        return;
    }
    console.log("start to load posts of " + canisterId);
    let timelineElement = document.getElementById("timeline");
    let refreshTimeline = document.getElementById("refreshTimeline");
    refreshTimeline.disabled = true;
    refreshTimeline.innerText = "loading";
    timelineElement.replaceChildren([]);
    try {
        let posts = await canister.posts(0n);
        let trs = "";
        for (let i = 0; i < posts.length; i++) {
            const author = posts[i].author;
            const postText = posts[i].text;
            const time = new Date(posts[i].time.toString() / 1e6);
            trs = trs + `<tr><td>${author}</td><td>${postText}</td><td>${time}</td></tr>`;
        }
        timelineElement.innerHTML = `<table><tr><th>Author</th><th>Post</th><th>Time</th></tr>${trs}</table>`;
        console.log("posts loaded");
    } catch (e) {
        console.log("failed to load posts", e);
    }
    refreshTimeline.disabled = false;
    refreshTimeline.innerText = "refresh timeline";
}

let num = 0;

async function loadFollowing() {
    let devElement = document.getElementById("following");
    let follows = await ic_project_5.follows();
    if (num === follows.length) return;
    devElement.replaceChildren([]);
    num = follows.length;
    let trs = "";
    for (let i = 0; i < follows.length; i++) {
        const canisterId = follows[i].toString();
        const followingCanister = createActor(canisterId);
        let followingName = await followingCanister.get_name();
        console.log("canisterId: " + follows[i].toString() + ", followingName: " + followingName);
        trs = trs + `<tr><td><a id="${canisterId}">${followingName}</a></></td></tr>`;
    }
    devElement.innerHTML = `<table><tr><th>Name</th></tr>${trs}</table>`;

    for (let i = 0; i < follows.length; i++) {
        const canisterId = follows[i].toString();
        document.getElementById(canisterId).addEventListener("click", (e) => {
            console.log(e.target.id);
            loadPosts(e.target.id);
        })
    }

}

function load() {
    let post_button = document.getElementById("post");
    post_button.onclick = post;

    let refreshTimeline = document.getElementById("refreshTimeline");
    refreshTimeline.onclick = loadTimeline;

    loadTimeline();
    loadFollowing();
    // setInterval(loadTimeline, 3000);
}

window.onload = load;
