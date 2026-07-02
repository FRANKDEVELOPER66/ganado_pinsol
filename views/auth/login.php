<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso — Gestión Ganadera Pineda Solares</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
        :root {
            --ps-vino: #6B1A2A;
            --ps-vino-dark: #4A1020;
            --ps-dorado: #C9A84C;
            --ps-dorado-light: #E8C96A;
            --ps-verde: #2D4A1E;
            --ps-cafe: #5C3A1E;
            --ps-crema: #F5EDD6;
            --ps-negro: #1A1A1A;
            --ps-blanco: #FFFFFF;
            --ps-font-title: "Georgia", serif;
            --ps-font-body: "Segoe UI", sans-serif;
            --ps-radius: 8px;
            --ps-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background-color: var(--ps-crema);
            min-height: 100vh;
            color: var(--ps-negro);
            font-family: var(--ps-font-body);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }

        .login-wrap {
            width: 100%;
            max-width: 420px;
            text-align: center;
        }

        .login-wrap h1 {
            font-family: var(--ps-font-title);
            color: var(--ps-vino);
            font-size: 1.9rem;
            margin-bottom: 0.25rem;
        }

        .login-wrap .subtitulo {
            color: var(--ps-cafe);
            font-size: 0.9rem;
            margin-bottom: 2rem;
            letter-spacing: 0.5px;
        }

        .card-login {
            background-color: var(--ps-blanco);
            border: 1px solid var(--ps-cafe);
            border-top: 4px solid var(--ps-vino);
            border-radius: var(--ps-radius);
            box-shadow: var(--ps-shadow);
            padding: 2rem 1.75rem;
            text-align: left;
        }

        .card-login h2 {
            font-family: var(--ps-font-title);
            color: var(--ps-vino);
            font-size: 1.2rem;
            border-bottom: 1px solid var(--ps-dorado);
            padding-bottom: 0.6rem;
            margin-bottom: 1.25rem;
        }

        label {
            display: block;
            font-size: 0.85rem;
            color: var(--ps-cafe);
            font-weight: bold;
            margin-bottom: 0.35rem;
        }

        input[type=text],
        input[type=email],
        input[type=password] {
            width: 100%;
            padding: 0.65rem 0.8rem;
            border: 2px solid var(--ps-cafe);
            border-radius: var(--ps-radius);
            font-size: 1rem;
            margin-bottom: 1.1rem;
            background-color: var(--ps-crema);
            color: var(--ps-negro);
        }

        input:focus {
            outline: none;
            border-color: var(--ps-dorado);
        }

        .btn-pinsol {
            width: 100%;
            background-color: var(--ps-vino);
            color: var(--ps-dorado);
            border: 2px solid var(--ps-dorado);
            border-radius: var(--ps-radius);
            padding: 0.7rem 1.2rem;
            font-weight: bold;
            letter-spacing: 0.5px;
            font-size: 1rem;
            transition: all 0.2s;
            cursor: pointer;
        }

        .btn-pinsol:hover {
            background-color: var(--ps-dorado);
            color: var(--ps-vino);
        }

        .btn-pinsol:disabled {
            opacity: 0.6;
            cursor: default;
        }

        .mensaje {
            margin-top: 1rem;
            padding: 0.65rem 0.8rem;
            border-radius: var(--ps-radius);
            font-size: 0.88rem;
            display: none;
        }

        .mensaje.error {
            background: #f8d7da;
            color: #6B1A2A;
            border: 1px solid var(--ps-vino);
            display: block;
        }

        .mensaje.info {
            background: #fff6dd;
            color: var(--ps-cafe);
            border: 1px solid var(--ps-dorado);
            display: block;
        }

        .link-volver {
            display: block;
            text-align: center;
            margin-top: 1rem;
            color: var(--ps-cafe);
            font-size: 0.85rem;
            text-decoration: none;
            cursor: pointer;
        }

        .link-volver:hover {
            color: var(--ps-vino);
        }

        footer.pie {
            margin-top: 2rem;
            color: var(--ps-cafe);
            font-size: 0.75rem;
            opacity: 0.8;
        }
    </style>
</head>

