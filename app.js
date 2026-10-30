const timerDisplay = document.getElementById("timer-display");
const sessionName = document.getElementById("session-name");
const startButton = document.getElementById("start-btn");
const pauseButton = document.getElementById("pause-btn");
const finishButton = document.getElementById("finish-btn");
const archiveList = document.getElementById("archive-list");
const archiveEmpty = document.getElementById("archive-empty");
const todayList = document.getElementById("today-list");
const todayEmpty = document.getElementById("today-empty");
const todayTotal = document.getElementById("today-total");
const examForm = document.getElementById("exam-form");
const examName = document.getElementById("exam-name");
const examDate = document.getElementById("exam-date");
const examDisplay = document.getElementById("exam-display");
const resetDataButton = document.getElementById("reset-data-btn");



const storageKey = "studySessions";
const examStorageKey = "studyExam";
let timerState = "idle";
let startedAt = null;
let elapsedBeforePause = 0;
let timerInterval = null;
let activeSubject = "";
let sessions = JSON.parse(localStorage.getItem(storageKey) || "[]");
let exam = JSON.parse(localStorage.getItem(examStorageKey) || "null");



function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimer() {
    const currentStretch = timerState === "running" ? Date.now() - startedAt : 0;
    const totalMilliseconds = elapsedBeforePause + currentStretch;
    timerDisplay.textContent = formatDuration(Math.floor(totalMilliseconds / 1000));
}

function renderSessions(listElement, emptyElement, sessionsToShow) {
    listElement.replaceChildren();
    emptyElement.hidden = sessionsToShow.length > 0;

    for (const session of sessionsToShow) {
        const item = document.createElement("li");
        const subject = document.createElement("strong");
        const details = document.createElement("span");

        subject.textContent = session.subject;
        details.textContent = `${formatDuration(session.durationSeconds)} · ${new Date(session.completedAt).toLocaleString()}`;
        item.append(subject, details);
        listElement.append(item);
    }
}

function renderSavedSessions() {
    renderSessions(archiveList, archiveEmpty, sessions);

    const todaySessions = sessions.filter((session) =>
        new Date(session.completedAt).toDateString() === new Date().toDateString()
    );
    const secondsStudiedToday = todaySessions.reduce(
        (total, session) => total + session.durationSeconds,
        0
    );

    todayTotal.textContent = `Studied today: ${formatDuration(secondsStudiedToday)}`;
    renderSessions(todayList, todayEmpty, todaySessions);
}

function renderExam() {
    if (!exam) {
        examDisplay.textContent = "No exam added yet.";
        return;
    }

    const [year, month, day] = exam.date.split("-").map(Number);
    const examDay = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilExam = Math.round((examDay - today) / 86400000);
    let countdown = "today";

    if (daysUntilExam > 0) {
        countdown = `in ${daysUntilExam} day${daysUntilExam === 1 ? "" : "s"}`;
    } else if (daysUntilExam < 0) {
        const daysAgo = Math.abs(daysUntilExam);
        countdown = `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
    }

    examDisplay.textContent =
        `${exam.name} — ${examDay.toLocaleDateString()} (${countdown})`;
}

examForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const newExam = {
        name: examName.value.trim(),
        date: examDate.value
    };

    try {
        localStorage.setItem(examStorageKey, JSON.stringify(newExam));
    } catch {
        alert("Couldn't save the exam in this browser.");
        return;
    }

    exam = newExam;
    renderExam();
});






startButton.addEventListener("click", () => {
    if (timerState === "idle") {
        activeSubject = sessionName.value.trim();
        if (!activeSubject) {
            alert("Enter a subject or topic before starting.");
            return;
        }

        const alreadyUsed = sessions.some(
            (session) => session.subject.toLowerCase() === activeSubject.toLowerCase()
        );
        if (alreadyUsed) {
            alert("That session name is already in your archive. Try a more specific name, like adding 101 or 102.");
            return;
        }
    } else if (timerState !== "paused") {
        return;
    }

    timerState = "running";
    startedAt = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
});


pauseButton.addEventListener("click", () => {
    if (timerState !== "running") return;
    elapsedBeforePause += Date.now() - startedAt;
    timerState = "paused";
    clearInterval(timerInterval);
    timerInterval = null;
    updateTimer();
});


finishButton.addEventListener("click", () => {
    if (timerState === "idle") return;

    const currentStretch = timerState === "running" ? Date.now() - startedAt : 0;
    const totalMilliseconds = elapsedBeforePause + currentStretch;
    const session = {
        subject: activeSubject,
        durationSeconds: Math.floor(totalMilliseconds / 1000),
        completedAt: new Date().toISOString()
    };

    const updatedSessions = [session, ...sessions];
    try {
        localStorage.setItem(storageKey, JSON.stringify(updatedSessions));
    } catch {
        alert("Couldn't save the session in this browser.");
        return;
    }

    sessions = updatedSessions;
    renderSavedSessions();

    clearInterval(timerInterval);
    timerInterval = null;
    timerState = "idle";
    startedAt = null;
    elapsedBeforePause = 0;
    activeSubject = "";
    timerDisplay.textContent = "00:00:00";
});




resetDataButton.addEventListener("click", () => {
    const confirmed = confirm(
        "Reset saved data? This removes your exam and saved sessions, and stops any timer in progress."
    );
    if (!confirmed) return;

    try {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(examStorageKey);
    } catch {
        alert("Couldn't reset saved data in this browser.");
        return;
    }

    clearInterval(timerInterval);
    timerInterval = null;
    timerState = "idle";
    startedAt = null;
    elapsedBeforePause = 0;
    activeSubject = "";
    timerDisplay.textContent = "00:00:00";
    sessions = [];
    exam = null;
    sessionName.value = "";
    renderSavedSessions();
    renderExam();
});

renderSavedSessions();
renderExam();