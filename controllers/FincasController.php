<?php

namespace Controllers;

use MVC\Router;
use Model\Fincas;
use Model\Propietarios;

class FincasController
{
    public static function index(Router $router): void
    {
        $propietario_id   = (int)($_GET['propietario'] ?? 0);
        $propietario_nombre = urldecode($_GET['nombre'] ?? '');

        $router->render('fincas/index', [
            'propietario_id'     => $propietario_id,
            'propietario_nombre' => $propietario_nombre
        ]);
    }

    public static function listarAPI(Router $router): void
    {
        getHeadersApi();

        $propietario_id = (int)($_GET['propietario_id'] ?? 0);

        if (!$propietario_id) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Propietario inválido']);
            exit;
        }

        $fincas = Fincas::porPropietario($propietario_id);
        echo json_encode(['codigo' => 1, 'datos' => $fincas], JSON_UNESCAPED_UNICODE);
    }

    public static function crearAPI(Router $router): void
    {
        getHeadersApi();

        $finca = new Fincas([
            'propietario_id'    => (int)($_POST['propietario_id'] ?? 0),
            'nombre'            => trim($_POST['nombre']           ?? ''),
            'ubicacion'         => trim($_POST['ubicacion']        ?? ''),
            'inversion_inicial' => (float)($_POST['inversion_inicial'] ?? 0)
        ]);

        $alertas = $finca->validar();

        if (!empty($alertas['error'])) {
            echo json_encode(['codigo' => 0, 'mensaje' => implode(', ', $alertas['error'])]);
            exit;
        }

        $resultado = $finca->crear();

        echo json_encode([
            'codigo'  => $resultado['resultado'] ? 1 : 0,
            'mensaje' => $resultado['resultado']
                ? 'Finca registrada correctamente'
                : 'Error al registrar la finca',
            'id' => $resultado['id'] ?? null
        ]);
    }

    public static function actualizarAPI(Router $router): void
    {
        getHeadersApi();

        $id = (int)($_POST['id'] ?? 0);
        if (!$id) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'ID inválido']);
            exit;
        }

        $finca = Fincas::find($id);
        if (!$finca) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Finca no encontrada']);
            exit;
        }

        $finca->sincronizar([
            'nombre'            => trim($_POST['nombre']            ?? $finca->nombre),
            'ubicacion'         => trim($_POST['ubicacion']         ?? $finca->ubicacion),
            'inversion_inicial' => (float)($_POST['inversion_inicial'] ?? $finca->inversion_inicial)
        ]);

        $alertas = $finca->validar();
        if (!empty($alertas['error'])) {
            echo json_encode(['codigo' => 0, 'mensaje' => implode(', ', $alertas['error'])]);
            exit;
        }

        $resultado = $finca->actualizar();
        echo json_encode([
            'codigo'  => $resultado['resultado'] ? 1 : 0,
            'mensaje' => $resultado['resultado'] ? 'Finca actualizada' : 'Error al actualizar'
        ]);
    }

    public static function eliminarAPI(Router $router): void
    {
        getHeadersApi();

        $id = (int)($_POST['id'] ?? 0);
        if (!$id) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'ID inválido']);
            exit;
        }

        // Verificar que no tenga lotes
        $lotes = \Model\ActiveRecord::fetchArray(
            "SELECT COUNT(*) as total FROM lotes WHERE finca_id = {$id}"
        );
        if ((int)($lotes[0]['total'] ?? 0) > 0) {
            echo json_encode([
                'codigo'  => 0,
                'mensaje' => 'No se puede eliminar, la finca tiene lotes registrados'
            ]);
            exit;
        }

        $finca = Fincas::find($id);
        if (!$finca) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Finca no encontrada']);
            exit;
        }

        $finca->eliminar();
        echo json_encode(['codigo' => 1, 'mensaje' => 'Finca eliminada correctamente']);
    }
}
