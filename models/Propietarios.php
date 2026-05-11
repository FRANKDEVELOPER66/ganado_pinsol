<?php

namespace Model;

class Propietarios extends ActiveRecord
{
    protected static $tabla     = 'propietarios';
    protected static $idTabla   = 'id';
    protected static $columnasDB = [
        'id',
        'nombre',
        'telefono',
        'direccion',
    ];

    public $id;
    public $nombre;
    public $telefono;
    public $direccion;

    public function __construct($args = [])
    {
        $this->nombre    = $args['nombre']    ?? '';
        $this->telefono  = $args['telefono']  ?? '';
        $this->direccion = $args['direccion'] ?? '';
    }

    // ── Todos los propietarios ordenados ─────────────────────────────────────
    public static function todos(): array
    {
        return self::fetchArray("
        SELECT p.*,
               COUNT(f.id) as total_fincas
        FROM propietarios p
        LEFT JOIN fincas f ON f.propietario_id = p.id
        GROUP BY p.id
        ORDER BY p.nombre ASC
    ") ?? [];
    }

    // ── Buscar por nombre ─────────────────────────────────────────────────────
    public static function buscar(string $termino): array
    {
        $termino = self::$db->quote('%' . $termino . '%');
        return self::fetchArray("
            SELECT * FROM propietarios
            WHERE nombre LIKE {$termino}
            ORDER BY nombre ASC
        ");
    }

    // ── Validaciones ──────────────────────────────────────────────────────────
    public function validar(): array
    {
        static::$alertas = [];

        if (!$this->nombre) {
            static::$alertas['error'][] = 'El nombre es obligatorio';
        }

        if ($this->telefono && !preg_match('/^[0-9\-\+\s]{7,15}$/', $this->telefono)) {
            static::$alertas['error'][] = 'Teléfono inválido';
        }

        return static::$alertas;
    }
}
