<?php

namespace Model;

class Lotes extends ActiveRecord
{
    protected static $tabla      = 'lotes';
    protected static $idTabla    = 'id';
    protected static $columnasDB = [
        'finca_id',
        'nombre',
        'tipo',
        'etapa',
        'cantidad_cabezas',
        'cantidad_actual',
        'inversion_inicial',
        'peso_promedio_kg',
        'fecha_ingreso',
        'observaciones'
    ];

    public $id;
    public $finca_id;
    public $nombre;
    public $tipo;
    public $etapa;
    public $cantidad_cabezas;
    public $cantidad_actual;
    public $inversion_inicial = 0;
    public $peso_promedio_kg;
    public $fecha_ingreso;
    public $observaciones;

    public function __construct($args = [])
    {
        $this->finca_id          = $args['finca_id']          ?? null;
        $this->nombre            = $args['nombre']            ?? '';
        $this->tipo              = $args['tipo']              ?? 'bovino';
        $this->etapa             = $args['etapa']             ?? 'cría';
        $this->cantidad_cabezas  = $args['cantidad_cabezas']  ?? 0;
        $this->cantidad_actual   = $args['cantidad_actual']   ?? 0;
        $this->inversion_inicial = $args['inversion_inicial'] ?? 0;
        $this->peso_promedio_kg  = $args['peso_promedio_kg']  ?? null;
        $this->fecha_ingreso     = $args['fecha_ingreso']     ?? null;
        $this->observaciones     = $args['observaciones']     ?? null;
    }

    public static function porFinca(int $finca_id): array
    {
        return self::fetchArray("
            SELECT l.*,
                   COALESCE(SUM(b.cantidad), 0) as total_bajas,
                   COALESCE(SUM(g.monto), 0) as total_gastos
            FROM lotes l
            LEFT JOIN bajas_lote b ON b.lote_id = l.id
            LEFT JOIN gastos g ON g.lote_id = l.id
            WHERE l.finca_id = {$finca_id}
            GROUP BY l.id
            ORDER BY l.fecha_ingreso DESC
        ") ?? [];
    }

    public function validar(): array
    {
        static::$alertas = [];
        if (!$this->nombre) {
            static::$alertas['error'][] = 'El nombre del lote es obligatorio';
        }
        if (!$this->finca_id) {
            static::$alertas['error'][] = 'La finca es obligatoria';
        }
        if ($this->cantidad_cabezas <= 0) {
            static::$alertas['error'][] = 'La cantidad de cabezas debe ser mayor a 0';
        }
        if (!$this->fecha_ingreso) {
            static::$alertas['error'][] = 'La fecha de ingreso es obligatoria';
        }
        return static::$alertas;
    }
}
