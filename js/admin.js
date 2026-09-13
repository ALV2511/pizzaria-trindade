/* =========================================================
   Pizzaria Trindade — lógica do painel do dono
   ========================================================= */

(function () {
  const session = requireAdmin();
  if (!session) return;

  renderHeader("admin");
  renderFooter();

  const productForm = document.getElementById("product-form");
  const productAlert = document.getElementById("product-alert");
  const productsBody = document.getElementById("products-table-body");
  const productsEmpty = document.getElementById("products-empty");
  const ordersBody = document.getElementById("orders-table-body");
  const ordersEmpty = document.getElementById("orders-empty");

  const STATUS_OPTIONS = ["Recebido", "Em preparo", "Saiu para entrega", "Entregue"];

  function renderProducts() {
    const products = DB.getProducts();
    if (products.length === 0) {
      productsBody.innerHTML = "";
      productsEmpty.classList.remove("hidden");
      return;
    }
    productsEmpty.classList.add("hidden");
    productsBody.innerHTML = products
      .map(
        (p) => `
        <tr>
          <td><strong>${p.nome}</strong><br><span style="opacity:.65; font-size:.82rem;">${p.descricao || ""}</span></td>
          <td>${p.categoria}</td>
          <td>${formatBRL(p.preco)}</td>
          <td>${p.destaque ? "Sim" : "—"}</td>
          <td><button type="button" class="btn-danger" data-id="${p.id}">Excluir</button></td>
        </tr>
      `
      )
      .join("");

    productsBody.querySelectorAll("button[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const product = DB.getProduct(btn.dataset.id);
        if (!product) return;
        const ok = confirm(`Excluir "${product.nome}" do cardápio? Essa ação não pode ser desfeita.`);
        if (ok) {
          DB.deleteProduct(product.id);
          renderProducts();
        }
      });
    });
  }

  function renderOrders() {
    const orders = DB.getOrders().slice().reverse();
    if (orders.length === 0) {
      ordersBody.innerHTML = "";
      ordersEmpty.classList.remove("hidden");
      return;
    }
    ordersEmpty.classList.add("hidden");
    ordersBody.innerHTML = orders
      .map((o) => {
        const itensResumo = o.itens.map((i) => `${i.qtd}× ${i.nome}`).join(", ");
        const options = STATUS_OPTIONS.map(
          (s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`
        ).join("");
        return `
          <tr>
            <td>#${o.numero}</td>
            <td>${o.userNome}<br><span style="opacity:.65; font-size:.8rem;">${o.endereco || ""}</span></td>
            <td>${itensResumo}</td>
            <td>${formatBRL(o.total)}</td>
            <td>${formatDateTime(o.criadoEm)}</td>
            <td>
              <select class="status-select" data-id="${o.id}">
                ${options}
              </select>
            </td>
          </tr>
        `;
      })
      .join("");

    ordersBody.querySelectorAll(".status-select").forEach((sel) => {
      sel.addEventListener("change", () => {
        DB.updateOrderStatus(sel.dataset.id, sel.value);
      });
    });
  }

  productForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("p-nome").value.trim();
    const descricao = document.getElementById("p-descricao").value.trim();
    const preco = document.getElementById("p-preco").value;
    const categoria = document.getElementById("p-categoria").value;
    const destaque = document.getElementById("p-destaque").checked;

    if (!nome || !preco || Number(preco) <= 0) {
      productAlert.innerHTML = `<div class="alert alert-error">Preencha o nome e um preço válido.</div>`;
      return;
    }

    DB.addProduct({ nome, descricao, preco, categoria, destaque });
    productAlert.innerHTML = `<div class="alert alert-success">"${nome}" adicionado ao cardápio.</div>`;
    productForm.reset();
    renderProducts();
  });

  renderProducts();
  renderOrders();
})();
