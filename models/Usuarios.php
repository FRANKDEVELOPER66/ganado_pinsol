<?php

namespace Model;

class Usuarios extends ActiveRecord
{
    protected static $tabla      = 'usuarios';
    protected static $idTabla    = 'id';
    protected static $columnasDB = [
        'catalogo',
        'nombre_completo',
        'correo',
        'password',
        'primer_ingreso',
        'activo'
    ];

    public $id;
    public $catalogo;
    public $nombre_completo;
    public $correo;
    public $password;
    public $primer_ingreso;
    public $activo;

    public function __construct($args = [])
    {
        $this->id              = $args['id']              ?? null;
        $this->catalogo        = $args['catalogo']         ?? '';
        $this->nombre_completo = $args['nombre_completo']  ?? '';
        $this->correo          = $args['correo']           ?? '';
        $this->password        = $args['password']         ?? '';
        $this->primer_ingreso  = $args['primer_ingreso']   ?? 1;
        $this->activo          = $args['activo']           ?? 1;
    }

    public static function buscarPorCatalogo(string $catalogo): ?self
    {
        $resultado = self::where('catalogo', $catalogo);
        return $resultado[0] ?? null;
    }

    public function verificarPassword(string $password): bool
    {
        if (!$this->password) return false;
        return password_verify($password, $this->password);
    }

    public function saludo(): string
    {
        return 'Bienvenido, ' . $this->nombre_completo;
    }

    public function validar(): array
    {
        static::$alertas = [];
        if (!$this->catalogo) {
            static::$alertas['error'][] = 'El catálogo es obligatorio';
        }
        return static::$alertas;
    }
}
