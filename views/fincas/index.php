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

    /* DataTable custom */
    #tablaFincas_wrapper .dataTables_filter input,
    #tablaFincas_wrapper .dataTables_length select {
        background: #2a1f0e !important;
        border: 1px solid var(--ps-cafe) !important;
        color: var(--ps-crema) !important;
        border-radius: 6px;
        padding: .3rem .6rem;
    }

    #tablaFincas_wrapper .dataTables_filter label,
    #tablaFincas_wrapper .dataTables_length label,
    #tablaFincas_wrapper .dataTables_info {
        color: #a08060 !important;
    }

    #tablaFincas_wrapper .dataTables_paginate .paginate_button {
        background: #2a1f0e !important;
        border: 1px solid var(--ps-cafe) !important;
        color: var(--ps-crema) !important;
        border-radius: 6px !important;
        margin: 0 2px;
    }

    #tablaFincas_wrapper .dataTables_paginate .paginate_button.current {
        background: var(--ps-vino) !important;
        border-color: var(--ps-dorado) !important;
        color: var(--ps-dorado) !important;
    }

    #tablaFincas_wrapper .dataTables_paginate .paginate_button:hover {
        background: var(--ps-cafe) !important;
        color: var(--ps-dorado) !important;
    }

    #tablaFincas {
        background: transparent !important;
        color: var(--ps-crema) !important;
        width: 100% !important;
    }

    #tablaFincas thead th {
        background: #2a1f0e !important;
        color: var(--ps-dorado) !important;
        border-bottom: 2px solid var(--ps-cafe) !important;
        font-size: .82rem;
        white-space: nowrap;
    }

    #tablaFincas tbody tr {
        background: rgba(0, 0, 0, .15) !important;
        border-bottom: 1px solid rgba(92, 58, 30, .3) !important;
        transition: background .2s;
    }

    #tablaFincas tbody tr:hover {
        background: rgba(201, 168, 76, .05) !important;
    }

    #tablaFincas tbody td {
        color: var(--ps-crema) !important;
        font-size: .83rem;
        vertical-align: middle;
        border: none !important;
    }

    .tabla-wrap {
        background: linear-gradient(160deg, #2a1f0e, #1c1208);
        border: 1px solid var(--ps-cafe);
        border-radius: 14px;
        padding: 1.25rem;
    }

    /* Botones de funciones */
    .btn-func {
        border: none;
        border-radius: 6px;
        padding: .5rem .5rem;
        font-size: .95rem;
        cursor: pointer;
        transition: all .2s;
        display: inline-flex;
        align-items: center;
        gap: .25rem;
        font-weight: 600;
        margin: .1rem;
    }

    .btn-func.lotes {
        background: rgba(45, 74, 30, .5);
        color: #6fcf5a;
        border: 1px solid #2D4A1E;
    }

    .btn-func.gastos {
        background: rgba(231, 76, 60, .15);
        color: #E74C3C;
        border: 1px solid #5C0A0A;
    }

    .btn-func.prestamos {
        background: rgba(52, 152, 219, .15);
        color: #3498DB;
        border: 1px solid #1a5276;
    }

    .btn-func.editar {
        background: rgba(201, 168, 76, .15);
        color: var(--ps-dorado);
        border: 1px solid var(--ps-cafe);
    }

    .btn-func.eliminar {
        background: rgba(92, 10, 10, .2);
        color: #c0392b;
        border: 1px solid #5C0A0A;
    }

    .btn-func:hover {
        transform: translateY(-1px);
        filter: brightness(1.2);
    }

    .badge-stat {
        display: inline-flex;
        align-items: center;
        gap: .25rem;
        background: rgba(0, 0, 0, .2);
        border: 1px solid rgba(201, 168, 76, .2);
        border-radius: 20px;
        padding: .15rem .5rem;
        font-size: .72rem;
        color: var(--ps-dorado);
        font-weight: 700;
    }

    /* Override Bootstrap en DataTable */
    #tablaFincas tbody tr td {
        background-color: transparent !important;
        border-color: rgba(92, 58, 30, .2) !important;
    }

    #tablaFincas tbody tr {
        background-color: rgba(0, 0, 0, .15) !important;
    }

    #tablaFincas tbody tr:hover td {
        background-color: rgba(201, 168, 76, .05) !important;
    }

    #tablaFincas thead tr th {
        background-color: #2a1f0e !important;
    }

    .dataTables_wrapper {
        color: #a08060 !important;
    }

    .dataTables_wrapper .dataTables_filter input {
        background: #2a1f0e !important;
        border: 1px solid var(--ps-cafe) !important;
        color: var(--ps-crema) !important;
        border-radius: 6px;
    }

    .dataTables_wrapper .dataTables_length select {
        background: #2a1f0e !important;
        border: 1px solid var(--ps-cafe) !important;
        color: var(--ps-crema) !important;
        border-radius: 6px;
    }

    .page-link {
        background-color: #2a1f0e !important;
        border-color: var(--ps-cafe) !important;
        color: var(--ps-dorado) !important;
    }

    .page-item.active .page-link {
        background-color: var(--ps-vino) !important;
        border-color: var(--ps-dorado) !important;
    }

    .swal2-container {
        z-index: 99999 !important;
    }

    #tablaFincas tbody td {
        font-size: 1rem !important;
        padding: .85rem .75rem !important;
    }

    #tablaFincas thead th {
        font-size: 1.05rem !important;
        padding: .75rem !important;
    }

    .badge-stat {
        font-size: 1.05rem !important;
        padding: .3rem .9rem !important;
    }

    #modalVenta .form-control {
        color: #f5edd6 !important;
        -webkit-text-fill-color: #f5edd6 !important;
        background-color: #2a1f0e !important;
    }

    #modalVenta .form-control::placeholder {
        color: #7c6a3a !important;
        -webkit-text-fill-color: #7c6a3a !important;
        opacity: 1 !important;
    }
</style>

<!-- Header -->
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

<!-- Tabla -->
<div class="tabla-wrap">
    <div id="sinFincas" style="display:none;text-align:center;padding:2rem;color:#7c6a3a;">
        <i class="bi bi-tree" style="font-size:2rem;opacity:.3;display:block;margin-bottom:.5rem;"></i>
        No hay fincas registradas
    </div>
    <table id="tablaFincas" class="table" style="width:100%">
        <thead>
            <tr>
                <th>#</th>
                <th>Finca</th>
                <th>Ubicación</th>
                <th>Lotes</th>
                <th>Cabezas</th>
                <th>Gastos</th>
                <th>Funciones</th>
            </tr>
        </thead>
        <tbody id="tablaFincasBody"></tbody>
    </table>
</div>

<script>
    const PROPIETARIO_ID = <?= (int)($propietario_id ?? 0) ?>;
    const PROPIETARIO_NOMBRE = '<?= htmlspecialchars($propietario_nombre ?? '') ?>';
</script>
<script src="<?= asset('build/js/fincas/index.js') ?>" type="module"></script>