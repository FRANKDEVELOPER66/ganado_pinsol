<?php
require_once __DIR__ . '/../includes/app.php';


use MVC\Router;
use Controllers\AppController;
use Controllers\PropietariosController;

$router = new Router();
$router->setBaseURL('/' . $_ENV['APP_NAME']);

// ── PROPIETARIOS ──────────────────────────────────────────────────────────────
$router->get('/propietarios',                    [PropietariosController::class, 'index']);
$router->get('/API/propietarios/listar',         [PropietariosController::class, 'listarAPI']);
$router->post('/API/propietarios/crear',         [PropietariosController::class, 'crearAPI']);
$router->post('/API/propietarios/actualizar',    [PropietariosController::class, 'actualizarAPI']);
$router->post('/API/propietarios/eliminar',      [PropietariosController::class, 'eliminarAPI']);
$router->get('/API/propietarios/buscar',         [PropietariosController::class, 'buscarAPI']);

$router->get('/', [AppController::class, 'index']);

// Comprueba y valida las rutas, que existan y les asigna las funciones del Controlador
$router->comprobarRutas();
