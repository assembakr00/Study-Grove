const timerDisplay = document.getElementById("timer-display");
const startbtn = document.getElementById("start-btn");
const pausebtn = document.getElementById("pause-btn");
const finishbtn = document.getElementById("finish-btn");

let timerState = "idle";
let startedAt = null;

startbtn.addEventListener("click", () => {
    timerState = "running";
    startedAt = Date.now();
    console.log(startedAt);
    setInterval(updatetimer, 1000);
});

function updatetimer() {
    const seconds = Math.floor((Date.now() - startedAt) / 1000);
    timerDisplay.textContent = seconds;
}