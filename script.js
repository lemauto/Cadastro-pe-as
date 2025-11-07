// ===================== ELEMENTOS PRINCIPAIS =====================
const enviarBtn = document.getElementById('enviar');
const arquivoInput = document.getElementById('arquivo');
const codigoInput = document.getElementById('codigo');
const descricaoInput = document.getElementById('descricao');
const galeria = document.getElementById('galeria');

const modal = document.getElementById('modal');
const modalContent = modal.querySelector('.modal-content');
const fecharModal = modal.querySelector('.fechar');
const descricaoModal = modal.querySelector('.descricao-modal');
const indicadoresDiv = modal.querySelector('.indicadores');
const setaEsquerda = modal.querySelector('.seta.esquerda');
const setaDireita = modal.querySelector('.seta.direita');

let indiceAtual = 0;
let intervalo;

// ===================== LOGIN E CADASTRO DE USUÁRIO =====================
const loginContainer = document.getElementById('login-container');
const cadastroContainer = document.getElementById('cadastro-container');
const mainContent = document.querySelector('body > :not(#login-container):not(#cadastro-container)');

const loginForm = document.getElementById('login-form');
const cadastroForm = document.getElementById('cadastro-form');
const toCadastro = document.getElementById('to-cadastro');
const toLogin = document.getElementById('to-login');

// Mostrar/ocultar seções
function mostrarLogin() {
  loginContainer.style.display = 'flex';
  cadastroContainer.style.display = 'none';
  esconderConteudoPrincipal();
}
function mostrarCadastro() {
  cadastroContainer.style.display = 'flex';
  loginContainer.style.display = 'none';
  esconderConteudoPrincipal();
}
function mostrarConteudoPrincipal() {
  if (mainContent) {
    document.querySelectorAll('body > *').forEach(el => {
      if (el.id !== 'login-container' && el.id !== 'cadastro-container') el.style.display = '';
    });
  }
}
function esconderConteudoPrincipal() {
  document.querySelectorAll('body > *').forEach(el => {
    if (el.id !== 'login-container' && el.id !== 'cadastro-container') el.style.display = 'none';
  });
}

// Ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
  const usuarioLogado = localStorage.getItem('usuarioLogado');
  if (usuarioLogado) {
    mostrarConteudoPrincipal();
  } else {
    mostrarLogin();
  }
});

// Alternar entre login e cadastro
toCadastro.addEventListener('click', mostrarCadastro);
toLogin.addEventListener('click', mostrarLogin);

// Cadastro
cadastroForm.addEventListener('submit', e => {
  e.preventDefault();
  const nome = document.getElementById('novo-usuario').value.trim();
  const senha = document.getElementById('nova-senha').value.trim();
  if (!nome || !senha) return alert('Preencha todos os campos!');

  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  if (usuarios.find(u => u.nome === nome)) return alert('Usuário já existe!');

  usuarios.push({ nome, senha });
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  alert('Usuário cadastrado com sucesso!');
  mostrarLogin();
  cadastroForm.reset();
});

// Login
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const nome = document.getElementById('usuario').value.trim();
  const senha = document.getElementById('senha').value.trim();

  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  const usuarioValido = usuarios.find(u => u.nome === nome && u.senha === senha);

  if (usuarioValido) {
    localStorage.setItem('usuarioLogado', nome);
    alert(`Bem-vindo, ${nome}!`);
    mostrarConteudoPrincipal();
    loginContainer.style.display = 'none';
  } else {
    alert('Usuário ou senha inválidos!');
  }
});

// Logout (opcional)
function logout() {
  localStorage.removeItem('usuarioLogado');
  mostrarLogin();
}

// ===================== FUNÇÃO: SALVAR GALERIA =====================
function salvarGaleria() {
  const cards = Array.from(galeria.children);
  const dados = cards.map(card => {
    const codigo = card.querySelector('.label').textContent;
    const descricao = card.querySelector('.descricao').textContent;
    const medias = Array.from(card.querySelectorAll('img, video')).map(m => ({
      url: m.src,
      type: m.tagName.toLowerCase() === 'img' ? 'image' : 'video'
    }));
    return { codigo, descricao, medias };
  });
  localStorage.setItem('galeria', JSON.stringify(dados));
}

// ===================== FUNÇÃO: CARREGAR GALERIA =====================
function carregarGaleria() {
  try {
    const dados = JSON.parse(localStorage.getItem('galeria') || '[]');
    dados.forEach(d => galeria.appendChild(criarCard(d.codigo, d.descricao, d.medias)));
  } catch (e) {
    console.error('Erro ao carregar galeria:', e);
    localStorage.removeItem('galeria');
  }
}

