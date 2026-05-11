<?php
$base = $_ENV['APP_NAME'] ? '/' . $_ENV['APP_NAME'] : '';
?>

<style>
    /* ── Header ─────────────────────────────────────────────────────────────── */
    .prop-header {
        background: linear-gradient(135deg, #2a1f0e, #3d2a0f);
        border: 1px solid var(--ps-cafe);
        border-left: 4px solid var(--ps-dorado);
        border-radius: 14px;
        padding: 1.5rem 2rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1.25rem;
    }

    .prop-header .icon-wrap {
        background: rgba(201, 168, 76, .15);
        border: 1px solid rgba(201, 168, 76, .25);
        border-radius: 12px;
        width: 52px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: var(--ps-dorado);
        flex-shrink: 0;
    }

    .prop-header h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ps-crema);
        margin: 0;
        letter-spacing: .5px;
    }

    .prop-header p {
        font-size: .82rem;
        color: #a08060;
        margin: .2rem 0 0;
    }

    /* ── Buscador ────────────────────────────────────────────────────────────── */
    .prop-buscar {
        background: #2a1f0e;
        border: 1px solid var(--ps-cafe);
        border-radius: 10px;
        color: var(--ps-crema);
        padding: .55rem 1rem;
        font-size: .9rem;
        width: 280px;
        outline: none;
        transition: border .2s;
    }

    .prop-buscar:focus {
        border-color: var(--ps-dorado);
    }

    .prop-buscar::placeholder {
        color: #7c6a3a;
    }

    /* ── Grid de cards ───────────────────────────────────────────────────────── */
    .propietarios-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }

    /* ── Card ────────────────────────────────────────────────────────────────── */
    .prop-card {
        background: linear-gradient(160deg, #2a1f0e, #1c1208);
        border: 1px solid var(--ps-cafe);
        border-top: 4px solid var(--ps-vino);
        border-radius: 14px;
        padding: 1.25rem;
        transition: all .25s;
    }

    .prop-card:hover {
        border-color: var(--ps-dorado);
        border-top-color: var(--ps-dorado);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(201, 168, 76, .2);
    }

    .prop-card-nombre {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--ps-crema);
        margin-bottom: .5rem;
    }

    .prop-card-info {
        font-size: .83rem;
        color: #a08060;
        margin-bottom: .4rem;
        display: flex;
        align-items: center;
        gap: .4rem;
    }

    .prop-card-info i {
        color: var(--ps-dorado);
        width: 14px;
    }

    .fincas-badge {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        background: rgba(45, 74, 30, .5);
        color: var(--ps-dorado);
        border: 1px solid rgba(201, 168, 76, .3);
        border-radius: 20px;
        padding: .2rem .7rem;
        font-size: .75rem;
        font-weight: 700;
        margin-bottom: 1rem;
    }

    /* ── Botones de card ─────────────────────────────────────────────────────── */
    .prop-acciones {
        display: flex;
        gap: .4rem;
        flex-wrap: wrap;
    }

    .btn-prop {
        flex: 1;
        background: #2a1f0e;
        border: 1px solid var(--ps-cafe);
        border-radius: 8px;
        color: var(--ps-crema);
        padding: .45rem .5rem;
        font-size: .75rem;
        cursor: pointer;
        transition: all .2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: .3rem;
        min-width: 0;
    }

    .btn-prop:hover {
        border-color: var(--ps-dorado);
        color: var(--ps-dorado);
    }

    .btn-prop.fincas {
        border-color: var(--ps-verde);
        color: var(--ps-dorado);
        background: rgba(45, 74, 30, .3);
    }

    .btn-prop.fincas:hover {
        background: var(--ps-verde);
        color: var(--ps-crema);
    }

    .btn-prop.danger {
        border-color: #5C0A0A;
        color: #c0392b;
        background: rgba(92, 10, 10, .2);
    }

    .btn-prop.danger:hover {
        background: #5C0A0A;
        color: var(--ps-crema);
    }

    /* ── Botón nuevo ─────────────────────────────────────────────────────────── */
    .btn-nuevo-prop {
        background: linear-gradient(135deg, var(--ps-dorado), #a07828);
        border: none;
        border-radius: 10px;
        color: var(--ps-negro);
        padding: .6rem 1.25rem;
        font-size: .95rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: .5rem;
        transition: all .3s;
        letter-spacing: .5px;
    }

    .btn-nuevo-prop:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(201, 168, 76, .35);
    }

    .swal2-popup input::placeholder {
        color: #827553ff !important;
        opacity: 1;
    }
</style>

<!-- ── Header ──────────────────────────────────────────────────────────────── -->
<div class="prop-header">
    <div class="icon-wrap"><i class="bi bi-person-fill"></i></div>
    <div style="flex:1;">
        <h1>Propietarios</h1>
        <p>Gestión de propietarios de fincas ganaderas</p>
    </div>
    <input
        type="text"
        id="inputBuscar"
        class="prop-buscar"
        placeholder="🔍 Buscar propietario...">
    <button class="btn-nuevo-prop" id="btnNuevoPropietario">
        <i class="bi bi-person-plus-fill"></i> Nuevo
    </button>
</div>

<!-- ── Grid ───────────────────────────────────────────────────────────────── -->
<div class="propietarios-grid" id="propietariosGrid">
    <div style="text-align:center;padding:3rem;color:#7c6a3a;grid-column:1/-1;">
        <i class="bi bi-hourglass-split"
            style="font-size:2rem;opacity:.3;display:block;margin-bottom:.75rem;"></i>
        <p>Cargando propietarios...</p>
    </div>
</div>

<script src="<?= asset('build/js/propietarios/index.js') ?>" type="module"></script>