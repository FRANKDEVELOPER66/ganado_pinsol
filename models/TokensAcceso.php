<?php

namespace Model;

class TokensAcceso extends ActiveRecord
{
    protected static $tabla      = 'tokens_acceso';
    protected static $idTabla    = 'id';
    protected static $columnasDB = [
        'catalogo',
        'token',
        'expira',
        'usado'
    ];

    public $id;
    public $catalogo;
    public $token;
    public $expira;
    public $usado;

    public function __construct($args = [])
    {
        $this->id       = $args['id']       ?? null;
        $this->catalogo = $args['catalogo'] ?? '';
        $this->token    = $args['token']    ?? '';
        $this->expira   = $args['expira']   ?? '';
        $this->usado    = $args['usado']    ?? 0;
    }

    public static function generar(string $catalogo): self
    {
        return new self([
            'catalogo' => $catalogo,
            'token'    => bin2hex(random_bytes(32)),
            'expira'   => date('Y-m-d H:i:s', strtotime('+2 hours')),
            'usado'    => 0
        ]);
    }

    public static function buscarValido(string $token): ?self
    {
        $resultado = self::where('token', $token);
        $tokenObj  = $resultado[0] ?? null;

        if (!$tokenObj) return null;
        if ((int)$tokenObj->usado === 1) return null;
        if (strtotime($tokenObj->expira) < time()) return null;

        return $tokenObj;
    }
}
