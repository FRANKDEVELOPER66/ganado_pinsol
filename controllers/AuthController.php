<?php

namespace Controllers;

use MVC\Router;
use Model\Usuarios;

class AuthController
{
    // ── Vista login ───────────────────────────────────────────────────────────
    public static function login(Router $router): void
    {
        if (isset($_SESSION['auth_user'])) {
            header('Location: ' . ($_ENV['APP_NAME'] ? '/' . $_ENV['APP_NAME'] : '') . '/');
            exit;
        }
        include __DIR__ . '/../views/auth/login.php';
    }

    // ── API: verificar catálogo ───────────────────────────────────────────────
    public static function verificarCatalogoAPI(): void
    {
        getHeadersApi();
        $catalogo = trim($_POST['catalogo'] ?? '');

        if (!$catalogo) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Ingresa tu catálogo']);
            exit;
        }

        $usuario = Usuarios::buscarPorCatalogo($catalogo);

        if (!$usuario) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Catálogo no encontrado']);
            exit;
        }

        if (!$usuario->activo) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Usuario inactivo']);
            exit;
        }

        if ($usuario->primer_ingreso) {
            echo json_encode([
                'codigo'  => 2,
                'mensaje' => 'primer_ingreso',
                'nombre'  => $usuario->nombre_completo
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        echo json_encode([
            'codigo'  => 1,
            'mensaje' => 'ok',
            'nombre'  => $usuario->nombre_completo
        ], JSON_UNESCAPED_UNICODE);
    }

    // ── API: crear contraseña en primer ingreso ─────────────────────────────────
    public static function crearPasswordAPI(): void
    {
        getHeadersApi();
        $catalogo = trim($_POST['catalogo'] ?? '');
        $password = $_POST['password'] ?? '';
        $confirm  = $_POST['password_confirm'] ?? '';

        if (!$catalogo || !$password || !$confirm) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Datos incompletos']);
            exit;
        }

        if (strlen($password) < 8) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'La contraseña debe tener al menos 8 caracteres']);
            exit;
        }

        if ($password !== $confirm) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Las contraseñas no coinciden']);
            exit;
        }

        $usuario = Usuarios::buscarPorCatalogo($catalogo);
        if (!$usuario) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Usuario no encontrado']);
            exit;
        }

        if (!$usuario->activo) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Usuario inactivo']);
            exit;
        }

        $usuario->password       = password_hash($password, PASSWORD_BCRYPT);
        $usuario->primer_ingreso = 0;
        $usuario->guardar();

        echo json_encode(['codigo' => 1, 'mensaje' => 'Contraseña creada correctamente']);
    }

    // ── API: hacer login ──────────────────────────────────────────────────────
    public static function loginAPI(): void
    {
        getHeadersApi();
        $catalogo = trim($_POST['catalogo'] ?? '');
        $password = $_POST['password'] ?? '';

        if (!$catalogo || !$password) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Datos incompletos']);
            exit;
        }

        $usuario = Usuarios::buscarPorCatalogo($catalogo);

        if (!$usuario || !$usuario->verificarPassword($password)) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Catálogo o contraseña incorrectos']);
            exit;
        }

        if (!$usuario->activo) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Usuario inactivo']);
            exit;
        }

        $_SESSION['auth_user']   = $usuario->catalogo;
        $_SESSION['auth_nombre'] = $usuario->nombre_completo;

        echo json_encode([
            'codigo'  => 1,
            'mensaje' => $usuario->saludo()
        ], JSON_UNESCAPED_UNICODE);
    }

    // ── API: logout ───────────────────────────────────────────────────────────
    public static function logoutAPI(): void
    {
        session_destroy();
        echo json_encode(['codigo' => 1, 'mensaje' => 'Sesión cerrada']);
    }

    public static function logoutGET(): void
    {
        session_destroy();
        $base = $_ENV['APP_NAME'] ? '/' . $_ENV['APP_NAME'] : '';
        header('Location: ' . $base . '/login');
        exit;
    }
}
