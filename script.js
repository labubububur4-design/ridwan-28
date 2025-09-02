// ===== Theme (Dark / Light) =====
const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") root.classList.add("dark");

const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  setThemeIcon();
  themeToggle.addEventListener("click", () => {
    root.classList.toggle("dark");
    localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
    setThemeIcon();
  });
}
function setThemeIcon() {
  themeToggle.textContent = root.classList.contains("dark") ? "🌞" : "🌙";
}

// ===== Dynamic year =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Smooth scroll for internal links =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length > 1) {
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "start" }); }
    }
  });
});

// ===== Menu Filter =====
const menuGrid = document.getElementById("menuGrid");
const chips = document.querySelectorAll(".chip");
chips.forEach(chip => {
  chip.addEventListener("click", () => {
    chips.forEach(c => { c.classList.remove("active"); c.setAttribute("aria-selected", "false"); });
    chip.classList.add("active"); chip.setAttribute("aria-selected", "true");
    const filter = chip.dataset.filter || "all";
    document.querySelectorAll(".menu-item").forEach(card => {
      const cat = card.dataset.category;
      const show = filter === "all" || filter === cat;
      card.style.display = show ? "" : "none";
    });
  });
});

// ===== Add to order (quick add updates order form) =====
const addButtons = document.querySelectorAll(".add-to-order");
addButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const select = document.querySelector('#order select[name="menu"]');
    const [name, price] = [btn.dataset.name, btn.dataset.price];
    if (select) {
      // set selected option
      [...select.options].forEach(opt => {
        if (opt.value.startsWith(name)) opt.selected = true;
      });
      // bump qty and scroll to order
      const qty = document.querySelector('#order input[name="qty"]');
      if (qty) qty.value = Number(qty.value || 0) + 1;
      updateTotal();
      document.getElementById("order").scrollIntoView({ behavior: "smooth" });
    }
  });
});

// ===== Order Form to WhatsApp =====
const orderForm = document.getElementById("order");
const orderTotalEl = document.getElementById("orderTotal");

function formatRupiah(n) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}
function updateTotal() {
  const sel = orderForm?.menu?.value;
  const qty = parseInt(orderForm?.qty?.value || "1", 10);
  if (!sel) { orderTotalEl.textContent = "Rp0"; return; }
  const price = parseInt(sel.split("|")[1], 10);
  const total = price * Math.max(1, qty);
  orderTotalEl.textContent = formatRupiah(total);
  return total;
}
orderForm?.addEventListener("change", updateTotal);
orderForm?.addEventListener("input", updateTotal);
updateTotal();

orderForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(orderForm);
  const nama = (fd.get("nama") || "").toString().trim();
  const wa = (fd.get("wa") || "").toString().replace(/\D/g, "");
  const menuRaw = (fd.get("menu") || "").toString();
  const qty = parseInt((fd.get("qty") || "1").toString(), 10);
  const note = (fd.get("note") || "").toString();
  const alamat = (fd.get("alamat") || "").toString().trim();

  if (!nama || !wa || !menuRaw) {
    alert("Mohon lengkapi nama, nomor WhatsApp, dan pilihan menu.");
    return;
  }
  const [menuName, price] = menuRaw.split("|");
  const total = updateTotal() || 0;

  const msg = [
    `Halo EsTehKita, saya ingin pesan:`,
    `• Menu: ${menuName}`,
    `• Jumlah: ${qty}`,
    `• Catatan: ${note}`,
    alamat ? `• Alamat: ${alamat}` : null,
    `• Atas nama: ${nama}`,
    `• Total: ${formatRupiah(total)}`
  ].filter(Boolean).join("%0A");

  const waNumber = "6281234567890"; // Ganti ke nomor WA outlet-mu
  const url = `https://wa.me/${waNumber}?text=${msg}`;
  window.open(url, "_blank", "noopener");
});

// ===== Contact form (dummy) =====
const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");
contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  contactStatus.textContent = "Terima kasih! Pesanmu sudah kami terima.";
  contactForm.reset();
});

// ===== Stars (accessible gradient fill) =====
document.querySelectorAll(".stars").forEach(star => {
  const rating = parseFloat(star.dataset.rating || "5");
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  star.style.setProperty("--pct", `${pct}%`);
});

// ===== Bubble / Ice cube generator on scroll =====
const layer = document.getElementById("bubble-layer");
let lastSpawn = 0;
function spawnBubble() {
  const b = document.createElement("span");
  b.className = "bubble";
  const size = Math.random() * 22 + 12; // 12–34px
  const left = Math.random() * 100;
  const dur = Math.random() * 5 + 6; // 6–11s
  const rot = (Math.random() * 60 - 30) + "deg";
  b.style.setProperty("--s", size + "px");
  b.style.left = left + "vw";
  b.style.setProperty("--d", dur + "s");
  b.style.setProperty("--r", rot);
  layer.appendChild(b);
  // cleanup when finished
  setTimeout(() => b.remove(), dur * 1000 + 200);
}
function maybeSpawnBubbles() {
  const now = performance.now();
  if (now - lastSpawn > 120) {
    for (let i = 0; i < 3; i++) spawnBubble();
    lastSpawn = now;
  }
}
document.addEventListener("scroll", maybeSpawnBubbles, { passive: true });
document.addEventListener("mousemove", maybeSpawnBubbles, { passive: true });
// initial
for (let i = 0; i < 10; i++) setTimeout(spawnBubble, i * 180);
