/*
const toggleTheme = () => {
  document.body.classList.toggle("dark-theme");
};

document.getElementById("nav-theme").addEventListener("click", toggleTheme);

*/

const toggleTheme = () => {
  const body = document.body;

  if (body.classList.contains("light-theme")) {
    body.classList.remove("light-theme");
    body.classList.add("dark-theme");
  } else {
    body.classList.remove("dark-theme");
    body.classList.add("light-theme");
  }
};

document.getElementById("nav-theme").addEventListener("click", toggleTheme);

const showSection = (sectionId) => {
  // Hide all sections
  document.querySelectorAll("main > section").forEach((section) => {
    section.classList.add("hidden");
  });

  // Show the selected section
  document.getElementById(sectionId).classList.remove("hidden");
};

document.getElementById("nav-home").addEventListener("click", () => {
  showSection("home-view");
});

document.getElementById("nav-leaderboard").addEventListener("click", () => {
  showSection("leaderboard-view");
});

document.getElementById("nav-login").addEventListener("click", () => {
  showSection("login-view");
});

// Show the game view by default
showSection("game-view");

document.getElementById("quick-game").addEventListener("click", () => {
  showSection("game-view");
});

document.getElementById("home-login").addEventListener("click", () => {
  showSection("login-view");
});

// Show the home view by default
showSection("home-view");
