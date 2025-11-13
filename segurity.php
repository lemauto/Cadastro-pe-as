<?php
session_start();

// Caminho do arquivo onde os usuários serão salvos
$arquivoUsuarios = 'usuarios.json';

// Função para ler os usuários salvos
function lerUsuarios($arquivo) {
    if (!file_exists($arquivo)) {
        file_put_contents($arquivo, json_encode([])); // cria o arquivo se não existir
    }
    $dados = file_get_contents($arquivo);
    return json_decode($dados, true);
}

// Função para salvar os usuários
function salvarUsuarios($arquivo, $usuarios) {
    file_put_contents($arquivo, json_encode($usuarios, JSON_PRETTY_PRINT));
}

// Cadastrar novo usuário
if (isset($_POST['acao']) && $_POST['acao'] === 'cadastrar') {
    $novoUsuario = $_POST['usuario'] ?? '';
    $novaSenha = $_POST['senha'] ?? '';

    if ($novoUsuario !== '' && $novaSenha !== '') {
        $usuarios = lerUsuarios($arquivoUsuarios);

        // Verifica se já existe
        foreach ($usuarios as $user) {
            if ($user['usuario'] === $novoUsuario) {
                echo json_encode(['status' => 'erro', 'mensagem' => 'Usuário já existe!']);
                exit;
            }
        }

        // Adiciona novo usuário
        $usuarios[] = ['usuario' => $novoUsuario, 'senha' => $novaSenha];
        salvarUsuarios($arquivoUsuarios, $usuarios);

        echo json_encode(['status' => 'ok', 'mensagem' => 'Usuário cadastrado com sucesso!']);
        exit;
    } else {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Preencha todos os campos!']);
        exit;
    }
}

// Login
if (isset($_POST['acao']) && $_POST['acao'] === 'login') {
    $usuario = $_POST['usuario'] ?? '';
    $senha = $_POST['senha'] ?? '';

    $usuarios = lerUsuarios($arquivoUsuarios);
    foreach ($usuarios as $user) {
        if ($user['usuario'] === $usuario && $user['senha'] === $senha) {
            $_SESSION['usuario'] = $usuario;
            echo json_encode(['status' => 'ok', 'mensagem' => 'Login realizado com sucesso!']);
            exit;
        }
    }

    echo json_encode(['status' => 'erro', 'mensagem' => 'Usuário ou senha incorretos!']);
    exit;
}

// Logout
if (isset($_GET['acao']) && $_GET['acao'] === 'sair') {
    session_destroy();
    echo json_encode(['status' => 'ok', 'mensagem' => 'Logout realizado!']);
    exit;
}
?>
