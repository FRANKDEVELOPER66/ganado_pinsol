<?php
$base = $_ENV['APP_NAME'] ? '/' . $_ENV['APP_NAME'] : '';
?>

<style>
    .finca-header {
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

    .finca-header .icon-wrap {
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

    .finca-header h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ps-crema);
        margin: 0;
    }

    .finca-header p {
        font-size: .82rem;
        color: #a08060;
        margin: .2rem 0 0;
    }

    .btn-volver {
        background: transparent;
        border: 1px solid var(--ps-cafe);
        border-radius: 8px;
        color: var(--ps-crema);
        padding: .5rem 1rem;
        font-size: .85rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: .4rem;
        transition: all .2s;
        text-decoration: none;
    }

    .btn-volver:hover {
        border-color: var(--ps-dorado);
        color: var(--ps-dorado);
    }

    .btn-nueva-finca {
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
    }

    .btn-nueva-finca:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(201, 168, 76, .35);
    }

    .fincas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1rem;
    }

    .finca-card {
        background: linear-gradient(160deg, #2a1f0e, #1c1208);
        border: 1px solid var(--ps-cafe);
        border-top: 4px solid var(--ps-verde);
        border-radius: 14px;
        padding: 1.25rem;
        transition: all .25s;
    }

    .finca-card:hover {
        border-color: var(--ps-dorado);
        border-top-color: var(--ps-dorado);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(201, 168, 76, .2);
    }

    .finca-card-nombre {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--ps-crema);
        margin-bottom: .5rem;
        border-bottom: 1px solid rgba(201, 168, 76, .2);
        padding-bottom: .5rem;
    }

    .finca-card-info {
        font-size: .83rem;
        color: #a08060;
        margin-bottom: .4rem;
        display: flex;
        align-items: center;
        gap: .4rem;
    }

    .finca-card-info i {
        color: var(--ps-dorado);
        width: 14px;
    }

    .finca-stats {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: .5rem;
        margin: .75rem 0;
    }

    .finca-stat {
        background: rgba(0, 0, 0, .2);
        border: 1px solid rgba(201, 168, 76, .15);
        border-radius: 8px;
        padding: .5rem;
        text-align: center;
    }

    .finca-stat-valor {
        font-size: 1rem;
        font-weight: 700;
        color: var(--ps-dorado);
    }

    .finca-stat-label {
        font-size: .65rem;
        color: #7c6a3a;
        margin-top: .1rem;
    }

    .finca-acciones {
        display: flex;
        gap: .4rem;
        flex-wrap: wrap;
        margin-top: .75rem;
    }

    .btn-finca {
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

    .btn-finca:hover {
        border-color: var(--ps-dorado);
        color: var(--ps-dorado);
    }

    .btn-finca.lotes {
        border-color: var(--ps-verde);
        color: var(--ps-dorado);
        background: rgba(45, 74, 30, .3);
    }

    .btn-finca.lotes:hover {
        background: var(--ps-verde);
        color: var(--ps-crema);
    }

    .btn-finca.danger {
        border-color: #5C0A0A;
        color: #c0392b;
        background: rgba(92, 10, 10, .2);
    }

    .btn-finca.danger:hover {
        background: #5C0A0A;
        color: var(--ps-crema);
    }

    .inversion-badge {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        background: rgba(107, 26, 42, .3);
        color: #e8a0a0;
        border: 1px solid rgba(107, 26, 42, .5);
        border-radius: 20px;
        padding: .2rem .7rem;
        font-size: .75rem;
        font-weight: 700;
        margin-bottom: .75rem;
    }

    .swal2-container {
        z-index: 99999 !important;
    }
</style>

<!-- ── Header ──────────────────────────────────────────────────────────────── -->
<div class="finca-header">
    <div class="icon-wrap"><i class="bi bi-tree-fill"></i></div>
    <div style="flex:1;">
        <h1>Fincas</h1>
        <p id="subtituloPropietario">Cargando...</p>
    </div>
    <a href="/<?= $_ENV['APP_NAME'] ?>/propietarios" class="btn-volver">
        <i class="bi bi-arrow-left"></i> Volver
    </a>
    <button class="btn-nueva-finca" id="btnNuevaFinca">
        <i class="bi bi-plus-circle-fill"></i> Nueva Finca
    </button>
</div>

<!-- ── Grid ───────────────────────────────────────────────────────────────── -->
<div class="fincas-grid" id="fincasGrid">
    <div style="text-align:center;padding:3rem;color:#7c6a3a;grid-column:1/-1;">
        <i class="bi bi-hourglass-split"
            style="font-size:2rem;opacity:.3;display:block;margin-bottom:.75rem;"></i>
        <p>Cargando fincas...</p>
    </div>
</div>

<script>
    const PROPIETARIO_ID = <?= (int)($propietario_id ?? 0) ?>;
    const PROPIETARIO_NOMBRE = '<?= htmlspecialchars($propietario_nombre ?? '') ?>';
</script>
<script src="<?= asset('build/js/fincas/index.js') ?>" type="module"></script>