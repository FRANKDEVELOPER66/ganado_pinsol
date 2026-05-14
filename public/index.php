<?php
require_once __DIR__ . '/../includes/app.php';


use MVC\Router;
use Controllers\AppController;
use Controllers\FincasController;
use Controllers\GastosController;
use Controllers\LotesController;
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


// ── FINCAS ────────────────────────────────────────────────────────────────────
$router->get('/fincas',                  [FincasController::class, 'index']);
$router->get('/API/fincas/listar',       [FincasController::class, 'listarAPI']);
$router->post('/API/fincas/crear',       [FincasController::class, 'crearAPI']);
$router->post('/API/fincas/actualizar',  [FincasController::class, 'actualizarAPI']);
$router->post('/API/fincas/eliminar',    [FincasController::class, 'eliminarAPI']);

// ── LOTES ─────────────────────────────────────────────────────────────────────
$router->get('/API/lotes/listar',      [LotesController::class, 'listarAPI']);
$router->post('/API/lotes/crear',      [LotesController::class, 'crearAPI']);
$router->post('/API/lotes/actualizar', [LotesController::class, 'actualizarAPI']);
$router->post('/API/lotes/vender',     [LotesController::class, 'venderAPI']);
$router->post('/API/lotes/eliminar',   [LotesController::class, 'eliminarAPI']);

// ── GASTOS ────────────────────────────────────────────────────────────────────
$router->get('/API/gastos/listar',    [GastosController::class, 'listarAPI']);
$router->post('/API/gastos/crear',    [GastosController::class, 'crearAPI']);
$router->post('/API/gastos/eliminar', [GastosController::class, 'eliminarAPI']);




$router->get('/', [AppController::class, 'index']);

// Comprueba y valida las rutas, que existan y les asigna las funciones del Controlador
$router->comprobarRutas();
