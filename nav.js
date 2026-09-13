/* =========================================================
   Pizzaria Trindade — cabeçalho, navegação e rodapé
   compartilhados entre todas as páginas.
   ========================================================= */

function renderHeader(activePage) {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  const session = DB.getSession();

  const links = [
    { href: "index.html", label: "Início", key: "index" },
    { href: "destaques.html", label: "Destaques da semana", key: "destaques" },
    { href: "pedido.html", label: "Fazer pedido", key: "pedido" },
  ];

  const linksHtml = links
    .map(
      (l) =>
        `<a href="${l.href}" ${l.key === activePage ? 'aria-current="page"' : ""}>${l.label}</a>`
    )
    .join("");

  let userHtml;
  if (session) {
    const painel =
      session.role === "admin"
        ? `<a href="admin.html" ${activePage === "admin" ? 'aria-current="page"' : ""} class="btn btn-ghost-light btn-sm">Painel do dono</a>`
        : "";
    userHtml = `
      <div class="nav-user">
        <span>Olá, ${escapeHtml(session.nome.split(" ")[0])}</span>
        ${painel}
        <button type="button" class="btn btn-ghost-light btn-sm" id="btn-logout">Sair</button>
      </div>`;
  } else {
    userHtml = `
      <div class="nav-user">
        <a href="login.html" class="btn btn-ghost-light btn-sm">Entrar</a>
        <a href="cadastro.html" class="btn btn-primary btn-sm">Criar conta</a>
      </div>`;
  }

  mount.innerHTML = `
    <div class="container">
      <a href="index.html" class="brand">Trindade <small>Pizzaria de bairro</small></a>
      <nav class="main-nav" aria-label="Navegação principal">
        ${linksHtml}
      </nav>
      ${userHtml}
    </div>
  `;

  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      DB.logout();
      window.location.href = "index.html";
    });
  }
}

function renderFooter() {
  const mount = document.getElementById("site-footer");
  if (!mount) return;
  mount.innerHTML = `
    <div class="container">
      <div class="stack">
        <strong>Pizzaria Trindade</strong>
        <span>Rua das Palmeiras, 214 — Bairro Trindade</span>
        <span>Terça a domingo, 18h às 23h30</span>
      </div>
      <div class="stack">
        <span>Este é um site de demonstração criado pela Alvok Solutions.</span>
        <span>Dados fictícios, apenas para fins de exemplo.</span>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function requireLogin(redirectTo) {
  const session = DB.getSession();
  if (!session) {
    window.location.href = "login.html?next=" + encodeURIComponent(redirectTo || "");
    return null;
  }
  return session;
}

function requireAdmin() {
  const session = DB.getSession();
  if (!session || session.role !== "admin") {
    window.location.href = "login.html?next=admin.html";
    return null;
  }
  return session;
}

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
