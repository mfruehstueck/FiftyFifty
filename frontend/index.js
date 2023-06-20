document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("nav-theme");

  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  const setTheme = (prefersDark) => {
    const body = document.querySelector("body");

    if (prefersDark) {
      body.classList.remove("light-theme");
      body.classList.add("dark-theme");
      themeToggleBtn.innerHTML =
        '<span class="material-icons">nights_stay</span>';
      themeToggleBtn.classList.remove("light-theme-icon");
      themeToggleBtn.classList.add("dark-theme-icon");
    } else {
      body.classList.remove("dark-theme");
      body.classList.add("light-theme");
      themeToggleBtn.innerHTML = '<span class="material-icons">wb_sunny</span>';
      themeToggleBtn.classList.remove("dark-theme-icon");
      themeToggleBtn.classList.add("light-theme-icon");
    }
  };

  setTheme(prefersDarkScheme.matches);

  themeToggleBtn.addEventListener("click", () => {
    // Wenn das aktuelle Theme dunkel ist, setzen Sie es auf hell und umgekehrt
    const body = document.querySelector("body");
    const currentIsDark = body.classList.contains("dark-theme");
    setTheme(!currentIsDark);
  });
});

//++++++++++++++++++++++++++++

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

document.getElementById("quick-game").addEventListener("click", () => {
  showSection("game-view");
});

document.getElementById("home-login").addEventListener("click", () => {
  showSection("login-view");
});

// Show the home view by default
showSection("home-view");


