<?php
require_once __DIR__ . '/../includes/app.php';


use MVC\Router;
use Controllers\AppController;
use Controllers\AuthController;
use Controllers\DashboardController;
use Controllers\FincasController;
use Controllers\GastosController;
use Controllers\LotesController;
use Controllers\PrestamosController;
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

// ── PRÉSTAMOS ─────────────────────────────────────────────────────────────────
$router->get('/API/prestamos/listar',    [PrestamosController::class, 'listarAPI']);
$router->post('/API/prestamos/crear',    [PrestamosController::class, 'crearAPI']);
$router->post('/API/prestamos/eliminar', [PrestamosController::class, 'eliminarAPI']);



$router->post('/API/lotes/desactivar',      [LotesController::class, 'desactivarAPI']);
$router->post('/API/lotes/registrar-baja',  [LotesController::class, 'registrarBajaAPI']);
$router->get('/API/lotes/bajas',            [LotesController::class, 'listarBajasAPI']);



$router->get('/', [AppController::class, 'index']);




// ── AUTH (Android) ────────────────────────────────────────────────────────────
$router->post('/API/auth/login',  [AuthController::class, 'loginAPI']);
$router->post('/API/auth/logout', [AuthController::class, 'logoutAPI']);

$router->get('/API/dashboard/resumen', [DashboardController::class, 'resumenAPI']);

$router->get('/API/dashboard/liquidacion', [DashboardController::class, 'liquidacionAPI']);

// Comprueba y valida las rutas, que existan y les asigna las funciones del Controlador
$router->comprobarRutas();
