<?php

namespace Model;

class Fincas extends ActiveRecord
{
    protected static $tabla      = 'fincas';
    protected static $idTabla    = 'id';
    protected static $columnasDB = [
        'propietario_id',
        'nombre',
        'ubicacion',
        'inversion_inicial'
    ];

    public $id;
    public $propietario_id;
    public $nombre;
    public $ubicacion;
    public $inversion_inicial;

    public function __construct($args = [])
    {
        $this->propietario_id    = $args['propietario_id']    ?? null;
        $this->nombre            = $args['nombre']            ?? '';
        $this->ubicacion         = $args['ubicacion']         ?? '';
        $this->inversion_inicial = $args['inversion_inicial'] ?? 0;
    }

    public static function porPropietario(int $propietario_id): array
    {
        return self::fetchArray("
            SELECT f.*,
                   p.nombre as propietario_nombre,
                   COUNT(l.id) as total_lotes,
                   COALESCE(SUM(l.cantidad_actual), 0) as total_cabezas,
                   COALESCE(SUM(g.monto), 0) as total_gastos
            FROM fincas f
            JOIN propietarios p ON p.id = f.propietario_id
            LEFT JOIN lotes l ON l.finca_id = f.id
            LEFT JOIN gastos g ON g.finca_id = f.id
            WHERE f.propietario_id = {$propietario_id}
            GROUP BY f.id
            ORDER BY f.nombre ASC
        ") ?? [];
    }

    public function validar(): array
    {
        static::$alertas = [];

        if (!$this->nombre) {
            static::$alertas['error'][] = 'El nombre de la finca es obligatorio';
        }

        if (!$this->propietario_id) {
            static::$alertas['error'][] = 'El propietario es obligatorio';
        }

        if ($this->inversion_inicial < 0) {
            static::$alertas['error'][] = 'La inversión no puede ser negativa';
        }

        return static::$alertas;
    }
}
