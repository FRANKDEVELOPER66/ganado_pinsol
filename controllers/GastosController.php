<?php

namespace Controllers;

use MVC\Router;
use Model\Gastos;

class GastosController
{
    public static function listarAPI(Router $router): void
    {
        getHeadersApi();
        $finca_id = (int)($_GET['finca_id'] ?? 0);

        if (!$finca_id) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Finca inválida']);
            exit;
        }

        $gastos     = Gastos::porFinca($finca_id);
        $categorias = Gastos::porCategoria($finca_id);
        $total      = array_sum(array_column($gastos, 'monto'));

        echo json_encode([
            'codigo'     => 1,
            'datos'      => $gastos,
            'categorias' => $categorias,
            'total'      => $total
        ], JSON_UNESCAPED_UNICODE);
    }

    public static function crearAPI(Router $router): void
    {
        getHeadersApi();

        $gasto = new Gastos([
            'finca_id'    => (int)($_POST['finca_id']  ?? 0),
            'lote_id' => !empty($_POST['lote_id']) ? (int)$_POST['lote_id'] : null,
            'categoria'   => $_POST['categoria']       ?? 'otro',
            'descripcion' => trim($_POST['descripcion'] ?? ''),
            'monto'       => (float)($_POST['monto']   ?? 0),
            'fecha'       => $_POST['fecha']            ?? null
        ]);

        $alertas = $gasto->validar();
        if (!empty($alertas['error'])) {
            echo json_encode(['codigo' => 0, 'mensaje' => implode(', ', $alertas['error'])]);
            exit;
        }

        $resultado = $gasto->crear();
        echo json_encode([
            'codigo'  => $resultado['resultado'] ? 1 : 0,
            'mensaje' => $resultado['resultado'] ? 'Gasto registrado correctamente' : 'Error al registrar'
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

        $gasto = Gastos::find($id);
        if (!$gasto) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Gasto no encontrado']);
            exit;
        }

        $gasto->eliminar();
        echo json_encode(['codigo' => 1, 'mensaje' => 'Gasto eliminado']);
    }
}
