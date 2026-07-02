<?php

namespace MVC;

class Router
{
    public $getRoutes = [];
    public $postRoutes = [];
    protected $base = '';

    public function get($url, $fn)
    {
        $this->getRoutes[$this->base . $url] = $fn;
    }

    public function post($url, $fn)
    {
        $this->postRoutes[$this->base . $url] = $fn;
    }

    public function setBaseURL($base)
    {
        $this->base = $base;
    }

    public function comprobarRutas()
    {
        $currentUrl = $_SERVER['REQUEST_URI'] ? str_replace("?" . $_SERVER['QUERY_STRING'], '', $_SERVER['REQUEST_URI']) : $this->base . '/';
        $method = $_SERVER['REQUEST_METHOD'];

        // ── Rutas públicas (no requieren sesión) ────────────────────────────────
        $rutasPublicas = [
            $this->base . '/login',
            $this->base . '/API/auth/verificar-catalogo',
            $this->base . '/API/auth/crear-password',
            $this->base . '/API/auth/login',
            $this->base . '/logout',
        ];

        if (!in_array($currentUrl, $rutasPublicas) && !isset($_SESSION['auth_user'])) {
            if (empty($_SERVER['HTTP_X_REQUESTED_WITH'])) {
                header('Location: ' . $this->base . '/login');
                exit;
            } else {
                getHeadersApi();
                echo json_encode(['codigo' => 0, 'mensaje' => 'Sesión expirada']);
                exit;
            }
        }

        if ($method === 'GET') {
            $fn = $this->getRoutes[$currentUrl] ?? null;
        } else {
            $fn = $this->postRoutes[$currentUrl] ?? null;
        }

        if ($fn) {
            call_user_func($fn, $this);
        } else {
            if (empty($_SERVER['HTTP_X_REQUESTED_WITH'])) {
                $this->render('pages/notfound');
            } else {
                getHeadersApi();
                echo json_encode(["ERROR" => "PÁGINA NO ENCONTRADA"]);
            }
        }
    }

    public function render($view, $datos = [])
    {

        // Leer lo que le pasamos  a la vista
        foreach ($datos as $key => $value) {
            $$key = $value;  // Doble signo de dolar significa: variable variable, básicamente nuestra variable sigue siendo la original, pero al asignarla a otra no la reescribe, mantiene su valor, de esta forma el nombre de la variable se asigna dinamicamente
        }

        ob_start(); // Almacenamiento en memoria durante un momento...

        // entonces incluimos la vista en el layout
        include_once __DIR__ . "/views/$view.php";
        $contenido = ob_get_clean(); // Limpia el Buffer
        include_once __DIR__ . '/views/layout.php';
    }

    public function load($view, $datos = [])
    {
        foreach ($datos as $key => $value) {
            $$key = $value;  // Doble signo de dolar significa: variable variable, básicamente nuestra variable sigue siendo la original, pero al asignarla a otra no la reescribe, mantiene su valor, de esta forma el nombre de la variable se asigna dinamicamente
        }

        ob_start(); // Almacenamiento en memoria durante un momento...

        // entonces incluimos la vista en el layout
        include_once __DIR__ . "/views/$view.php";
        $contenido = ob_get_clean(); // Limpia el Buffer
        return $contenido;
    }

    public function printPDF($ruta)
    {

        header("Content-type: application/pdf");
        header("Content-Disposition: inline; filename=filename.pdf");
        @readfile(__DIR__ . '/storage/' . $ruta);
    }
}
