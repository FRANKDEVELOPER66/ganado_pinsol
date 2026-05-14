<?php

namespace Model;

class Gastos extends ActiveRecord
{
    protected static $tabla      = 'gastos';
    protected static $idTabla    = 'id';
    protected static $columnasDB = [
        'finca_id',
        'lote_id',
        'categoria',
        'descripcion',
        'monto',
        'fecha'
    ];

    public $id;
    public $finca_id;
    public $lote_id;
    public $categoria;
    public $descripcion;
    public $monto;
    public $fecha;

    public function __construct($args = [])
    {
        $this->finca_id    = $args['finca_id']    ?? null;
        $this->lote_id     = $args['lote_id']     ?? null;
        $this->categoria   = $args['categoria']   ?? 'otro';
        $this->descripcion = $args['descripcion'] ?? '';
        $this->monto       = $args['monto']       ?? 0;
        $this->fecha       = $args['fecha']       ?? null;
    }

    public static function porFinca(int $finca_id): array
    {
        return self::fetchArray("
            SELECT g.*,
                   l.nombre as lote_nombre
            FROM gastos g
            LEFT JOIN lotes l ON l.id = g.lote_id
            WHERE g.finca_id = {$finca_id}
            ORDER BY g.fecha DESC
        ") ?? [];
    }

    public static function porCategoria(int $finca_id): array
    {
        return self::fetchArray("
            SELECT categoria,
                   COUNT(*) as total_registros,
                   SUM(monto) as total_monto
            FROM gastos
            WHERE finca_id = {$finca_id}
            GROUP BY categoria
            ORDER BY total_monto DESC
        ") ?? [];
    }

    public function validar(): array
    {
        static::$alertas = [];

        if (!$this->finca_id) {
            static::$alertas['error'][] = 'La finca es obligatoria';
        }
        if (!$this->categoria) {
            static::$alertas['error'][] = 'La categoría es obligatoria';
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
