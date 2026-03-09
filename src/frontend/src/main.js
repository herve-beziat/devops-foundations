import "./style.css";

document.querySelector("#app").innerHTML = `
  <div class="container">
    <header>
      <div class="header-top">
        <div class="title-group">
          <span class="label">// system status</span>
          <h1>DevOps <span>Foundations</span> – Dashboard</h1>
        </div>
        <div class="header-meta">
          <div class="last-update">last check <span id="last-update">—</span></div>
          <button class="refresh-btn" id="refresh-btn">⟳ Refresh</button>
        </div>
      </div>
    </header>

    <div class="status-bar">
      <div class="dot"></div>
      <span class="all-ok" id="global-status">Checking services...</span>
      <span class="stack-info">stack: devops-foundations</span>
    </div>

    <div class="grid">

      <div class="card status-loading" id="card-backend">
        <div class="card-header">
          <div class="card-title">
            <span class="card-icon">⚙️</span>
            <div>
              <div class="card-name">Backend</div>
              <div class="card-endpoint">api.localhost/health</div>
            </div>
          </div>
          <div class="badge loading" id="badge-backend">
            <div class="badge-dot"></div>
            <span>checking</span>
          </div>
        </div>
        <div class="card-data">
          <div class="data-row">
            <span class="data-key">status</span>
            <span class="data-value" id="backend-status">—</span>
          </div>
          <div class="data-row">
            <span class="data-key">service</span>
            <span class="data-value" id="backend-service">—</span>
          </div>
          <div class="data-row">
            <span class="data-key">version</span>
            <span class="data-value" id="backend-version">—</span>
          </div>
        </div>
      </div>

      <div class="card status-loading" id="card-db">
        <div class="card-header">
          <div class="card-title">
            <span class="card-icon">🗄️</span>
            <div>
              <div class="card-name">Database</div>
              <div class="card-endpoint">api.localhost/db</div>
            </div>
          </div>
          <div class="badge loading" id="badge-db">
            <div class="badge-dot"></div>
            <span>checking</span>
          </div>
        </div>
        <div class="card-data">
          <div class="data-row">
            <span class="data-key">status</span>
            <span class="data-value" id="db-status">—</span>
          </div>
          <div class="data-row">
            <span class="data-key">database</span>
            <span class="data-value" id="db-name">—</span>
          </div>
          <div class="data-row">
            <span class="data-key">timestamp</span>
            <span class="data-value" id="db-timestamp">—</span>
          </div>
        </div>
      </div>

      <div class="card status-loading" id="card-cache">
        <div class="card-header">
          <div class="card-title">
            <span class="card-icon">⚡</span>
            <div>
              <div class="card-name">Cache</div>
              <div class="card-endpoint">api.localhost/cache</div>
            </div>
          </div>
          <div class="badge loading" id="badge-cache">
            <div class="badge-dot"></div>
            <span>checking</span>
          </div>
        </div>
        <div class="card-data">
          <div class="data-row">
            <span class="data-key">status</span>
            <span class="data-value" id="cache-status">—</span>
          </div>
          <div class="data-row">
            <span class="data-key">engine</span>
            <span class="data-value" id="cache-engine">—</span>
          </div>
        </div>
        <!-- Mini-card visits : compteur Redis mis en avant -->
        <div class="visits-block">
          <div class="visits-label">visits</div>
          <div class="visits-count" id="cache-visits">—</div>
        </div>
      </div>

      <!-- Card annuaire — liste tous les services et endpoints disponibles dans la stack -->
      <div class="card card-services">
        <div class="card-header">
          <div class="card-title">
            <span class="card-icon">🔗</span>
            <div>
              <div class="card-name">Services</div>
              <div class="card-endpoint">stack endpoints</div>
            </div>
          </div>
        </div>
        <div class="card-data">
          <div class="data-row">
            <a class="service-link" href="https://app.localhost" target="_blank">app.localhost</a>
            <span class="service-desc">frontend page</span>
          </div>
          <div class="data-row">
            <a class="service-link" href="https://api.localhost/health" target="_blank">api.localhost/health</a>
            <span class="service-desc">{"status":"ok"}</span>
          </div>
          <div class="data-row">
            <a class="service-link" href="https://api.localhost/db" target="_blank">api.localhost/db</a>
            <span class="service-desc">{"status":"connected"}</span>
          </div>
          <div class="data-row">
            <a class="service-link" href="https://api.localhost/cache" target="_blank">api.localhost/cache</a>
            <span class="service-desc">{"status":"connected"}</span>
          </div>
          <div class="data-row">
            <a class="service-link" href="https://db.localhost" target="_blank">db.localhost</a>
            <span class="service-desc">Adminer interface</span>
          </div>
          <div class="data-row">
            <a class="service-link" href="https://mail.localhost" target="_blank">mail.localhost</a>
            <span class="service-desc">MailHog interface</span>
          </div>
          <div class="data-row">
            <a class="service-link" href="https://traefik.localhost" target="_blank">traefik.localhost</a>
            <span class="service-desc">Traefik dashboard</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Formulaire de contact — déclenché manuellement par l'utilisateur -->
    <div class="contact-section">
      <div class="section-label">// contact form</div>
      <div class="contact-card">
        <div class="contact-fields">
          <div class="field-group">
            <label class="field-label" for="contact-to">to</label>
            <input class="field-input" id="contact-to" type="email" placeholder="recipient@example.com" value="test@example.com" />
          </div>
          <div class="field-group">
            <label class="field-label" for="contact-subject">subject</label>
            <input class="field-input" id="contact-subject" type="text" placeholder="Subject" value="Hello from DevOps Foundations" />
          </div>
          <div class="field-group field-group--full">
            <label class="field-label" for="contact-message">message</label>
            <textarea class="field-input field-textarea" id="contact-message" placeholder="Your message...">This is a test email sent from the DevOps Foundations dashboard.</textarea>
          </div>
        </div>
        <div class="contact-footer">
          <span class="contact-hint" id="contact-hint">—</span>
          <button class="send-btn" id="send-btn">➤ Send</button>
        </div>
      </div>
    </div>

    <footer>
      <span>devops-foundations v1.0.0</span>
      <span>traefik v3 · docker compose · node.js · postgresql · redis</span>
    </footer>
  </div>
`;

