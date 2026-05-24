console.log("916 Slabs theme loaded");

// Dark mode toggle
document.getElementById("theme-toggle")?.addEventListener("click", () => {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  html.setAttribute("data-theme", current === "dark" ? "light" : "dark");
});

// Cloudflare API example fetch
async function loadAPI() {
  try {
    const res = await fetch("http://127.0.0.1:8788/api/status");
    const data = await res.json();
    console.log("Backend API:", data);
  } catch (e) {
    console.warn("API offline");
  }
}
loadAPI();
