<?php

namespace Controllers;

use MVC\Router;
use Model\Lotes;

class LotesController
{
    public static function listarAPI(Router $router): void
    {
        getHeadersApi();
        $finca_id = (int)($_GET['finca_id'] ?? 0);

        if (!$finca_id) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Finca inválida']);
            exit;
        }

        $lotes = Lotes::porFinca($finca_id);
        echo json_encode(['codigo' => 1, 'datos' => $lotes], JSON_UNESCAPED_UNICODE);
    }

    public static function crearAPI(Router $router): void
    {
        getHeadersApi();

        $lote = new Lotes([
            'finca_id'         => (int)($_POST['finca_id']         ?? 0),
            'nombre'           => trim($_POST['nombre']            ?? ''),
            'tipo'             => $_POST['tipo']                   ?? 'bovino',
            'etapa'            => $_POST['etapa']                  ?? 'cría',
            'cantidad_cabezas' => (int)($_POST['cantidad_cabezas'] ?? 0),
            'cantidad_actual'  => (int)($_POST['cantidad_cabezas'] ?? 0),
            'peso_promedio_kg' => $_POST['peso_promedio_kg']       ?? null,
            'fecha_ingreso'    => $_POST['fecha_ingreso']          ?? null,
            'observaciones'    => trim($_POST['observaciones']     ?? '')
        ]);

        $alertas = $lote->validar();
        if (!empty($alertas['error'])) {
            echo json_encode(['codigo' => 0, 'mensaje' => implode(', ', $alertas['error'])]);
            exit;
        }

        $resultado = $lote->crear();
        echo json_encode([
            'codigo'  => $resultado['resultado'] ? 1 : 0,
            'mensaje' => $resultado['resultado'] ? 'Lote registrado correctamente' : 'Error al registrar',
            'id'      => $resultado['id'] ?? null
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

        $lote = Lotes::find($id);
        if (!$lote) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Lote no encontrado']);
            exit;
        }

        $lote->sincronizar([
            'nombre'           => trim($_POST['nombre']            ?? $lote->nombre),
            'tipo'             => $_POST['tipo']                   ?? $lote->tipo,
            'etapa'            => $_POST['etapa']                  ?? $lote->etapa,
            'cantidad_cabezas' => (int)($_POST['cantidad_cabezas'] ?? $lote->cantidad_cabezas),
            'peso_promedio_kg' => $_POST['peso_promedio_kg']       ?? $lote->peso_promedio_kg,
            'fecha_ingreso'    => $_POST['fecha_ingreso']          ?? $lote->fecha_ingreso,
            'observaciones'    => trim($_POST['observaciones']     ?? $lote->observaciones)
        ]);

        $alertas = $lote->validar();
        if (!empty($alertas['error'])) {
            echo json_encode(['codigo' => 0, 'mensaje' => implode(', ', $alertas['error'])]);
            exit;
        }

        $resultado = $lote->actualizar();
        echo json_encode([
            'codigo'  => $resultado['resultado'] ? 1 : 0,
            'mensaje' => $resultado['resultado'] ? 'Lote actualizado' : 'Error al actualizar'
        ]);
    }

    public static function venderAPI(Router $router): void
    {
        getHeadersApi();

        $id    = (int)($_POST['id']    ?? 0);
        $precio = (float)($_POST['precio_venta_total'] ?? 0);
        $fecha  = $_POST['fecha_venta'] ?? date('Y-m-d');

        if (!$id || $precio <= 0) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Datos incompletos']);
            exit;
        }

        $lote = Lotes::find($id);
        if (!$lote) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Lote no encontrado']);
            exit;
        }

        $lote->sincronizar([
            'etapa'              => 'vendido',
            'fecha_venta'        => $fecha,
            'precio_venta_total' => $precio
        ]);

        $resultado = $lote->actualizar();
        echo json_encode([
            'codigo'  => $resultado['resultado'] ? 1 : 0,
            'mensaje' => $resultado['resultado'] ? 'Lote marcado como vendido' : 'Error al actualizar'
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

        $lote = Lotes::find($id);
        if (!$lote) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Lote no encontrado']);
            exit;
        }

        $lote->eliminar();
        echo json_encode(['codigo' => 1, 'mensaje' => 'Lote eliminado correctamente']);
    }
}