const API = "https://api.localhost";

// Met à jour l'état visuel d'une card (ok / error / loading)
function setCard(id, status, data) {
  const card = document.getElementById("card-" + id);
  const badge = document.getElementById("badge-" + id);

  card.className =
    "card " +
    (status === "ok"
      ? "status-ok"
      : status === "error"
        ? "status-error"
        : "status-loading");
  badge.className =
    "badge " +
    (status === "ok" ? "ok" : status === "error" ? "error" : "loading");
  badge.innerHTML = `<div class="badge-dot"></div><span>${status === "ok" ? "online" : status === "error" ? "offline" : "checking"}</span>`;

  Object.entries(data).forEach(([key, value]) => {
    const el = document.getElementById(id + "-" + key);
    if (el) {
      el.textContent = value;
      el.className =
        "data-value" +
        (status === "error" ? " error" : key === "visits" ? " highlight" : "");
    }
  });
}

// Vérifie l'état du backend via /health et /
async function checkBackend() {
  try {
    const [health, root] = await Promise.all([
      fetch(API + "/health").then((r) => r.json()),
      fetch(API + "/").then((r) => r.json()),
    ]);
    setCard("backend", "ok", {
      status: health.status,
      service: health.service,
      version: root.version || "—",
    });
    return true;
  } catch {
    setCard("backend", "error", {
      status: "unreachable",
      service: "—",
      version: "—",
    });
    return false;
  }
}

// Vérifie la connexion PostgreSQL via /db
async function checkDb() {
  try {
    const data = await fetch(API + "/db").then((r) => r.json());
    setCard("db", data.status === "connected" ? "ok" : "error", {
      status: data.status,
      name: data.database || "—",
      timestamp: data.timestamp
        ? new Date(data.timestamp).toLocaleTimeString()
        : "—",
    });
    return data.status === "connected";
  } catch {
    setCard("db", "error", {
      status: "unreachable",
      name: "—",
      timestamp: "—",
    });
    return false;
  }
}

// Vérifie la connexion Redis via /cache — incrémente aussi le compteur de visites
async function checkCache() {
  try {
    const data = await fetch(API + "/cache").then((r) => r.json());
    setCard("cache", data.status === "connected" ? "ok" : "error", {
      status: data.status,
      engine: data.cache || "—",
      visits: data.visits !== undefined ? data.visits : "—",
    });
    return data.status === "connected";
  } catch {
    setCard("cache", "error", {
      status: "unreachable",
      engine: "—",
      visits: "—",
    });
    return false;
  }
}

// Lance la vérification des 3 services en parallèle
async function checkAll() {
  const btn = document.getElementById("refresh-btn");
  btn.classList.add("loading");
  btn.textContent = "⟳ Checking...";

  document.getElementById("global-status").textContent = "Checking services...";

  const results = await Promise.all([checkBackend(), checkDb(), checkCache()]);
  const allOk = results.every(Boolean);

  document.getElementById("global-status").textContent = allOk
    ? "All systems operational"
    : `${results.filter(Boolean).length}/3 services online`;

  document.getElementById("last-update").textContent =
    new Date().toLocaleTimeString();
  btn.classList.remove("loading");
  btn.textContent = "⟳ Refresh";
}

// Envoie le formulaire de contact vers /contact
document.getElementById("send-btn").addEventListener("click", async () => {
  const btn = document.getElementById("send-btn");
  const hint = document.getElementById("contact-hint");

  const to = document.getElementById("contact-to").value.trim();
  const subject = document.getElementById("contact-subject").value.trim();
  const message = document.getElementById("contact-message").value.trim();

  if (!to || !subject || !message) {
    hint.textContent = "Please fill in all fields.";
    hint.className = "contact-hint error";
    return;
  }

  btn.disabled = true;
  btn.textContent = "⟳ Sending...";
  hint.textContent = "—";
  hint.className = "contact-hint";

  try {
    const data = await fetch(API + "/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, message }),
    }).then((r) => r.json());

    if (data.status === "sent") {
      hint.textContent = `✓ Sent to ${data.to} at ${new Date(data.timestamp).toLocaleTimeString()}`;
      hint.className = "contact-hint success";
    } else {
      hint.textContent = "✗ Send failed.";
      hint.className = "contact-hint error";
    }
  } catch {
    hint.textContent = "✗ Unable to reach mail service.";
    hint.className = "contact-hint error";
  }

  btn.disabled = false;
  btn.textContent = "➤ Send";
});

// Vérification initiale au chargement de la page
document.getElementById("refresh-btn").addEventListener("click", checkAll);
checkAll();
