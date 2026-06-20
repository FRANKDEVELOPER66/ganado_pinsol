<?php

namespace Model;

class ApiTokens extends ActiveRecord
{
    protected static $tabla = 'api_tokens';
    protected static $columnasDB = ['id', 'token', 'usuario', 'created_at', 'expires_at'];
}
