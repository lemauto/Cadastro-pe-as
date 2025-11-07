<?php
// conexao.php
// Configuração de conexão ao banco MySQL
$DB_HOST = 'localhost';      // geralmente "localhost"
$DB_NAME = 'nome_do_banco';  // coloque o nome do seu banco MySQL
$DB_USER = 'usuario';        // usuário do banco
$DB_PASS = 'senha';          // senha do banco

$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES => false,
];

try {
  $pdo = new PDO(
    "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
    $DB_USER,
    $DB_PASS,
    $options
  );
} catch (PDOException $e) {
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['success' => false, 'message' => 'Erro de conexão: ' . $e->getMessage()]);
  exit;
}
?>

<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require 'conexao.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if (!$username || !$password) {
  echo json_encode(['success' => false, 'message' => 'Preencha todos os campos.']);
  exit;
}

// Verifica se usuário existe
$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
  echo json_encode(['success' => false, 'message' => 'Usuário já cadastrado.']);
  exit;
}

// Cria hash e insere
$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO usuarios (username, password_hash) VALUES (?, ?)");

try {
  $stmt->execute([$username, $hash]);
  echo json_encode(['success' => true, 'message' => 'Cadastro realizado com sucesso!']);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar: ' . $e->getMessage()]);
}
?>




<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require 'conexao.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if (!$username || !$password) {
  echo json_encode(['success' => false, 'message' => 'Informe usuário e senha.']);
  exit;
}

$stmt = $pdo->prepare("SELECT id, password_hash FROM usuarios WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
  echo json_encode(['success' => false, 'message' => 'Usuário ou senha incorretos.']);
  exit;
}

session_regenerate_id(true);
$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $username;

echo json_encode(['success' => true, 'message' => 'Login realizado com sucesso!', 'username' => $username]);
?>



<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

session_start();
$_SESSION = [];
if (ini_get("session.use_cookies")) {
  $params = session_get_cookie_params();
  setcookie(session_name(), '', time() - 42000,
    $params["path"], $params["domain"],
    $params["secure"], $params["httponly"]
  );
}
session_destroy();

echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso.']);
?>


<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

session_start();

if (!empty($_SESSION['user_id'])) {
  echo json_encode(['logged' => true, 'username' => $_SESSION['username']]);
} else {
  echo json_encode(['logged' => false]);
}
?>