<body>
    <div class="login-wrap">
        <h1>Gestión Ganadera</h1>
        <div class="subtitulo">PINEDA SOLARES</div>

        <div class="card-login">
            <!-- Paso 1: catálogo -->
            <div id="paso-catalogo">
                <h2>Identificación</h2>
                <form id="formCatalogo" onsubmit="return false;">
                    <label for="catalogo">Número de catálogo</label>
                    <input type="text" id="catalogo" autocomplete="username" placeholder="Ej. 656207">
                    <button type="submit" class="btn-pinsol" id="btnVerificar">Continuar</button>
                </form>
                <div class="mensaje" id="msgCatalogo"></div>
            </div>

            <!-- Paso 2a: login normal -->
            <div id="paso-password" style="display:none;">
                <h2 id="saludoLogin">Contraseña</h2>
                <form id="formLogin" onsubmit="return false;">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" autocomplete="current-password">
                    <button type="submit" class="btn-pinsol" id="btnLogin">Ingresar</button>
                </form>
                <div class="mensaje" id="msgLogin"></div>
                <span class="link-volver" onclick="volverInicio()">← Usar otro catálogo</span>
            </div>

            <!-- Paso 2b: primer ingreso -->
            <div id="paso-primer-ingreso" style="display:none;">
                <h2 id="saludoPrimerIngreso">Bienvenido</h2>
                <p style="color:var(--ps-cafe); font-size:0.85rem; margin-bottom:1rem;">
                    Es tu primer ingreso. Crea tu contraseña para continuar.
                </p>
                <form id="formCrearPassword" onsubmit="return false;">
                    <label for="passwordNueva">Nueva contraseña</label>
                    <input type="password" id="passwordNueva" autocomplete="new-password">
                    <label for="passwordConfirm">Confirmar contraseña</label>
                    <input type="password" id="passwordConfirm" autocomplete="new-password">
                    <button type="submit" class="btn-pinsol" id="btnCrearPassword">Crear contraseña</button>
                </form>
                <div class="mensaje" id="msgCrearPassword"></div>
                <span class="link-volver" onclick="volverInicio()">← Usar otro catálogo</span>
            </div>
        </div>

        <footer class="pie">MDN · GANADERÍA PINEDA SOLARES © <?= date('Y') ?></footer>
    </div>

    <script>
        const BASE = '<?= $_ENV['APP_NAME'] ? '/' . $_ENV['APP_NAME'] : '' ?>';
        let catalogoActual = '';

        function mostrarMensaje(id, tipo, texto) {
            const el = document.getElementById(id);
            el.className = 'mensaje ' + tipo;
            el.style.display = 'block'; // ← agregar esta línea
            el.textContent = texto;
        }

        function ocultarMensaje(id) {
            document.getElementById(id).style.display = 'none';
        }

        function volverInicio() {
            document.getElementById('paso-catalogo').style.display = 'block';
            document.getElementById('paso-password').style.display = 'none';
            document.getElementById('paso-primer-ingreso').style.display = 'none';
            ocultarMensaje('msgCatalogo');
        }

        document.getElementById('formCatalogo').addEventListener('submit', async () => {
            const catalogo = document.getElementById('catalogo').value.trim();
            if (!catalogo) return mostrarMensaje('msgCatalogo', 'error', 'Ingresa tu número de catálogo');

            const btn = document.getElementById('btnVerificar');
            btn.disabled = true;
            ocultarMensaje('msgCatalogo');

            try {
                const resp = await fetch(BASE + '/API/auth/verificar-catalogo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: 'catalogo=' + encodeURIComponent(catalogo)
                });
                const data = await resp.json();
                catalogoActual = catalogo;

                if (data.codigo === 1) {
                    document.getElementById('paso-catalogo').style.display = 'none';
                    document.getElementById('paso-password').style.display = 'block';
                    document.getElementById('saludoLogin').textContent = data.nombre;
                    document.getElementById('password').focus();
                } else if (data.codigo === 2) {
                    document.getElementById('paso-catalogo').style.display = 'none';
                    document.getElementById('paso-primer-ingreso').style.display = 'block';
                    document.getElementById('saludoPrimerIngreso').textContent = 'Bienvenido, ' + data.nombre;
                    document.getElementById('correo').focus();
                } else {
                    mostrarMensaje('msgCatalogo', 'error', data.mensaje);
                }
            } catch (e) {
                mostrarMensaje('msgCatalogo', 'error', 'Error de conexión');
            } finally {
                btn.disabled = false;
            }
        });

        document.getElementById('formLogin').addEventListener('submit', async () => {
            const password = document.getElementById('password').value;
            if (!password) return mostrarMensaje('msgLogin', 'error', 'Ingresa tu contraseña');

            const btn = document.getElementById('btnLogin');
            btn.disabled = true;
            ocultarMensaje('msgLogin');

            try {
                const resp = await fetch(BASE + '/API/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: 'catalogo=' + encodeURIComponent(catalogoActual) + '&password=' + encodeURIComponent(password)
                });
                const data = await resp.json();
                if (data.codigo === 1) {
                    window.location.href = BASE + '/';
                } else {
                    mostrarMensaje('msgLogin', 'error', data.mensaje);
                }
            } catch (e) {
                mostrarMensaje('msgLogin', 'error', 'Error de conexión');
            } finally {
                btn.disabled = false;
            }
        });

        document.getElementById('formCrearPassword').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('passwordNueva').value;
            const confirm = document.getElementById('passwordConfirm').value;

            if (password.length < 8) {
                return Swal.fire({
                    icon: 'error',
                    title: 'Contraseña muy corta',
                    text: 'Debe tener al menos 8 caracteres',
                    confirmButtonColor: '#6B1A2A'
                });
            }
            if (password !== confirm) {
                return Swal.fire({
                    icon: 'error',
                    title: 'No coinciden',
                    text: 'Las contraseñas no son iguales',
                    confirmButtonColor: '#6B1A2A'
                });
            }

            const btn = document.getElementById('btnCrearPassword');
            btn.disabled = true;

            try {
                const resp = await fetch(BASE + '/API/auth/crear-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: 'catalogo=' + encodeURIComponent(catalogoActual) + '&password=' + encodeURIComponent(password) + '&password_confirm=' + encodeURIComponent(confirm)
                });
                const data = await resp.json();
                if (data.codigo === 1) {
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Contraseña creada!',
                        text: 'Ahora inicia sesión con tu catálogo y tu nueva contraseña.',
                        confirmButtonColor: '#6B1A2A'
                    });
                    volverInicio();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.mensaje,
                        confirmButtonColor: '#6B1A2A'
                    });
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    confirmButtonColor: '#6B1A2A'
                });
            } finally {
                btn.disabled = false;
            }
        });
    </script>
</body>

</html>