const timerDisplay = document.getElementById("timer-display");
const startbtn = document.getElementById("start-btn");
const pausebtn = document.getElementById("pause-btn");
const finishbtn = document.getElementById("finish-btn");

let timerState = "idle";
let startedAt = null;

let elapsedBeforePause = 0;
let timerInterval = null;

startbtn.addEventListener("click", () => {
    if (timerState !== "idle") return;
    timerState = "running";
    startedAt = Date.now();
    timerInterval = setInterval(updatetimer, 1000);
});

startbtn.addEventListener("click", () => {
    if (timerState !== "paused") return;
    timerState = "running";
    startedAt = Date.now();

    timerInterval = setInterval(updatetimer, 1000);
});

pausebtn.addEventListener("click", () => {
    if (timerState !== "running") return;
    timerState = "paused";
    elapsedBeforePause += Date.now() - startedAt;
    clearInterval(timerInterval);
});

finishbtn.addEventListener("click", () => {
    if (timerState === "idle") return;
    const currentStretch = timerState === "running" 
    ? Date.now() - startedAt : 0;

    timerState = "idle";
    clearInterval(timerInterval);
    timerInterval = null;
    startedAt = null;
    elapsedBeforePause = 0;
    timerDisplay.textContent = "00:00:00";
});



function updatetimer() {
    const currentStretch = timerState === "running" 
    ? Date.now() - startedAt : 0;

    const totalMilliseconds = elapsedBeforePause + currentStretch;
    const totalseconds = Math.floor(totalMilliseconds / 1000);
    const hours = Math.floor(totalseconds / 3600);
    const minutes = Math.floor((totalseconds % 3600) / 60);
    const seconds = totalseconds % 60;

    timerDisplay.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}