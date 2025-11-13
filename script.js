// script.js — versão corrigida e robusta
window.addEventListener('DOMContentLoaded', () => {
  // ===== HELPERS =====
  const qs = id => document.getElementById(id);
  const safeParse = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k) || 'null') ?? fallback; }
    catch (e) { console.error('Erro parse localStorage', e); return fallback; }
  };

  // ===== LOGIN / CADASTRO =====
  window.mostrarCadastro = function() {
    qs('login')?.style.display = 'none';
    qs('cadastro')?.style.display = 'block';
  };

  window.mostrarLogin = function() {
    qs('cadastro')?.style.display = 'none';
    qs('login')?.style.display = 'block';
  };

  window.cadastrar = function() {
    const novoUser = (qs('novoUsuario')?.value || '').trim();
    const novaSenha = (qs('novaSenha')?.value || '').trim();

    if (!novoUser || !novaSenha) {
      alert('Preencha todos os campos!');
      return;
    }

    localStorage.setItem('usuario', novoUser);
    localStorage.setItem('senha', novaSenha);
    alert('Usuário cadastrado com sucesso!');
    window.mostrarLogin();
  };

  window.entrar = function() {
    const user = (qs('usuario')?.value || '').trim();
    const senha = (qs('senha')?.value || '').trim();
    const userSalvo = localStorage.getItem('usuario');
    const senhaSalva = localStorage.getItem('senha');

    if (user === userSalvo && senha === senhaSalva) {
      qs('login') && (qs('login').style.display = 'none');
      qs('conteudo') && (qs('conteudo').style.display = 'block');
      carregarGaleria();
    } else {
      alert('Usuário ou senha incorretos!');
    }
  };

  window.sair = function() {
    qs('conteudo') && (qs('conteudo').style.display = 'none');
    qs('login') && (qs('login').style.display = 'block');
    if (qs('usuario')) qs('usuario').value = '';
    if (qs('senha')) qs('senha').value = '';
  };

  // ===== STORAGE DE PEÇAS =====
  function lerPecas() {
    return safeParse('pecas', []);
  }

  function salvarPecas(pecas) {
    localStorage.setItem('pecas', JSON.stringify(pecas));
  }

  // ===== CRIAÇÃO / EDIÇÃO / EXCLUSÃO =====
  function criarCardDOM(p) {
    const container = document.createElement('div');
    container.className = 'card';

    // Capa (imagem ou vídeo)
    if (p.medias && p.medias.length) {
      const m0 = p.medias[0];
      if (m0.type === 'image') {
        const img = document.createElement('img');
        img.src = m0.url;
        img.alt = p.codigo;
        container.appendChild(img);
      } else {
        const vid = document.createElement('video');
        vid.src = m0.url;
        vid.controls = true;
        container.appendChild(vid);
      }
    } else {
      const placeholder = document.createElement('div');
      placeholder.style.minHeight = '120px';
      placeholder.style.display = 'flex';
      placeholder.style.alignItems = 'center';
      placeholder.style.justifyContent = 'center';
      placeholder.textContent = 'Sem imagem';
      container.appendChild(placeholder);
    }

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = p.codigo;
    container.appendChild(label);

    const descricaoBox = document.createElement('div');
    descricaoBox.className = 'descricao';
    descricaoBox.textContent = p.descricao;
    container.appendChild(descricaoBox);

    const botoes = document.createElement('div');
    botoes.className = 'botoes';

    const btnEditar = document.createElement('button');
    btnEditar.textContent = '✏️ Editar';
    btnEditar.addEventListener('click', (ev) => {
      ev.stopPropagation();
      editarCard(p.codigo);
    });
    botoes.appendChild(btnEditar);

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = '🗑️ Excluir';
    btnExcluir.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (!confirm('Deseja realmente excluir este item?')) return;
      excluirCard(p.codigo);
    });
    botoes.appendChild(btnExcluir);

    container.appendChild(botoes);

    return container;
  }

  function atualizarOuInserirPeca(novaPeca) {
    const pecas = lerPecas();
    const idx = pecas.findIndex(x => x.codigo === novaPeca.codigo);
    if (idx !== -1) {
      // atualiza (preserva medias se não vier)
      pecas[idx] = { ...pecas[idx], ...novaPeca };
    } else {
      pecas.push(novaPeca);
    }
    salvarPecas(pecas);
  }

  function excluirCard(codigo) {
    let pecas = lerPecas();
    const novas = pecas.filter(p => p.codigo !== codigo);
    salvarPecas(novas);
    carregarGaleria();
  }

  function editarCard(codigoAntigo) {
    const pecas = lerPecas();
    const idx = pecas.findIndex(p => p.codigo === codigoAntigo);
    if (idx === -1) {
      alert('Peça não encontrada para editar.');
      return;
    }
    const p = pecas[idx];
    const novoCodigo = prompt('Editar código:', p.codigo);
    if (novoCodigo === null) return; // cancelou
    const novaDescricao = prompt('Editar descrição:', p.descricao);
    if (novaDescricao === null) return; // cancelou

    // Previne código vazio
    if (!novoCodigo.trim() || !novaDescricao.trim()) {
      alert('Código e descrição não podem ser vazios.');
      return;
    }

    // Se o novo código já existe em outro item -> perguntar se quer sobrescrever
    const existeOutro = pecas.find((x, i) => x.codigo === novoCodigo && i !== idx);
    if (existeOutro) {
      if (!confirm('Já existe uma peça com esse código. Deseja sobrescrever?')) return;
      // remover o outro
      pecas = pecas.filter((x, i) => !(x.codigo === novoCodigo && i !== idx));
    }

    // Atualiza o item (preservando medias)
    pecas[idx].codigo = novoCodigo;
    pecas[idx].descricao = novaDescricao;
    salvarPecas(pecas);
    carregarGaleria();
  }

  // ===== CADASTRO DE NOVAS PEÇAS (upload local via FileReader) =====
  const enviarBtn = qs('enviar');
  if (enviarBtn) {
    enviarBtn.addEventListener('click', (ev) => {
      ev.preventDefault && ev.preventDefault();

      const arquivoInput = qs('arquivo');
      const codigoInput = qs('codigo');
      const descricaoInput = qs('descricao');
      const galeria = qs('galeria');

      if (!arquivoInput || !codigoInput || !descricaoInput || !galeria) {
        console.error('Elementos necessários não encontrados no DOM.');
        alert('Erro: elementos da página faltando. Verifique o HTML.');
        return;
      }

      const arquivos = Array.from(arquivoInput.files || []);
      const codigo = (codigoInput.value || '').trim();
      const descricao = (descricaoInput.value || '').trim();

      if (!codigo) {
        alert('Digite o código da peça!');
        return;
      }
      if (arquivos.length === 0) {
        alert('Escolha pelo menos uma foto ou vídeo!');
        return;
      }

      // Ler todos os arquivos e criar objeto medias
      const medias = [];
      let carregadas = 0;

      arquivos.forEach((arquivo) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          medias.push({
            url: e.target.result,
            type: arquivo.type.startsWith('image') ? 'image' : 'video'
          });
          carregadas++;
          if (carregadas === arquivos.length) {
            // Atualiza/insere no localStorage sem duplicar
            atualizarOuInserirPeca({ codigo, descricao, medias });
            // Atualiza DOM (recarrega galeria inteira para evitar duplicatas visuais)
            carregarGaleria();
            // limpa inputs
            codigoInput.value = '';
            descricaoInput.value = '';
            arquivoInput.value = '';
          }
        };
        reader.onerror = (err) => {
          console.error('Erro ao ler arquivo:', err);
        };
        reader.readAsDataURL(arquivo);
      });
    });
  } else {
    console.warn('Botão enviar não encontrado (id="enviar").');
  }

  // ===== CARREGAR GALERIA =====
  window.carregarGaleria = function() {
    const galeria = qs('galeria');
    if (!galeria) return;
    galeria.innerHTML = '';
    const pecas = lerPecas();
    pecas.forEach(p => {
      const dom = criarCardDOM(p);
      galeria.appendChild(dom);
    });
  };

  // Se estiver logado por localStorage (opcional), podemos auto-entrar
  // (Se preferir não, comente as linhas abaixo)
  const usuarioLogado = localStorage.getItem('usuarioLogado');
  if (usuarioLogado) {
    if (qs('login')) qs('login').style.display = 'none';
    if (qs('conteudo')) {
      qs('conteudo').style.display = 'block';
      carregarGaleria();
    }
  }

  // Expor funções no window (compatibilidade com chamadas inline do HTML)
  window.carregarGaleria = window.carregarGaleria;
  window.excluirCard = excluirCard;
  window.editarCard = editarCard;
});


