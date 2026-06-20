<?php

function debuguear($variable)
{
    echo "<pre>";
    var_dump($variable);
    echo "</pre>";
    exit;
}

// Escapa / Sanitizar el HTML
function s($html)
{
    $s = htmlspecialchars($html);
    return $s;
}

// Función que revisa que el usuario este autenticado
function isAuth()
{
    session_start();
    if (!isset($_SESSION['login'])) {
        header('Location: /');
    }
}
function isAuthApi()
{
    getHeadersApi();
    session_start();
    if (!isset($_SESSION['auth_user'])) {
        echo json_encode([
            "mensaje" => "No esta autenticado",

            "codigo" => 4,
        ]);
        exit;
    }
}

function isNotAuth()
{
    session_start();
    if (isset($_SESSION['auth'])) {
        header('Location: /auth/');
    }
}


function hasPermission(array $permisos)
{

    $comprobaciones = [];
    foreach ($permisos as $permiso) {

        $comprobaciones[] = !isset($_SESSION[$permiso]) ? false : true;
    }

    if (array_search(true, $comprobaciones) !== false) {
    } else {
        header('Location: /');
    }
}

function hasPermissionApi(array $permisos)
{
    getHeadersApi();
    $comprobaciones = [];
    foreach ($permisos as $permiso) {

        $comprobaciones[] = !isset($_SESSION[$permiso]) ? false : true;
    }

    if (array_search(true, $comprobaciones) !== false) {
    } else {
        echo json_encode([
            "mensaje" => "No tiene permisos",

            "codigo" => 4,
        ]);
        exit;
    }
}

function getHeadersApi()
{
    header("Content-type: application/json; charset=utf-8");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}

function asset($ruta)
{
    return "/" . $_ENV['APP_NAME'] . "/public/" . $ruta;
}

function isAuthToken()
{
    getHeadersApi();

    $headers = getallheaders();
    $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!str_starts_with($auth, 'Bearer ')) {
        echo json_encode(['codigo' => 0, 'mensaje' => 'Token requerido']);
        exit;
    }

    $token = substr($auth, 7);
    $db    = \Model\ActiveRecord::getDB();
    $stmt  = $db->prepare("SELECT * FROM api_tokens WHERE token = ? AND (expires_at IS NULL OR expires_at > NOW())");
    $stmt->execute([$token]);
    $row = $stmt->fetch();

    if (!$row) {
        echo json_encode(['codigo' => 0, 'mensaje' => 'Token inválido o expirado']);
        exit;
    }
}
