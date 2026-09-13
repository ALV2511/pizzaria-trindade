/* =========================================================
   Pizzaria Trindade — camada de dados (db.js)
   ---------------------------------------------------------
   Este projeto é 100% front-end (HTML, CSS e JS puro), sem
   servidor e sem banco de dados de verdade. Para simular
   persistência entre as páginas (login, cardápio, pedidos),
   usamos o localStorage do navegador como um "banco de dados"
   simples.

   IMPORTANTE — isto é um exemplo/demonstração:
   - As senhas são guardadas em texto puro, sem criptografia.
   - Qualquer pessoa com acesso ao navegador pode ver os dados
     abrindo o DevTools (Application > Local Storage).
   - Não use dados ou senhas reais aqui.
   - Num site em produção, login, cadastro, cardápio e pedidos
     precisariam de um backend de verdade (servidor + banco de
     dados) com senhas criptografadas (hash) e validação no
     servidor, não só no navegador.
   ========================================================= */

const DB = (() => {
  const KEYS = {
    products: "trindade_products",
    users: "trindade_users",
    orders: "trindade_orders",
    session: "trindade_session",
    seeded: "trindade_seeded_v1",
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("Não foi possível ler", key, e);
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------------- seed inicial ---------------- */

  function seedIfNeeded() {
    if (localStorage.getItem(KEYS.seeded)) return;

    const products = [
      {
        id: uid("p"),
        nome: "Margherita à Lenha",
        descricao: "Molho de tomate italiano, muçarela fresca, manjericão e fio de azeite.",
        preco: 42.9,
        categoria: "Tradicionais",
        destaque: true,
      },
      {
        id: uid("p"),
        nome: "Calabresa da Casa",
        descricao: "Calabresa artesanal fatiada, cebola roxa e orégano.",
        preco: 44.9,
        categoria: "Tradicionais",
        destaque: false,
      },
      {
        id: uid("p"),
        nome: "Quatro Queijos",
        descricao: "Muçarela, provolone, gorgonzola e parmesão gratinados.",
        preco: 49.9,
        categoria: "Tradicionais",
        destaque: false,
      },
      {
        id: uid("p"),
        nome: "Trindade Especial",
        descricao: "Linguiça defumada, pimentões assados, catupiry e cebola caramelizada.",
        preco: 56.9,
        categoria: "Especiais",
        destaque: true,
      },
      {
        id: uid("p"),
        nome: "Burrata & Tomate Seco",
        descricao: "Burrata fresca, tomate seco, rúcula e redução de balsâmico.",
        preco: 62.9,
        categoria: "Especiais",
        destaque: true,
      },
      {
        id: uid("p"),
        nome: "Cogumelos Selvagens",
        descricao: "Mix de cogumelos salteados no alho, provolone e tomilho.",
        preco: 54.9,
        categoria: "Especiais",
        destaque: false,
      },
      {
        id: uid("p"),
        nome: "Chocolate com Morango",
        descricao: "Chocolate meio amargo derretido, morangos frescos e açúcar de confeiteiro.",
        preco: 38.9,
        categoria: "Doces",
        destaque: false,
      },
      {
        id: uid("p"),
        nome: "Banana com Canela",
        descricao: "Banana caramelizada, canela e leite condensado.",
        preco: 34.9,
        categoria: "Doces",
        destaque: false,
      },
    ];

    const users = [
      {
        id: uid("u"),
        nome: "Administração Trindade",
        email: "admin@trindade.com",
        telefone: "",
        senha: "admin123",
        role: "admin",
      },
    ];

    write(KEYS.products, products);
    write(KEYS.users, users);
    write(KEYS.orders, []);
    localStorage.setItem(KEYS.seeded, "1");
  }

  /* ---------------- produtos ---------------- */

  function getProducts() {
    return read(KEYS.products, []);
  }

  function getProduct(id) {
    return getProducts().find((p) => p.id === id) || null;
  }

  function addProduct(data) {
    const products = getProducts();
    const product = {
      id: uid("p"),
      nome: data.nome.trim(),
      descricao: (data.descricao || "").trim(),
      preco: Number(data.preco),
      categoria: data.categoria || "Tradicionais",
      destaque: !!data.destaque,
    };
    products.push(product);
    write(KEYS.products, products);
    return product;
  }

  function deleteProduct(id) {
    const products = getProducts().filter((p) => p.id !== id);
    write(KEYS.products, products);
  }

  /* ---------------- usuários / sessão ---------------- */

  function getUsers() {
    return read(KEYS.users, []);
  }

  function findUserByEmail(email) {
    const target = (email || "").trim().toLowerCase();
    return getUsers().find((u) => u.email.toLowerCase() === target) || null;
  }

  function addUser(data) {
    const users = getUsers();
    const user = {
      id: uid("u"),
      nome: data.nome.trim(),
      email: data.email.trim(),
      telefone: (data.telefone || "").trim(),
      senha: data.senha,
      role: "cliente",
    };
    users.push(user);
    write(KEYS.users, users);
    return user;
  }

  function login(email, senha) {
    const user = findUserByEmail(email);
    if (!user || user.senha !== senha) return null;
    write(KEYS.session, { id: user.id, email: user.email, nome: user.nome, role: user.role });
    return user;
  }

  function logout() {
    localStorage.removeItem(KEYS.session);
  }

  function getSession() {
    return read(KEYS.session, null);
  }

  /* ---------------- pedidos ---------------- */

  function getOrders() {
    return read(KEYS.orders, []);
  }

  function getOrdersForUser(email) {
    return getOrders().filter((o) => o.userEmail === email);
  }

  function addOrder(data) {
    const orders = getOrders();
    const order = {
      id: uid("ped"),
      numero: orders.length + 1001,
      userEmail: data.userEmail,
      userNome: data.userNome,
      itens: data.itens,
      total: data.total,
      endereco: data.endereco || "",
      observacao: data.observacao || "",
      status: "Recebido",
      criadoEm: new Date().toISOString(),
    };
    orders.push(order);
    write(KEYS.orders, orders);
    return order;
  }

  function updateOrderStatus(id, status) {
    const orders = getOrders();
    const order = orders.find((o) => o.id === id);
    if (order) {
      order.status = status;
      write(KEYS.orders, orders);
    }
  }

  return {
    seedIfNeeded,
    getProducts,
    getProduct,
    addProduct,
    deleteProduct,
    getUsers,
    findUserByEmail,
    addUser,
    login,
    logout,
    getSession,
    getOrders,
    getOrdersForUser,
    addOrder,
    updateOrderStatus,
  };
})();

DB.seedIfNeeded();
