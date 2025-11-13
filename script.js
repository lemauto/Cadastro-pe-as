// ====== LOGIN / CADASTRO ======

// Mostrar a tela de cadastro
function mostrarCadastro() {
  document.getElementById("login").style.display = "none";
  document.getElementById("cadastro").style.display = "block";
}

// Mostrar a tela de login
function mostrarLogin() {
  document.getElementById("cadastro").style.display = "none";
  document.getElementById("login").style.display = "block";
}

// Cadastrar novo usuário
function cadastrar() {
  const novoUser = document.getElementById("novoUsuario").value.trim();
  const novaSenha = document.getElementById("novaSenha").value.trim();

  if (novoUser && novaSenha) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

    if (usuarios.find(u => u.nome === novoUser)) {
      alert("Usuário já existe!");
      return;
    }

    usuarios.push({ nome: novoUser, senha: novaSenha });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Usuário cadastrado com sucesso!");
    mostrarLogin();
  } else {
    alert("Preencha todos os campos!");
  }
}

// Login
function entrar() {
  const user = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  const usuarioValido = usuarios.find(u => u.nome === user && u.senha === senha);

  if (usuarioValido) {
    document.getElementById("login").style.display = "none";
    document.getElementById("conteudo").style.display = "block";
  } else {
    alert("Usuário ou senha incorretos!");
  }
}

// Logout
function sair() {
  document.getElementById("conteudo").style.display = "none";
  document.getElementById("login").style.display = "block";
  document.getElementById("usuario").value = "";
  document.getElementById("senha").value = "";
}

// ====== GALERIA (opcional - se já tinha) ======
// Aqui você pode manter o código que já existia no seu script.js original
// Exemplo de base:
document.getElementById("enviar")?.addEventListener("click", () => {
  const codigo = document.getElementById("codigo").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const arquivos = document.getElementById("arquivo").files;
  const galeria = document.getElementById("galeria");

  if (!codigo || !descricao || arquivos.length === 0) {
    alert("Preencha todos os campos e adicione pelo menos um arquivo.");
    return;
  }

  for (let file of arquivos) {
    const card = document.createElement("div");
    card.classList.add("card");

    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      card.appendChild(img);
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.controls = true;
      card.appendChild(video);
    }

    const desc = document.createElement("p");
    desc.textContent = `${codigo} - ${descricao}`;
    card.appendChild(desc);

    galeria.appendChild(card);
  }

  document.getElementById("codigo").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("arquivo").value = "";
});