// ===================== FUNÇÃO: CRIAR CARD =====================
function criarCard(codigo, descricao, medias) {
  const container = document.createElement('div');
  container.className = 'card';

  const capa = document.createElement('img');
  capa.src = medias[0].url;
  container.appendChild(capa);

  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = codigo;

  const descricaoBox = document.createElement('div');
  descricaoBox.className = 'descricao';
  descricaoBox.textContent = descricao;

  const botoes = document.createElement('div');
  botoes.className = 'botoes';
  const editarBtn = document.createElement('button');
  editarBtn.textContent = '✏️ Editar';
  const excluirBtn = document.createElement('button');
  excluirBtn.textContent = '🗑️ Excluir';
  botoes.append(editarBtn, excluirBtn);

  container.append(label, descricaoBox, botoes);

  editarBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (container.querySelector('.editar-box')) return;

    const editarBox = document.createElement('div');
    editarBox.className = 'editar-box';
    editarBox.addEventListener('click', e => e.stopPropagation());

    const inputCodigo = document.createElement('input');
    inputCodigo.value = codigo;
    const inputDescricao = document.createElement('textarea');
    inputDescricao.value = descricao;

    const salvarBtn = document.createElement('button');
    salvarBtn.textContent = 'Salvar';
    const cancelarBtn = document.createElement('button');
    cancelarBtn.textContent = 'Cancelar';
    cancelarBtn.style.background = '#999';

    [inputCodigo, inputDescricao, salvarBtn, cancelarBtn].forEach(el => {
      el.addEventListener('click', e => e.stopPropagation());
    });

    salvarBtn.addEventListener('click', () => {
      const novoCodigo = inputCodigo.value.trim() || codigo;
      const novaDescricao = inputDescricao.value.trim() || descricao;

      label.textContent = novoCodigo;
      descricaoBox.textContent = novaDescricao;

      codigo = novoCodigo;
      descricao = novaDescricao;

      editarBox.remove();
      salvarGaleria();
    });

    cancelarBtn.addEventListener('click', () => editarBox.remove());

    editarBox.append(inputCodigo, inputDescricao, salvarBtn, cancelarBtn);
    container.appendChild(editarBox);
  });

  excluirBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (confirm('Deseja realmente excluir este item?')) {
      container.remove();
      salvarGaleria();
    }
  });

  container.addEventListener('click', (e) => {
    const editarBox = container.querySelector('.editar-box');
    if (editarBox && editarBox.contains(e.target)) return;
    abrirModal(medias, codigo, descricao);
  });

  return container;
}

// ===================== FUNÇÃO: ABRIR MODAL =====================
function abrirModal(medias, codigo, descricao) {
  modal.style.display = 'flex';
  descricaoModal.textContent = descricao;
  indicadoresDiv.innerHTML = '';
  modalContent.querySelectorAll('img, video').forEach(el => el.remove());

  const codigoAntigo = modalContent.querySelector('.codigo-modal');
  if (codigoAntigo) codigoAntigo.remove();

  medias.forEach((m, i) => {
    const el = m.type === 'image' ? document.createElement('img') : document.createElement('video');
    el.src = m.url;
    if (m.type === 'video') el.controls = true;
    modalContent.insertBefore(el, descricaoModal);

    const indicador = document.createElement('div');
    indicador.className = 'indicador';
    indicador.addEventListener('click', () => mostrarSlide(i));
    indicadoresDiv.appendChild(indicador);
  });

  const codigoModal = document.createElement('div');
  codigoModal.className = 'codigo-modal';
  codigoModal.style.color = 'white';
  codigoModal.style.fontWeight = 'bold';
  codigoModal.style.marginTop = '10px';
  codigoModal.textContent = `Código: ${codigo}`;
  modalContent.insertBefore(codigoModal, descricaoModal);

  indiceAtual = 0;
  mostrarSlide(indiceAtual);

  if (intervalo) clearInterval(intervalo);
  intervalo = setInterval(() => mudarSlide(1), 15000);
}

// ===================== FUNÇÃO: CONTROLE DO SLIDE =====================
function mostrarSlide(index) {
  const slides = modalContent.querySelectorAll('img, video');
  const indicadores = indicadoresDiv.querySelectorAll('.indicador');

  if (slides.length === 0) return;

  if (index >= slides.length) indiceAtual = 0;
  if (index < 0) indiceAtual = slides.length - 1;

  slides.forEach(s => s.style.display = 'none');
  indicadores.forEach(i => i.classList.remove('ativo'));

  if (slides[indiceAtual]) slides[indiceAtual].style.display = 'block';
  if (indicadores[indiceAtual]) indicadores[indiceAtual].classList.add('ativo');
}

function mudarSlide(n) {
  indiceAtual += n;
  mostrarSlide(indiceAtual);
}

// ===================== EVENTOS DO MODAL =====================
fecharModal.addEventListener('click', () => {
  modal.style.display = 'none';
  clearInterval(intervalo);
});

window.addEventListener('click', e => {
  if (e.target === modal) {
    modal.style.display = 'none';
    clearInterval(intervalo);
  }
});

setaEsquerda.addEventListener('click', () => mudarSlide(-1));
setaDireita.addEventListener('click', () => mudarSlide(1));

// ===================== FUNÇÃO: CADASTRAR NOVA PEÇA =====================
enviarBtn.addEventListener('click', () => {
  const arquivos = Array.from(arquivoInput.files);
  const codigo = codigoInput.value.trim();
  const descricao = descricaoInput.value.trim();

  if (!codigo) return alert('Digite o código da peça!');
  if (arquivos.length === 0) return alert('Escolha pelo menos uma foto ou vídeo!');

  const duplicado = Array.from(galeria.querySelectorAll('.label'))
    .some(l => l.textContent === codigo);
  if (duplicado) return alert('Já existe uma peça com este código!');

  const medias = [];
  let carregadas = 0;

  arquivos.forEach(arquivo => {
    const reader = new FileReader();
    reader.onload = e => {
      medias.push({
        url: e.target.result,
        type: arquivo.type.startsWith('image') ? 'image' : 'video'
      });
      carregadas++;
      if (carregadas === arquivos.length) {
        galeria.appendChild(criarCard(codigo, descricao, medias));
        salvarGaleria();
      }
    };
    reader.readAsDataURL(arquivo);
  });

  codigoInput.value = '';
  descricaoInput.value = '';
  arquivoInput.value = '';
});



// ===================== INICIALIZAÇÃO =====================
carregarGaleria();