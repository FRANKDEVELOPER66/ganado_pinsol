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

        $finca_id        = (int)($_POST['finca_id']         ?? 0);
        $nombre          = trim($_POST['nombre']            ?? '');
        $tipo            = $_POST['tipo']                   ?? 'bovino';
        $cantidad        = (int)($_POST['cantidad_cabezas'] ?? 0);
        $inversion       = (float)($_POST['inversion_inicial'] ?? 0);
        $peso            = $_POST['peso_promedio_kg']       ?: null;
        $fecha           = $_POST['fecha_ingreso']          ?? null;
        $observaciones   = trim($_POST['observaciones']     ?? '');

        if (!$finca_id || !$nombre || !$cantidad || !$fecha) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Datos incompletos']);
            exit;
        }

        $db   = \Model\ActiveRecord::getDB();
        $stmt = $db->prepare("
        INSERT INTO lotes 
            (finca_id, nombre, tipo, etapa, cantidad_cabezas, cantidad_actual,
             inversion_inicial, peso_promedio_kg, fecha_ingreso, observaciones)
        VALUES (?, ?, ?, 'cría', ?, ?, ?, ?, ?, ?)
    ");

        $stmt->execute([
            $finca_id,
            $nombre,
            $tipo,
            $cantidad,
            $cantidad,
            $inversion,
            $peso,
            $fecha,
            $observaciones
        ]);

        echo json_encode([
            'codigo'  => 1,
            'mensaje' => 'Lote registrado correctamente',
            'id'      => $db->lastInsertId()
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

        $db   = \Model\ActiveRecord::getDB();
        $stmt = $db->prepare("
        UPDATE lotes SET
            nombre            = ?,
            tipo              = ?,
            cantidad_cabezas  = ?,
            cantidad_actual   = ?,
            inversion_inicial = ?,
            peso_promedio_kg  = ?,
            fecha_ingreso     = ?,
            observaciones     = ?
        WHERE id = ?
    ");

        $stmt->execute([
            trim($_POST['nombre']               ?? $lote->nombre),
            $_POST['tipo']                      ?? $lote->tipo,
            (int)($_POST['cantidad_cabezas']    ?? $lote->cantidad_cabezas),
            (int)($_POST['cantidad_cabezas']    ?? $lote->cantidad_cabezas),
            (float)($_POST['inversion_inicial'] ?? $lote->inversion_inicial),
            $_POST['peso_promedio_kg']          ?: null,
            $_POST['fecha_ingreso']             ?? $lote->fecha_ingreso,
            trim($_POST['observaciones']        ?? ''),
            $id
        ]);

        echo json_encode(['codigo' => 1, 'mensaje' => 'Lote actualizado correctamente']);
    }

    public static function venderAPI(Router $router): void
    {
        getHeadersApi();

        $id     = (int)($_POST['id']                  ?? 0);
        $precio = (float)($_POST['precio_venta_total'] ?? 0);
        $fecha  = $_POST['fecha_venta']                ?? date('Y-m-d');

        if (!$id || $precio <= 0) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Datos incompletos']);
            exit;
        }

        $db = \Model\ActiveRecord::getDB();

        // ✅ Ahora actualiza AMBOS campos: etapa Y situacion
        $stmt = $db->prepare("
        UPDATE lotes SET
            etapa              = 'vendido',
            situacion          = 'vendido',
            fecha_venta        = ?,
            precio_venta_total = ?
        WHERE id = ?
    ");
        $stmt->execute([$fecha, $precio, $id]);

        // ✅ Saldar préstamos vinculados a este lote
        $stmt = $db->prepare("
        UPDATE prestamos SET saldado = 1
        WHERE lote_id = ? AND saldado = 0
    ");
        $stmt->execute([$id]);

        echo json_encode(['codigo' => 1, 'mensaje' => 'Lote marcado como vendido']);
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

    // ── Desactivar lote (soft delete) ─────────────────────────────────────────────
    public static function desactivarAPI(Router $router): void
    {
        getHeadersApi();

        $id = (int)($_POST['id'] ?? 0);
        if (!$id) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'ID inválido']);
            exit;
        }

        $db   = \Model\ActiveRecord::getDB();
        $stmt = $db->prepare("UPDATE lotes SET situacion = 'inactivo' WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['codigo' => 1, 'mensaje' => 'Lote desactivado correctamente']);
    }

    // ── Registrar baja ────────────────────────────────────────────────────────────
    public static function registrarBajaAPI(Router $router): void
    {
        getHeadersApi();

        $lote_id    = (int)($_POST['lote_id']    ?? 0);
        $cantidad   = (int)($_POST['cantidad']   ?? 0);
        $motivo     = $_POST['motivo']           ?? 'muerte';
        $descripcion = trim($_POST['descripcion'] ?? '');
        $fecha      = $_POST['fecha']            ?? date('Y-m-d');

        if (!$lote_id || $cantidad <= 0) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Datos incompletos']);
            exit;
        }

        // Verificar que no exceda las cabezas actuales
        $lote = \Model\Lotes::find($lote_id);
        if (!$lote) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Lote no encontrado']);
            exit;
        }

        if ($cantidad > (int)$lote->cantidad_actual) {
            echo json_encode([
                'codigo'  => 0,
                'mensaje' => "Solo hay {$lote->cantidad_actual} cabezas disponibles"
            ]);
            exit;
        }

        $db = \Model\ActiveRecord::getDB();

        // Registrar la baja
        $stmt = $db->prepare("
        INSERT INTO bajas_lote (lote_id, cantidad, motivo, descripcion, fecha)
        VALUES (?, ?, ?, ?, ?)
    ");
        $stmt->execute([$lote_id, $cantidad, $motivo, $descripcion, $fecha]);

        // Actualizar cantidad actual del lote
        $stmt = $db->prepare("
        UPDATE lotes SET cantidad_actual = cantidad_actual - ? WHERE id = ?
    ");
        $stmt->execute([$cantidad, $lote_id]);

        $quedan = $lote->cantidad_actual - $cantidad;
        echo json_encode([
            'codigo'  => 1,
            'mensaje' => "Baja registrada en '{$lote->nombre}'. Quedan {$quedan} cabezas"
        ]);
    }

    // ── Listar bajas de un lote ───────────────────────────────────────────────────
    public static function listarBajasAPI(Router $router): void
    {
        getHeadersApi();

        $lote_id = (int)($_GET['lote_id'] ?? 0);
        if (!$lote_id) {
            echo json_encode(['codigo' => 0, 'mensaje' => 'Lote inválido']);
            exit;
        }

        $bajas = \Model\ActiveRecord::fetchArray("
        SELECT * FROM bajas_lote
        WHERE lote_id = {$lote_id}
        ORDER BY fecha DESC
    ");

        $total = array_sum(array_column($bajas, 'cantidad'));

        echo json_encode([
            'codigo' => 1,
            'datos'  => $bajas,
            'total'  => $total
        ], JSON_UNESCAPED_UNICODE);
    }
}
