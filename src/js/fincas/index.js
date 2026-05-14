import { Toast } from '../funciones';
import Swal from 'sweetalert2';
import { Dropdown } from "bootstrap";


const BASE = document.body.dataset.base ?? '';

// ── LOADER ────────────────────────────────────────────────────────────────────
const mostrarLoader = (msg = 'Procesando...') => {
    const loader = document.getElementById('bhr-loader');
    const msgEl = document.getElementById('loaderMensaje');
    if (msgEl) msgEl.textContent = msg;
    if (loader) loader.classList.add('visible');
};
const ocultarLoader = () => {
    const loader = document.getElementById('bhr-loader');
    if (loader) loader.classList.remove('visible');
};

// ── SUBTITULO ─────────────────────────────────────────────────────────────────
document.getElementById('subtituloPropietario').textContent =
    `Fincas de: ${PROPIETARIO_NOMBRE}`;

// ── FORMATO QUETZALES ─────────────────────────────────────────────────────────
const quetzales = (monto) =>
    'Q ' + parseFloat(monto || 0).toLocaleString('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

// ── RENDER ────────────────────────────────────────────────────────────────────
const renderFincas = (lista) => {
    const grid = document.getElementById('fincasGrid');

    if (!lista.length) {
        grid.innerHTML = `
        <div style="text-align:center;padding:3rem;color:#7c6a3a;grid-column:1/-1;">
            <i class="bi bi-tree" style="font-size:3rem;opacity:.3;display:block;margin-bottom:1rem;"></i>
            <p>No hay fincas registradas para este propietario</p>
        </div>`;
        return;
    }

    grid.innerHTML = lista.map(f => `
        <div class="finca-card">
            <div class="finca-card-nombre">
                <i class="bi bi-tree-fill" style="color:var(--ps-verde);"></i>
                ${f.nombre}
            </div>
            <div class="finca-card-info">
                <i class="bi bi-geo-alt"></i>
                ${f.ubicacion || '<span style="opacity:.5;">Sin ubicación</span>'}
            </div>
            <div class="inversion-badge">
                <i class="bi bi-cash-coin"></i>
                Inversión inicial: ${quetzales(f.inversion_inicial)}
            </div>
            <div class="finca-stats">
                <div class="finca-stat">
                    <div class="finca-stat-valor">${f.total_lotes}</div>
                    <div class="finca-stat-label">Lotes</div>
                </div>
                <div class="finca-stat">
                    <div class="finca-stat-valor">${f.total_cabezas}</div>
                    <div class="finca-stat-label">Cabezas</div>
                </div>
                <div class="finca-stat">
                    <div class="finca-stat-valor">${quetzales(f.total_gastos)}</div>
                    <div class="finca-stat-label">Gastos</div>
                </div>
            </div>
            <div class="finca-acciones">
                <button class="btn-finca" onclick="editarFinca(${f.id})">
                    <i class="bi bi-pencil-square"></i> Editar
                </button>
                <button class="btn-finca lotes" onclick="verLotes(${f.id}, '${f.nombre}')">
                    <i class="bi bi-grid-3x3-gap"></i> Lotes
                </button>
                <button class="btn-finca danger" onclick="eliminarFinca(${f.id}, '${f.nombre}')">
                    <i class="bi bi-trash3"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
};

// ── CARGAR ────────────────────────────────────────────────────────────────────
const cargarFincas = async () => {
    mostrarLoader('Cargando fincas...');
    try {
        const r = await fetch(`${BASE}/API/fincas/listar?propietario_id=${PROPIETARIO_ID}`);
        const d = await r.json();
        if (d.codigo === 1) renderFincas(d.datos);
        else Toast.fire({ icon: 'error', title: 'Error al cargar fincas' });
    } catch (e) {
        console.error(e); // ← agrega esto temporal para ver el error real
        Toast.fire({ icon: 'error', title: 'Error al cargar fincas' });
    } finally {
        ocultarLoader();
    }
};
// ── MODAL CREAR / EDITAR ──────────────────────────────────────────────────────
const mostrarFormFinca = async (datos = null) => {
    const esEdicion = datos !== null;

    const { value: formValues, isConfirmed } = await Swal.fire({
        title: esEdicion ? 'Editar Finca' : 'Nueva Finca',
        html: `
            <style>.swal2-popup input::placeholder { color: #8B6914 !important; opacity: 1; }</style>
            <div style="text-align:left;font-size:.85rem;">
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">
                        Nombre de la finca *
                    </label>
                    <input id="f-nombre" type="text" class="form-control"
                        value="${datos?.nombre || ''}"
                        placeholder="Ej: La Ponderosa"
                        style="margin-top:.3rem;background:#2a1f0e;color:#f5edd6;border:1px solid var(--ps-cafe);">
                </div>
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">
                        Ubicación
                    </label>
                    <input id="f-ubicacion" type="text" class="form-control"
                        value="${datos?.ubicacion || ''}"
                        placeholder="Ej: Cobán, Alta Verapaz"
                        style="margin-top:.3rem;background:#2a1f0e;color:#f5edd6;border:1px solid var(--ps-cafe);">
                </div>
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">
                        Inversión inicial (Q)
                    </label>
                    <input id="f-inversion" type="number" min="0" step="0.01" class="form-control"
                        value="${datos?.inversion_inicial || ''}"
                        placeholder="Ej: 85000.00"
                        style="margin-top:.3rem;background:#2a1f0e;color:#f5edd6;border:1px solid var(--ps-cafe);">
                </div>
            </div>`,
        background: '#1c1208',
        color: '#f5edd6',
        showCancelButton: true,
        confirmButtonText: esEdicion ? 'Guardar cambios' : 'Registrar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#C9A84C',
        cancelButtonColor: '#5C3A1E',
        width: '480px',
        preConfirm: () => {
            const nombre = document.getElementById('f-nombre').value.trim();
            const ubicacion = document.getElementById('f-ubicacion').value.trim();
            const inversion = document.getElementById('f-inversion').value;

            if (!nombre) {
                Swal.showValidationMessage('El nombre de la finca es obligatorio');
                return false;
            }
            return { nombre, ubicacion, inversion_inicial: inversion || 0 };
        }
    });

    if (!isConfirmed || !formValues) return;

    mostrarLoader(esEdicion ? 'Guardando...' : 'Registrando finca...');
    try {
        const body = new FormData();
        Object.entries(formValues).forEach(([k, v]) => body.append(k, v));
        body.append('propietario_id', PROPIETARIO_ID);
        if (esEdicion) body.append('id', datos.id);

        const url = esEdicion
            ? `${BASE}/API/fincas/actualizar`
            : `${BASE}/API/fincas/crear`;

        const r = await fetch(url, { method: 'POST', body });
        const d = await r.json();

        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarFincas();
    } catch {
        Toast.fire({ icon: 'error', title: 'Error de conexión' });
    } finally {
        ocultarLoader();
    }
};

// ── EDITAR ────────────────────────────────────────────────────────────────────
window.editarFinca = async (id) => {
    mostrarLoader('Cargando datos...');
    try {
        const r = await fetch(`${BASE}/API/fincas/listar?propietario_id=${PROPIETARIO_ID}`);
        const d = await r.json();
        const finca = d.datos.find(f => f.id == id);
        ocultarLoader();
        if (finca) mostrarFormFinca(finca);
    } catch {
        ocultarLoader();
        Toast.fire({ icon: 'error', title: 'Error de conexión' });
    }
};

// ── ELIMINAR ──────────────────────────────────────────────────────────────────
window.eliminarFinca = async (id, nombre) => {
    const conf = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar finca?',
        html: `<strong style="color:var(--ps-dorado);">${nombre}</strong> será eliminada.<br>
                <small>No se puede eliminar si tiene lotes registrados.</small>`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#8B0000',
        cancelButtonColor: '#5C3A1E',
        background: '#1c1208',
        color: '#f5edd6'
    });

    if (!conf.isConfirmed) return;

    mostrarLoader('Eliminando...');
    try {
        const body = new FormData();
        body.append('id', id);
        const r = await fetch(`${BASE}/API/fincas/eliminar`, { method: 'POST', body });
        const d = await r.json();
        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarFincas();
    } catch {
        Toast.fire({ icon: 'error', title: 'Error de conexión' });
    } finally {
        ocultarLoader();
    }
};

// ── VER LOTES (siguiente módulo) ──────────────────────────────────────────────
window.verLotes = (id, nombre) => {
    window.location.href = `${BASE}/lotes?finca=${id}&nombre=${encodeURIComponent(nombre)}`;
};


// ── COLORES POR ETAPA ─────────────────────────────────────────────────────────
const etapaColor = {
    'cría': '#4A90D9',
    'desarrollo': '#E8A020',
    'engorde': '#4CAF7D',
    'vendido': '#9B59B6'
};

const etapaIcon = {
    'cría': 'bi-egg',
    'desarrollo': 'bi-arrow-up-circle',
    'engorde': 'bi-graph-up-arrow',
    'vendido': 'bi-cash-coin'
};

// ── MODAL LOTES ───────────────────────────────────────────────────────────────
let FINCA_ACTIVA = null;

window.verLotes = async (fincaId, fincaNombre) => {
    FINCA_ACTIVA = { id: fincaId, nombre: fincaNombre };

    // Crear modal si no existe
    if (!document.getElementById('modalLotes')) {
        const modalHTML = `
        <div id="modalLotes" style="
            display:none;
            position:fixed;
            inset:0;
            background:rgba(0,0,0,.7);
            z-index:9999;
            padding:1rem;
            overflow-y:auto;">
            <div style="
                background:linear-gradient(160deg,#2a1f0e,#1c1208);
                border:1px solid var(--ps-cafe);
                border-top:4px solid var(--ps-dorado);
                border-radius:16px;
                max-width:900px;
                margin:2rem auto;
                padding:1.5rem;">

                <!-- Header modal -->
                <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
                    <div style="
                        background:rgba(201,168,76,.15);
                        border:1px solid rgba(201,168,76,.25);
                        border-radius:10px;
                        width:44px;height:44px;
                        display:flex;align-items:center;justify-content:center;
                        font-size:1.3rem;color:var(--ps-dorado);flex-shrink:0;">
                        <i class="bi bi-tree-fill"></i>
                    </div>
                    <div style="flex:1;">
                        <div id="modalFincaNombre" style="
                            font-size:1.2rem;font-weight:700;
                            color:var(--ps-crema);"></div>
                        <div style="font-size:.8rem;color:#a08060;">
                            Gestión de lotes
                        </div>
                    </div>
                    <button onclick="cerrarModalLotes()" style="
                        background:transparent;
                        border:1px solid var(--ps-cafe);
                        border-radius:8px;
                        color:var(--ps-crema);
                        padding:.4rem .8rem;
                        cursor:pointer;
                        font-size:.85rem;">
                        <i class="bi bi-x-lg"></i> Cerrar
                    </button>
                </div>

                <!-- Tabs -->
                <div style="display:flex;gap:.5rem;margin-bottom:1.5rem;border-bottom:1px solid var(--ps-cafe);padding-bottom:.75rem;">
                    <button class="tab-btn active" data-tab="lotes" onclick="cambiarTab('lotes')">
                        <i class="bi bi-grid-3x3-gap"></i> Lotes
                    </button>
                    <button class="tab-btn" data-tab="gastos" onclick="cambiarTab('gastos')">
                        <i class="bi bi-cash-stack"></i> Gastos
                    </button>
                    <button class="tab-btn" data-tab="bitacora" onclick="cambiarTab('bitacora')">
                        <i class="bi bi-journal-text"></i> Bitácora
                    </button>
                </div>

                <!-- Contenido tabs -->
                <div id="tabLotes">
                    <div style="display:flex;justify-content:flex-end;margin-bottom:1rem;">
                        <button class="btn-nueva-finca" onclick="mostrarFormLote()">
                            <i class="bi bi-plus-circle-fill"></i> Nuevo Lote
                        </button>
                    </div>
                    <div id="lotesGrid" style="
                        display:grid;
                        grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
                        gap:1rem;">
                    </div>
                </div>

                <div id="tabGastos" style="display:none;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem;">
        <div id="resumenCategorias" style="display:flex;gap:.5rem;flex-wrap:wrap;"></div>
        <button class="btn-nueva-finca" onclick="mostrarFormGasto()">
            <i class="bi bi-plus-circle-fill"></i> Nuevo Gasto
        </button>
    </div>
    <div id="totalGastos" style="
        background:rgba(0,0,0,.2);
        border:1px solid rgba(201,168,76,.2);
        border-radius:10px;
        padding:.75rem 1rem;
        margin-bottom:1rem;
        font-size:.85rem;
        color:#a08060;
        display:flex;
        align-items:center;
        gap:.5rem;">
    </div>
    <div id="gastosLista"></div>
</div>

                <div id="tabBitacora" style="display:none;">
                    <p style="color:#a08060;text-align:center;padding:2rem;">
                        <i class="bi bi-journal" style="font-size:2rem;display:block;margin-bottom:.5rem;opacity:.3;"></i>
                        Módulo de bitácora — próximamente
                    </p>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Agregar estilos de tabs
        const style = document.createElement('style');
        style.textContent = `
            .tab-btn {
                background: #2a1f0e;
                border: 1px solid var(--ps-cafe);
                border-radius: 8px;
                color: #a08060;
                padding: .45rem 1rem;
                font-size: .82rem;
                cursor: pointer;
                transition: all .2s;
                display: flex;
                align-items: center;
                gap: .35rem;
            }
            .tab-btn.active {
                background: var(--ps-vino);
                border-color: var(--ps-dorado);
                color: var(--ps-dorado);
                font-weight: 700;
            }
            .tab-btn:hover:not(.active) {
                border-color: var(--ps-dorado);
                color: var(--ps-crema);
            }
            .lote-card {
                background: rgba(0,0,0,.2);
                border: 1px solid var(--ps-cafe);
                border-radius: 12px;
                padding: 1rem;
                transition: all .2s;
            }
            .lote-card:hover {
                border-color: var(--ps-dorado);
                transform: translateY(-2px);
            }
            .lote-etapa-badge {
                display: inline-flex;
                align-items: center;
                gap: .3rem;
                padding: .2rem .65rem;
                border-radius: 20px;
                font-size: .7rem;
                font-weight: 700;
                margin-bottom: .75rem;
            }
            .btn-lote {
                flex: 1;
                background: #2a1f0e;
                border: 1px solid var(--ps-cafe);
                border-radius: 6px;
                color: var(--ps-crema);
                padding: .35rem .4rem;
                font-size: .72rem;
                cursor: pointer;
                transition: all .2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: .25rem;
            }
            .btn-lote:hover { border-color: var(--ps-dorado); color: var(--ps-dorado); }
            .btn-lote.vender { border-color: #4CAF7D; color: #4CAF7D; }
            .btn-lote.vender:hover { background: #4CAF7D; color: #1c1208; }
            .btn-lote.danger { border-color: #5C0A0A; color: #c0392b; }
            .btn-lote.danger:hover { background: #5C0A0A; color: var(--ps-crema); }
        `;
        document.head.appendChild(style);
    }

    document.getElementById('modalFincaNombre').textContent = fincaNombre;
    document.getElementById('modalLotes').style.display = 'block';
    document.body.style.overflow = 'hidden';

    cambiarTab('lotes');
    await cargarLotes();
};

window.cerrarModalLotes = () => {
    document.getElementById('modalLotes').style.display = 'none';
    document.body.style.overflow = '';
    cargarFincas(); // ← agrega esto
};

// ── TABS ──────────────────────────────────────────────────────────────────────
window.cambiarTab = (tab) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    ['lotes', 'gastos', 'bitacora'].forEach(t => {
        document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}`).style.display = 'none';
    });
    document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).style.display = 'block';

    // ← Cargar datos según tab activo
    if (tab === 'gastos') cargarGastos();
    if (tab === 'bitacora') cargarBitacora();
};

// ── CARGAR LOTES ──────────────────────────────────────────────────────────────
const cargarLotes = async () => {
    const grid = document.getElementById('lotesGrid');
    grid.innerHTML = `<div style="text-align:center;padding:2rem;color:#7c6a3a;grid-column:1/-1;">
        <i class="bi bi-hourglass-split" style="font-size:1.5rem;opacity:.3;display:block;margin-bottom:.5rem;"></i>
        Cargando lotes...
    </div>`;

    try {
        const r = await fetch(`${BASE}/API/lotes/listar?finca_id=${FINCA_ACTIVA.id}`);
        const d = await r.json();
        if (d.codigo === 1) renderLotes(d.datos);
    } catch {
        Toast.fire({ icon: 'error', title: 'Error al cargar lotes' });
    }
};

// ── RENDER LOTES ──────────────────────────────────────────────────────────────
const renderLotes = (lista) => {
    const grid = document.getElementById('lotesGrid');

    if (!lista.length) {
        grid.innerHTML = `<div style="text-align:center;padding:2rem;color:#7c6a3a;grid-column:1/-1;">
            <i class="bi bi-grid-3x3-gap" style="font-size:2rem;opacity:.3;display:block;margin-bottom:.5rem;"></i>
            No hay lotes registrados en esta finca
        </div>`;
        return;
    }

    grid.innerHTML = lista.map(l => {
        const color = etapaColor[l.etapa] || '#999';
        const icon = etapaIcon[l.etapa] || 'bi-circle';
        const vendido = l.etapa === 'vendido';

        return `
        <div class="lote-card">
            <div class="lote-etapa-badge" style="background:${color}22;color:${color};border:1px solid ${color}44;">
                <i class="bi ${icon}"></i> ${l.etapa.toUpperCase()}
            </div>
            <div style="font-size:1rem;font-weight:700;color:var(--ps-crema);margin-bottom:.5rem;">
                ${l.nombre}
            </div>
            <div style="font-size:.8rem;color:#a08060;margin-bottom:.3rem;">
                <i class="bi bi-cow" style="color:var(--ps-dorado);"></i>
                ${l.cantidad_actual} / ${l.cantidad_cabezas} cabezas
            </div>
            <div style="font-size:.8rem;color:#a08060;margin-bottom:.3rem;">
                <i class="bi bi-calendar" style="color:var(--ps-dorado);"></i>
                Ingreso: ${l.fecha_ingreso ?? '—'}
            </div>
            <div style="font-size:.8rem;color:#a08060;margin-bottom:.75rem;">
                <i class="bi bi-cash" style="color:var(--ps-dorado);"></i>
                Gastos: ${quetzales(l.total_gastos)}
            </div>
            ${vendido ? `
            <div style="font-size:.8rem;color:#4CAF7D;margin-bottom:.75rem;font-weight:700;">
                <i class="bi bi-check-circle-fill"></i>
                Vendido: ${quetzales(l.precio_venta_total)}
            </div>` : ''}
            <div style="display:flex;gap:.35rem;flex-wrap:wrap;">
                <button class="btn-lote" onclick="editarLote(${l.id})">
                    <i class="bi bi-pencil-square"></i> Editar
                </button>
                ${!vendido ? `
                <button class="btn-lote vender" onclick="venderLote(${l.id}, '${l.nombre}')">
                    <i class="bi bi-cash-coin"></i> Vender
                </button>` : ''}
                <button class="btn-lote danger" onclick="eliminarLote(${l.id}, '${l.nombre}')">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
        </div>`;
    }).join('');
};

// ── FORM LOTE ─────────────────────────────────────────────────────────────────
window.mostrarFormLote = async (datos = null) => {
    const esEdicion = datos !== null;

    const { value: formValues, isConfirmed } = await Swal.fire({
        title: esEdicion ? 'Editar Lote' : 'Nuevo Lote',
        zIndex: 99999,
        didOpen: () => {
            document.querySelector('.swal2-container').style.zIndex = '99999';
        },
        html: `
            <style>.swal2-popup input,.swal2-popup select,.swal2-popup textarea { color:#f5edd6!important; }
            .swal2-popup input::placeholder,.swal2-popup textarea::placeholder { color:#8B6914!important;opacity:1; }
            </style>
            <div style="text-align:left;font-size:.85rem;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem;">
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Nombre *</label>
                        <input id="l-nombre" type="text" class="form-control"
                            value="${datos?.nombre || ''}" placeholder="Ej: Lote A Ene/2024"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                    </div>
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Tipo</label>
                        <select id="l-tipo" class="form-select"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                            <option value="bovino"  ${datos?.tipo === 'bovino' ? 'selected' : ''}>Bovino</option>
                            <option value="porcino" ${datos?.tipo === 'porcino' ? 'selected' : ''}>Porcino</option>
                            <option value="ovino"   ${datos?.tipo === 'ovino' ? 'selected' : ''}>Ovino</option>
                            <option value="otro"    ${datos?.tipo === 'otro' ? 'selected' : ''}>Otro</option>
                        </select>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem;">
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Etapa</label>
                        <select id="l-etapa" class="form-select"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                            <option value="cría"      ${datos?.etapa === 'cría' ? 'selected' : ''}>Cría</option>
                            <option value="desarrollo" ${datos?.etapa === 'desarrollo' ? 'selected' : ''}>Desarrollo</option>
                            <option value="engorde"   ${datos?.etapa === 'engorde' ? 'selected' : ''}>Engorde</option>
                        </select>
                    </div>
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Cabezas *</label>
                        <input id="l-cabezas" type="number" min="1" class="form-control"
                            value="${datos?.cantidad_cabezas || ''}" placeholder="Ej: 100"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem;">
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Peso prom. (kg)</label>
                        <input id="l-peso" type="number" min="0" step="0.1" class="form-control"
                            value="${datos?.peso_promedio_kg || ''}" placeholder="Ej: 180"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                    </div>
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Fecha ingreso *</label>
                        <input id="l-fecha" type="date" class="form-control"
                            value="${datos?.fecha_ingreso || ''}"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                    </div>
                </div>
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Observaciones</label>
                    <textarea id="l-obs" class="form-control" rows="2"
                        placeholder="Notas adicionales..."
                        style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);resize:none;"
                        >${datos?.observaciones || ''}</textarea>
                </div>
            </div>`,
        background: '#1c1208',
        color: '#f5edd6',
        showCancelButton: true,
        confirmButtonText: esEdicion ? 'Guardar' : 'Registrar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#C9A84C',
        cancelButtonColor: '#5C3A1E',
        width: '560px',
        preConfirm: () => {
            const nombre = document.getElementById('l-nombre').value.trim();
            const cabezas = document.getElementById('l-cabezas').value;
            const fecha = document.getElementById('l-fecha').value;

            if (!nombre) {
                Swal.showValidationMessage('El nombre es obligatorio');
                return false;
            }
            if (!cabezas || cabezas <= 0) {
                Swal.showValidationMessage('Las cabezas son obligatorias');
                return false;
            }
            if (!fecha) {
                Swal.showValidationMessage('La fecha de ingreso es obligatoria');
                return false;
            }
            return {
                nombre,
                tipo: document.getElementById('l-tipo').value,
                etapa: document.getElementById('l-etapa').value,
                cantidad_cabezas: cabezas,
                peso_promedio_kg: document.getElementById('l-peso').value || null,
                fecha_ingreso: fecha,
                observaciones: document.getElementById('l-obs').value.trim()
            };
        }
    });

    if (!isConfirmed || !formValues) return;

    try {
        const body = new FormData();
        Object.entries(formValues).forEach(([k, v]) => { if (v !== null) body.append(k, v); });
        body.append('finca_id', FINCA_ACTIVA.id);
        if (esEdicion) body.append('id', datos.id);

        const url = esEdicion
            ? `${BASE}/API/lotes/actualizar`
            : `${BASE}/API/lotes/crear`;

        const r = await fetch(url, { method: 'POST', body });
        const d = await r.json();

        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarLotes();
    } catch {
        Toast.fire({ icon: 'error', title: 'Error de conexión' });
    }
};

// ── EDITAR LOTE ───────────────────────────────────────────────────────────────
window.editarLote = async (id) => {
    try {
        const r = await fetch(`${BASE}/API/lotes/listar?finca_id=${FINCA_ACTIVA.id}`);
        const d = await r.json();
        const lote = d.datos.find(l => l.id == id);
        if (lote) mostrarFormLote(lote);
    } catch (e) {
        console.error('Error completo:', e);
        // Ver respuesta cruda
        Toast.fire({ icon: 'error', title: e.message });
    }
};

// ── VENDER LOTE ───────────────────────────────────────────────────────────────
window.venderLote = async (id, nombre) => {
    const { value: formValues, isConfirmed } = await Swal.fire({
        title: '💰 Vender Lote',
        html: `
            <div style="text-align:left;font-size:.85rem;">
                <p style="color:#a08060;margin-bottom:1rem;">
                    Lote: <strong style="color:var(--ps-dorado);">${nombre}</strong>
                </p>
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Precio total de venta (Q) *</label>
                    <input id="v-precio" type="number" min="0" step="0.01" class="form-control"
                        placeholder="Ej: 95000.00"
                        style="margin-top:.3rem;background:#2a1f0e;color:#f5edd6;border:1px solid var(--ps-cafe);">
                </div>
                <div>
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Fecha de venta *</label>
                    <input id="v-fecha" type="date" class="form-control"
                        value="${new Date().toISOString().split('T')[0]}"
                        style="margin-top:.3rem;background:#2a1f0e;color:#f5edd6;border:1px solid var(--ps-cafe);">
                </div>
            </div>`,
        background: '#1c1208',
        color: '#f5edd6',
        showCancelButton: true,
        confirmButtonText: 'Confirmar venta',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#4CAF7D',
        cancelButtonColor: '#5C3A1E',
        width: '420px',
        preConfirm: () => {
            const precio = document.getElementById('v-precio').value;
            const fecha = document.getElementById('v-fecha').value;
            if (!precio || !fecha) {
                Swal.showValidationMessage('Precio y fecha son obligatorios');
                return false;
            }
            return { precio_venta_total: precio, fecha_venta: fecha };
        }
    });

    if (!isConfirmed || !formValues) return;

    try {
        const body = new FormData();
        body.append('id', id);
        Object.entries(formValues).forEach(([k, v]) => body.append(k, v));
        const r = await fetch(`${BASE}/API/lotes/vender`, { method: 'POST', body });
        const d = await r.json();
        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarLotes();
    } catch {
        Toast.fire({ icon: 'error', title: 'Error de conexión' });
    }
};

// ── ELIMINAR LOTE ─────────────────────────────────────────────────────────────
window.eliminarLote = async (id, nombre) => {
    const conf = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar lote?',
        html: `<strong style="color:var(--ps-dorado);">${nombre}</strong> será eliminado.`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#8B0000',
        cancelButtonColor: '#5C3A1E',
        background: '#1c1208',
        color: '#f5edd6'
    });

    if (!conf.isConfirmed) return;

    try {
        const body = new FormData();
        body.append('id', id);
        const r = await fetch(`${BASE}/API/lotes/eliminar`, { method: 'POST', body });
        const d = await r.json();
        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarLotes();
    } catch {
        Toast.fire({ icon: 'error', title: 'Error de conexión' });
    }
};

// ── ICONOS Y COLORES CATEGORIAS ───────────────────────────────────────────────
const categoriaInfo = {
    'medicina': { icon: 'bi-heart-pulse', color: '#E74C3C', label: 'Medicina' },
    'alimentacion': { icon: 'bi-bag-fill', color: '#E8A020', label: 'Alimentación' },
    'transporte': { icon: 'bi-truck', color: '#3498DB', label: 'Transporte' },
    'mano_obra': { icon: 'bi-person-fill', color: '#9B59B6', label: 'Mano de obra' },
    'infraestructura': { icon: 'bi-building', color: '#1ABC9C', label: 'Infraestructura' },
    'otro': { icon: 'bi-three-dots', color: '#95A5A6', label: 'Otro' }
};

// ── CARGAR GASTOS ─────────────────────────────────────────────────────────────
const cargarGastos = async () => {
    document.getElementById('gastosLista').innerHTML = `
        <div style="text-align:center;padding:2rem;color:#7c6a3a;">
            <i class="bi bi-hourglass-split" style="font-size:1.5rem;opacity:.3;display:block;margin-bottom:.5rem;"></i>
            Cargando gastos...
        </div>`;

    try {
        const r = await fetch(`${BASE}/API/gastos/listar?finca_id=${FINCA_ACTIVA.id}`);
        const d = await r.json();
        if (d.codigo === 1) renderGastos(d.datos, d.categorias, d.total);
    } catch (e) {
        Toast.fire({ icon: 'error', title: 'Error al cargar gastos' });
    }
};

// ── RENDER GASTOS ─────────────────────────────────────────────────────────────
const renderGastos = (lista, categorias, total) => {

    // Total general
    document.getElementById('totalGastos').innerHTML = `
        <i class="bi bi-cash-stack" style="color:var(--ps-dorado);font-size:1.2rem;"></i>
        <span>Total gastos de la finca:</span>
        <strong style="color:var(--ps-dorado);font-size:1rem;margin-left:.25rem;">
            ${quetzales(total)}
        </strong>`;

    // Badges por categoría
    document.getElementById('resumenCategorias').innerHTML = categorias.map(c => {
        const info = categoriaInfo[c.categoria] || categoriaInfo['otro'];
        return `
        <div style="
            background:${info.color}22;
            border:1px solid ${info.color}44;
            border-radius:20px;
            padding:.2rem .7rem;
            font-size:.72rem;
            color:${info.color};
            font-weight:700;
            display:flex;
            align-items:center;
            gap:.3rem;">
            <i class="bi ${info.icon}"></i>
            ${info.label}: ${quetzales(c.total_monto)}
        </div>`;
    }).join('');

    // Lista de gastos
    if (!lista.length) {
        document.getElementById('gastosLista').innerHTML = `
            <div style="text-align:center;padding:2rem;color:#7c6a3a;">
                <i class="bi bi-cash-stack" style="font-size:2rem;opacity:.3;display:block;margin-bottom:.5rem;"></i>
                No hay gastos registrados
            </div>`;
        return;
    }

    document.getElementById('gastosLista').innerHTML = `
        <div style="display:flex;flex-direction:column;gap:.5rem;">
            ${lista.map(g => {
        const info = categoriaInfo[g.categoria] || categoriaInfo['otro'];
        return `
                <div style="
                    background:rgba(0,0,0,.2);
                    border:1px solid var(--ps-cafe);
                    border-left:3px solid ${info.color};
                    border-radius:8px;
                    padding:.75rem 1rem;
                    display:flex;
                    align-items:center;
                    gap:1rem;
                    flex-wrap:wrap;">
                    <div style="
                        background:${info.color}22;
                        border-radius:8px;
                        width:36px;height:36px;
                        display:flex;align-items:center;justify-content:center;
                        color:${info.color};font-size:1rem;flex-shrink:0;">
                        <i class="bi ${info.icon}"></i>
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:.85rem;font-weight:600;color:var(--ps-crema);">
                            ${g.descripcion || info.label}
                        </div>
                        <div style="font-size:.75rem;color:#7c6a3a;margin-top:.1rem;">
                            <i class="bi bi-calendar" style="color:var(--ps-dorado);"></i> ${g.fecha}
                            ${g.lote_nombre ? `· <i class="bi bi-grid-3x3-gap" style="color:var(--ps-dorado);"></i> ${g.lote_nombre}` : '· Gasto general'}
                        </div>
                    </div>
                    <div style="font-size:1rem;font-weight:700;color:var(--ps-dorado);flex-shrink:0;">
                        ${quetzales(g.monto)}
                    </div>
                    <button class="btn-lote danger" style="flex:0;padding:.35rem .6rem;"
                        onclick="eliminarGasto(${g.id})">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>`;
    }).join('')}
        </div>`;
};

// ── FORM GASTO ────────────────────────────────────────────────────────────────
window.mostrarFormGasto = async () => {
    // Cargar lotes de la finca para el select
    let lotesOpts = '<option value="">— Gasto general de finca —</option>';
    try {
        const r = await fetch(`${BASE}/API/lotes/listar?finca_id=${FINCA_ACTIVA.id}`);
        const d = await r.json();
        if (d.codigo === 1) {
            lotesOpts += d.datos.map(l =>
                `<option value="${l.id}">${l.nombre}</option>`
            ).join('');
        }
    } catch { }

    const { value: formValues, isConfirmed } = await Swal.fire({
        title: 'Nuevo Gasto',
        html: `
            <style>
                .swal2-popup input,.swal2-popup select,.swal2-popup textarea { color:#f5edd6!important; }
                .swal2-popup input::placeholder,.swal2-popup textarea::placeholder { color:#8B6914!important;opacity:1; }
            </style>
            <div style="text-align:left;font-size:.85rem;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem;">
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Categoría *</label>
                        <select id="g-cat" class="form-select"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                            <option value="medicina">Medicina</option>
                            <option value="alimentacion">Alimentación</option>
                            <option value="transporte">Transporte</option>
                            <option value="mano_obra">Mano de obra</option>
                            <option value="infraestructura">Infraestructura</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Monto (Q) *</label>
                        <input id="g-monto" type="number" min="0" step="0.01" class="form-control"
                            placeholder="Ej: 1500.00"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                    </div>
                </div>
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Lote (opcional)</label>
                    <select id="g-lote" class="form-select"
                        style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                        ${lotesOpts}
                    </select>
                </div>
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Descripción</label>
                    <input id="g-desc" type="text" class="form-control"
                        placeholder="Ej: Desparasitante Lote A"
                        style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                </div>
                <div>
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Fecha *</label>
                    <input id="g-fecha" type="date" class="form-control"
                        value="${new Date().toISOString().split('T')[0]}"
                        style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                </div>
            </div>`,
        background: '#1c1208',
        color: '#f5edd6',
        showCancelButton: true,
        confirmButtonText: 'Registrar gasto',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#C9A84C',
        cancelButtonColor: '#5C3A1E',
        width: '500px',
        preConfirm: () => {
            const monto = document.getElementById('g-monto').value;
            const fecha = document.getElementById('g-fecha').value;

            if (!monto || monto <= 0) {
                Swal.showValidationMessage('El monto es obligatorio');
                return false;
            }
            if (!fecha) {
                Swal.showValidationMessage('La fecha es obligatoria');
                return false;
            }
            return {
                categoria: document.getElementById('g-cat').value,
                monto,
                lote_id: document.getElementById('g-lote').value || '',
                descripcion: document.getElementById('g-desc').value.trim(),
                fecha
            };
        }
    });

    if (!isConfirmed || !formValues) return;

    try {
        const body = new FormData();
        Object.entries(formValues).forEach(([k, v]) => body.append(k, v));
        body.append('finca_id', FINCA_ACTIVA.id);

        const r = await fetch(`${BASE}/API/gastos/crear`, { method: 'POST', body });
        const text = await r.text();
        const d = JSON.parse(text);

        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarGastos();
    } catch (e) {
        console.error(e);
        Toast.fire({ icon: 'error', title: e.message });
    }
};

// ── ELIMINAR GASTO ────────────────────────────────────────────────────────────
window.eliminarGasto = async (id) => {
    const conf = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar gasto?',
        text: 'Esta acción no se puede deshacer.',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#8B0000',
        cancelButtonColor: '#5C3A1E',
        background: '#1c1208',
        color: '#f5edd6'
    });

    if (!conf.isConfirmed) return;

    try {
        const body = new FormData();
        body.append('id', id);
        const r = await fetch(`${BASE}/API/gastos/eliminar`, { method: 'POST', body });
        const d = await r.json();
        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarGastos();
    } catch (e) {
        Toast.fire({ icon: 'error', title: e.message });
    }
};

// ── INIT ──────────────────────────────────────────────────────────────────────
document.getElementById('btnNuevaFinca')
    .addEventListener('click', () => mostrarFormFinca());

cargarFincas();