<?php

namespace Controllers;

use MVC\Router;

class AuthController
{

    public static function loginAPI(Router $router): void
    {
        getHeadersApi();

        $usuario  = trim($_POST['usuario']  ?? '');
        $password = trim($_POST['password'] ?? '');

        // Ajusta esto a como valides usuarios en tu app
        $usuarios_validos = [
            'admin' => password_hash('tu_password', PASSWORD_DEFAULT)
        ];

        if (!$usuario || !$password) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Credenciales requeridas']);
            exit;
        }

        // Verifica contra tu tabla de usuarios o hardcodeado para empezar
        $db   = \Model\ActiveRecord::getDB();
        $stmt = $db->prepare("SELECT * FROM usuarios WHERE usuario = ? LIMIT 1");
        $stmt->execute([$usuario]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Credenciales incorrectas']);
            exit;
        }

        // Generar token
        $token = bin2hex(random_bytes(32)); // 64 chars
        $stmt  = $db->prepare("
            INSERT INTO api_tokens (token, usuario, expires_at)
            VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))
        ");
        $stmt->execute([$token, $usuario]);

        echo json_encode([
            'codigo'  => 1,
            'mensaje' => 'Login exitoso',
            'token'   => $token,
            'usuario' => $usuario
        ]);
    }

    public static function logoutAPI(Router $router): void
    {
        getHeadersApi();

        $headers = getallheaders();
        $auth    = $headers['Authorization'] ?? '';
        $token   = substr($auth, 7);

        $db   = \Model\ActiveRecord::getDB();
        $stmt = $db->prepare("DELETE FROM api_tokens WHERE token = ?");
        $stmt->execute([$token]);

        echo json_encode(['codigo' => 1, 'mensaje' => 'Sesión cerrada']);
    }
}
