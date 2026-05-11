<?php

namespace Controllers;

use MVC\Router;
use Model\Propietarios;

class PropietariosController
{

    public static function index(Router $router): void
    {
        $router->render('propietarios/index');
    }



    // ── API: listar todos ─────────────────────────────────────────────────────
    public static function listarAPI(): void
    {
        getHeadersApi();
        $propietarios = Propietarios::todos();
        echo json_encode(['codigo' => 1, 'datos' => $propietarios], JSON_UNESCAPED_UNICODE);
    }

    // ── API: crear ────────────────────────────────────────────────────────────
    public static function crearAPI(Router $router): void
    {
        getHeadersApi();

        $propietario = new Propietarios([
            'nombre'    => trim($_POST['nombre']    ?? ''),
            'telefono'  => trim($_POST['telefono']  ?? ''),
            'direccion' => trim($_POST['direccion'] ?? '')
        ]);

        $alertas = $propietario->validar();

        if (!empty($alertas['error'])) {
            echo json_encode([
                'codigo'  => 0,
                'mensaje' => implode(', ', $alertas['error'])
            ]);
            exit;
        }

        $resultado = $propietario->crear();

        if ($resultado['resultado']) {
            echo json_encode([
                'codigo'  => 1,
                'mensaje' => 'Propietario registrado correctamente',
                'id'      => $resultado['id']
            ]);
        } else {
            echo json_encode([
                'codigo'  => 0,
                'mensaje' => 'Error al registrar el propietario'
            ]);
        }
    }
    // ── API: actualizar ───────────────────────────────────────────────────────
    public static function actualizarAPI(): void
    {
        getHeadersApi();

        $id = (int)($_POST['id'] ?? 0);

        if (!$id) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'ID inválido']);
            exit;
        }

        $propietario = Propietarios::find($id);

        if (!$propietario) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Propietario no encontrado']);
            exit;
        }

        $propietario->sincronizar([
            'nombre'    => trim($_POST['nombre']    ?? $propietario->nombre),
            'telefono'  => trim($_POST['telefono']  ?? $propietario->telefono),
            'direccion' => trim($_POST['direccion'] ?? $propietario->direccion)
        ]);

        $alertas = $propietario->validar();

        if (!empty($alertas['error'])) {
            echo json_encode([
                'codigo'  => 0,
                'mensaje' => implode(', ', $alertas['error'])
            ]);
            exit;
        }

        $resultado = $propietario->actualizar();

        echo json_encode([
            'codigo'  => $resultado['resultado'] ? 1 : 0,
            'mensaje' => $resultado['resultado']
                ? 'Propietario actualizado correctamente'
                : 'Error al actualizar'
        ]);
    }

    // ── API: eliminar ─────────────────────────────────────────────────────────
    public static function eliminarAPI(): void
    {
        getHeadersApi();

        $id = (int)($_POST['id'] ?? 0);

        if (!$id) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'ID inválido']);
            exit;
        }

        // Verificar que no tenga fincas activas
        $fincas = \Model\ActiveRecord::fetchArray("
            SELECT COUNT(*) as total FROM fincas WHERE propietario_id = {$id}
        ");

        if ((int)($fincas[0]['total'] ?? 0) > 0) {
            echo json_encode([
                'codigo'  => 0,
                'mensaje' => 'No se puede eliminar, el propietario tiene fincas registradas'
            ]);
            exit;
        }

        $propietario = Propietarios::find($id);

        if (!$propietario) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Propietario no encontrado']);
            exit;
        }

        $propietario->eliminar();

        echo json_encode([
            'codigo'  => 1,
            'mensaje' => 'Propietario eliminado correctamente'
        ]);
    }

    // ── API: buscar ───────────────────────────────────────────────────────────
    public static function buscarAPI(): void
    {
        getHeadersApi();

        $termino = trim($_POST['termino'] ?? '');

        if (!$termino) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Ingresa un término de búsqueda']);
            exit;
        }

        $resultados = Propietarios::buscar($termino);

        echo json_encode([
            'codigo' => 1,
            'datos'  => $resultados
        ], JSON_UNESCAPED_UNICODE);
    }
}
