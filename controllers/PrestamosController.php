<?php

namespace Controllers;

use MVC\Router;
use Model\Prestamos;

class PrestamosController
{
    public static function listarAPI(Router $router): void
    {
        getHeadersApi();
        $finca_id = (int)($_GET['finca_id'] ?? 0);

        if (!$finca_id) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Finca inválida']);
            exit;
        }

        $prestamos = Prestamos::porFinca($finca_id);
        $total     = array_sum(array_column($prestamos, 'monto'));

        echo json_encode([
            'codigo'    => 1,
            'datos'     => $prestamos,
            'total'     => $total
        ], JSON_UNESCAPED_UNICODE);
    }

    public static function crearAPI(Router $router): void
    {
        getHeadersApi();

        $finca_id = (int)($_POST['finca_id'] ?? 0);

        if (!$finca_id) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Finca inválida']);
            exit;
        }

        // ✅ ACTUALIZADO — no se puede prestar si la finca no tiene lotes ACTIVOS
        if (!Prestamos::fincaTieneLotesActivos($finca_id)) {
            echo json_encode([
                'codigo'  => 0,
                'mensaje' => 'Debes tener al menos un lote activo en esta finca antes de registrar un préstamo'
            ]);
            exit;
        }

        $prestamo = new Prestamos([
            'finca_id'           => $finca_id,
            'lote_id'            => $_POST['lote_id'] ? (int)$_POST['lote_id'] : null,
            'propietario_nombre' => trim($_POST['propietario_nombre']  ?? ''),
            'descripcion'        => trim($_POST['descripcion']         ?? ''),
            'monto'              => (float)($_POST['monto']            ?? 0),
            'fecha'              => $_POST['fecha']                    ?? null
        ]);

        $alertas = $prestamo->validar();
        if (!empty($alertas['error'])) {
            echo json_encode(['codigo' => 0, 'mensaje' => implode(', ', $alertas['error'])]);
            exit;
        }

        $resultado = $prestamo->crear();
        echo json_encode([
            'codigo'  => $resultado['resultado'] ? 1 : 0,
            'mensaje' => $resultado['resultado'] ? 'Préstamo registrado correctamente' : 'Error al registrar'
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

        $prestamo = Prestamos::find($id);
        if (!$prestamo) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Préstamo no encontrado']);
            exit;
        }

        $prestamo->eliminar();
        echo json_encode(['codigo' => 1, 'mensaje' => 'Préstamo eliminado']);
    }
}
