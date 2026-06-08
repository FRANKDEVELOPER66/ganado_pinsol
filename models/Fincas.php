<?php

namespace Model;

class Fincas extends ActiveRecord
{
    protected static $tabla      = 'fincas';
    protected static $idTabla    = 'id';
    protected static $columnasDB = [
        'propietario_id',
        'nombre',
        'ubicacion'
    ];

    public $id;
    public $propietario_id;
    public $nombre;
    public $ubicacion;

    public function __construct($args = [])
    {
        $this->propietario_id    = $args['propietario_id']    ?? null;
        $this->nombre            = $args['nombre']            ?? '';
        $this->ubicacion         = $args['ubicacion']         ?? '';
    }

    public static function porPropietario(int $propietario_id): array
    {
        return self::fetchArray("
        SELECT f.*,
               p.nombre as propietario_nombre,
               COUNT(DISTINCT CASE WHEN l.situacion = 'activo' THEN l.id END) as total_lotes,
               COALESCE(SUM(CASE WHEN l.situacion = 'activo' THEN l.cantidad_actual ELSE 0 END), 0) as total_cabezas,
               COALESCE((
                   SELECT SUM(g2.monto) 
                   FROM gastos g2 
                   WHERE g2.finca_id = f.id
               ), 0) as total_gastos
        FROM fincas f
        JOIN propietarios p ON p.id = f.propietario_id
        LEFT JOIN lotes l ON l.finca_id = f.id
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

        return static::$alertas;
    }
}
