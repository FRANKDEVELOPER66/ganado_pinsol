<?php

namespace Controllers;

use MVC\Router;

class DashboardController
{
    public static function resumenAPI(Router $router): void
    {
        getHeadersApi();
        $db = \Model\ActiveRecord::getDB();

        $datos = $db->query("
            SELECT 
                (SELECT COUNT(*) FROM propietarios) as total_propietarios,
                (SELECT COUNT(*) FROM fincas) as total_fincas,
                (SELECT COUNT(*) FROM lotes WHERE situacion = 'activo') as lotes_activos,
                (SELECT COALESCE(SUM(cantidad_actual), 0) FROM lotes WHERE situacion = 'activo') as total_cabezas,
                (SELECT COALESCE(SUM(inversion_inicial), 0) FROM lotes WHERE situacion = 'activo') as total_inversion,
                (SELECT COUNT(*) FROM lotes WHERE situacion = 'vendido') as lotes_vendidos
        ")->fetch(\PDO::FETCH_ASSOC);

        echo json_encode(['codigo' => 1, 'datos' => $datos]);
    }

    public static function liquidacionAPI(Router $router): void {
    getHeadersApi();

    $lote_id = (int)($_GET['lote_id'] ?? 0);
    $finca_id = (int)($_GET['finca_id'] ?? 0);

    if (!$lote_id || !$finca_id) {
        echo json_encode(['codigo' => 0, 'mensaje' => 'Datos inválidos']);
        exit;
    }

    $db = \Model\ActiveRecord::getDB();

    // Lote
    $lote = \Model\ActiveRecord::fetchArray("
        SELECT l.*, COALESCE(SUM(g.monto),0) as total_gastos
        FROM lotes l
        LEFT JOIN gastos g ON g.lote_id = l.id
        WHERE l.id = {$lote_id}
        GROUP BY l.id
    ")[0] ?? null;

    if (!$lote) {
        echo json_encode(['codigo' => 0, 'mensaje' => 'Lote no encontrado']);
        exit;
    }

    // Gastos por categoría
    $gastos = \Model\ActiveRecord::fetchArray("
        SELECT categoria, SUM(monto) as total
        FROM gastos
        WHERE lote_id = {$lote_id}
        GROUP BY categoria
    ") ?? [];

    // Préstamos saldados
    $prestamos = \Model\ActiveRecord::fetchArray("
        SELECT SUM(monto) as total
        FROM prestamos
        WHERE (lote_id = {$lote_id} OR lote_id IS NULL)
        AND finca_id = {$finca_id}
        AND saldado = 1
    ") ?? [];

    $inversion      = (float)$lote['inversion_inicial'];
    $totalGastos    = (float)$lote['total_gastos'];
    $totalPrestamos = (float)($prestamos[0]['total'] ?? 0);
    $precioVenta    = (float)$lote['precio_venta_total'];
    $ganancia       = $precioVenta - $inversion - $totalGastos;
    $mitad          = $ganancia / 2;
    $pagoFinca      = $mitad - $totalPrestamos;
    $pagoGanado     = $inversion + $totalGastos + $totalPrestamos + $mitad;

    echo json_encode([
        'codigo' => 1,
        'datos'  => [
            'lote_nombre'      => $lote['nombre'],
            'fecha_venta'      => $lote['fecha_venta'],
            'precio_venta'     => $precioVenta,
            'inversion'        => $inversion,
            'total_gastos'     => $totalGastos,
            'total_prestamos'  => $totalPrestamos,
            'ganancia'         => $ganancia,
            'mitad'            => $mitad,
            'pago_finca'       => $pagoFinca,
            'pago_ganado'      => $pagoGanado,
            'gastos_por_cat'   => $gastos
        ]
    ], JSON_UNESCAPED_UNICODE);
}
}
