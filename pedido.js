/* =========================================================
   Pizzaria Trindade — lógica da página de pedido
   ========================================================= */

(function () {
  const session = requireLogin("pedido.html");
  if (!session) return;

  renderHeader("pedido");
  renderFooter();

  const products = DB.getProducts();
  const categorias = [...new Set(products.map((p) => p.categoria))];

  const cart = {}; // { [productId]: { product, qty } }

  const menuMount = document.getElementById("menu-mount");
  const cartLines = document.getElementById("cart-lines");
  const cartTotalWrap = document.getElementById("cart-total-wrap");
  const cartTotalValue = document.getElementById("cart-total-value");
  const orderSuccess = document.getElementById("order-success");

  function renderMenu() {
    menuMount.innerHTML = categorias
      .map((categoria) => {
        const itens = products.filter((p) => p.categoria === categoria);
        return `
          <div class="menu-category">
            <h2>${categoria}</h2>
            ${itens.map((p) => menuItemHtml(p)).join("")}
          </div>
        `;
      })
      .join("");

    categorias.forEach((categoria) => {
      products
        .filter((p) => p.categoria === categoria)
        .forEach((p) => wireQtyControls(p.id));
    });
  }

  function menuItemHtml(p) {
    const qty = cart[p.id]?.qty || 0;
    return `
      <div class="menu-item" id="item-${p.id}">
        <div class="menu-item-icon">${pizzaSliceIcon()}</div>
        <div class="menu-item-info">
          <h3>${p.nome}</h3>
          <p>${p.descricao}</p>
          <span class="price">${formatBRL(p.preco)}</span>
        </div>
        <div class="qty-control">
          <button type="button" class="qty-btn" data-action="dec" data-id="${p.id}" aria-label="Diminuir quantidade">−</button>
          <span class="qty-value" id="qty-${p.id}">${qty}</span>
          <button type="button" class="qty-btn" data-action="inc" data-id="${p.id}" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
    `;
  }

  function wireQtyControls(id) {
    const item = document.getElementById(`item-${id}`);
    if (!item) return;
    item.querySelectorAll(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        changeQty(id, action === "inc" ? 1 : -1);
      });
    });
  }

  function changeQty(id, delta) {
    const product = DB.getProduct(id);
    if (!product) return;
    const current = cart[id]?.qty || 0;
    const next = Math.max(0, current + delta);

    if (next === 0) {
      delete cart[id];
    } else {
      cart[id] = { product, qty: next };
    }

    const qtyEl = document.getElementById(`qty-${id}`);
    if (qtyEl) qtyEl.textContent = next;

    renderCart();
  }

  function renderCart() {
    const ids = Object.keys(cart);
    if (ids.length === 0) {
      cartLines.innerHTML = `<p class="cart-empty">Seu carrinho está vazio. Adicione uma pizza ao lado.</p>`;
      cartTotalWrap.classList.add("hidden");
      return;
    }

    cartLines.innerHTML = ids
      .map((id) => {
        const { product, qty } = cart[id];
        return `
          <div class="cart-line">
            <span>${qty}× ${product.nome}</span>
            <span>${formatBRL(product.preco * qty)}</span>
          </div>
        `;
      })
      .join("");

    const total = ids.reduce((sum, id) => sum + cart[id].product.preco * cart[id].qty, 0);
    cartTotalValue.textContent = formatBRL(total);
    cartTotalWrap.classList.remove("hidden");
  }

  document.getElementById("btn-finalizar").addEventListener("click", () => {
    const ids = Object.keys(cart);
    if (ids.length === 0) return;

    const endereco = document.getElementById("endereco").value.trim();
    if (!endereco) {
      alert("Informe o endereço de entrega antes de finalizar o pedido.");
      return;
    }

    const itens = ids.map((id) => ({
      produtoId: id,
      nome: cart[id].product.nome,
      qtd: cart[id].qty,
      preco: cart[id].product.preco,
    }));
    const total = itens.reduce((sum, i) => sum + i.preco * i.qtd, 0);
    const observacao = document.getElementById("observacao").value.trim();

    const order = DB.addOrder({
      userEmail: session.email,
      userNome: session.nome,
      itens,
      total,
      endereco,
      observacao,
    });

    // limpa carrinho
    Object.keys(cart).forEach((id) => delete cart[id]);
    renderMenu();
    renderCart();

    document.getElementById("cart-lines").classList.add("hidden");
    cartTotalWrap.classList.add("hidden");
    orderSuccess.classList.remove("hidden");
    orderSuccess.innerHTML = `
      <div class="alert alert-success">
        Pedido nº ${order.numero} recebido! Tempo estimado de entrega: 40-50 min.
      </div>
      <p style="color: rgba(246,239,226,0.75); font-size: 0.85rem;">Você pode acompanhar seus pedidos entrando em contato com a pizzaria informando o número acima.</p>
      <a href="destaques.html" class="btn btn-ghost-light btn-block">Ver destaques da semana</a>
    `;
  });

  renderMenu();
  renderCart();

  // pré-seleciona item vindo de ?item=ID (ex: link "Pedir" nos destaques)
  const params = new URLSearchParams(window.location.search);
  const preselect = params.get("item");
  if (preselect && DB.getProduct(preselect)) {
    changeQty(preselect, 1);
    const el = document.getElementById(`item-${preselect}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
})();
