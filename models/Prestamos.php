<?php

namespace Model;

class Prestamos extends ActiveRecord
{
    protected static $tabla      = 'prestamos';
    protected static $idTabla    = 'id';
    protected static $columnasDB = [
        'finca_id',
        'lote_id',
        'propietario_nombre',
        'descripcion',
        'monto',
        'fecha',
        'saldado'
    ];

    public $id;
    public $finca_id;
    public $lote_id;
    public $propietario_nombre;
    public $descripcion;
    public $monto;
    public $fecha;
    public $saldado = 0;

    public function __construct($args = [])
    {
        $this->finca_id            = $args['finca_id']            ?? null;
        $this->lote_id             = $args['lote_id']             ?? null;
        $this->propietario_nombre  = $args['propietario_nombre']  ?? '';
        $this->descripcion         = $args['descripcion']         ?? '';
        $this->monto               = $args['monto']               ?? 0;
        $this->fecha               = $args['fecha']               ?? null;
        $this->saldado             = $args['saldado']             ?? 0;
    }

    public static function porFinca(int $finca_id): array
    {
        return self::fetchArray("
        SELECT p.*,
       l.nombre as lote_nombre,
       l.situacion as lote_situacion
FROM prestamos p
LEFT JOIN lotes l ON l.id = p.lote_id
WHERE p.finca_id = {$finca_id}
ORDER BY p.fecha DESC
    ") ?? [];
    }

    public static function totalPorLote(int $lote_id): float
    {
        $resultado = self::fetchArray("
            SELECT COALESCE(SUM(monto), 0) as total
            FROM prestamos
            WHERE lote_id = {$lote_id}
        ");
        return (float)($resultado[0]['total'] ?? 0);
    }

    // ✅ ACTUALIZADO — valida si la finca tiene al menos un lote ACTIVO
    public static function fincaTieneLotesActivos(int $finca_id): bool
    {
        $resultado = self::fetchArray("
        SELECT COUNT(*) as total
        FROM lotes
        WHERE finca_id = {$finca_id}
        AND situacion = 'activo'
    ");
        return (int)($resultado[0]['total'] ?? 0) > 0;
    }

    public function validar(): array
    {
        static::$alertas = [];

        if (!$this->finca_id) {
            static::$alertas['error'][] = 'La finca es obligatoria';
        }
        if (!$this->propietario_nombre) {
            static::$alertas['error'][] = 'El nombre del propietario es obligatorio';
        }
        if (!$this->monto || $this->monto <= 0) {
            static::$alertas['error'][] = 'El monto debe ser mayor a 0';
        }
        if (!$this->fecha) {
            static::$alertas['error'][] = 'La fecha es obligatoria';
        }

        return static::$alertas;
    }
}
