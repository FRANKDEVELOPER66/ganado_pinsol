import { Dropdown } from "bootstrap";
import { Toast } from '../funciones';
import Swal from 'sweetalert2';

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

const quetzales = (monto) =>
    'Q ' + parseFloat(monto || 0).toLocaleString('es-GT', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
    });

const etapaColor = {
    'cría': '#4A90D9', 'desarrollo': '#E8A020',
    'engorde': '#4CAF7D', 'vendido': '#9B59B6'
};
const etapaIcon = {
    'cría': 'bi-egg', 'desarrollo': 'bi-arrow-up-circle',
    'engorde': 'bi-graph-up-arrow', 'vendido': 'bi-cash-coin'
};
const categoriaInfo = {
    'medicina': { icon: 'bi-heart-pulse', color: '#E74C3C', label: 'Medicina' },
    'sal': { icon: 'bi-droplet-fill', color: '#3498DB', label: 'Sal' },
    'alimentacion': { icon: 'bi-bag-fill', color: '#E8A020', label: 'Alimentación' },
    'transporte': { icon: 'bi-truck', color: '#1ABC9C', label: 'Transporte' },
    'mano_obra': { icon: 'bi-person-fill', color: '#9B59B6', label: 'Mano de obra' },
    'infraestructura': { icon: 'bi-building', color: '#2ECC71', label: 'Infraestructura' },
    'otro': { icon: 'bi-three-dots', color: '#95A5A6', label: 'Otro' }
};

// ── SUBTITULO ─────────────────────────────────────────────────────────────────
document.getElementById('subtituloPropietario').textContent =
    `Fincas de: ${PROPIETARIO_NOMBRE}`;

// ── DATATABLE ─────────────────────────────────────────────────────────────────
let dt = null;

const iniciarDataTable = () => {
    if ($.fn.DataTable.isDataTable('#tablaFincas')) {
        $('#tablaFincas').DataTable().clear().destroy();
    }
    setTimeout(() => {
        dt = $('#tablaFincas').DataTable({
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
            },
            pageLength: 10,
            responsive: true,
            columnDefs: [{ orderable: false, targets: 6 }],
            destroy: true
        });
    }, 50);
};

// ── RENDER FINCAS ─────────────────────────────────────────────────────────────
const renderFincas = (lista) => {
    const tbody = document.getElementById('tablaFincasBody');
    const sinFincas = document.getElementById('sinFincas');
    const tabla = document.getElementById('tablaFincas');

    if (!lista.length) {
        sinFincas.style.display = 'block';
        tabla.style.display = 'none';
        return;
    }

    sinFincas.style.display = 'none';
    tabla.style.display = '';

    tbody.innerHTML = lista.map((f, i) => `
        <tr>
            <td style="color:#7c6a3a;">${i + 1}</td>
            <td>
                <div style="font-weight:700;color:var(--ps-crema);">
                    <i class="bi bi-tree-fill" style="color:var(--ps-verde);margin-right:.3rem;"></i>
                    ${f.nombre}
                </div>
            </td>
            <td style="color:#a08060;">
                <i class="bi bi-geo-alt" style="color:var(--ps-dorado);"></i>
                ${f.ubicacion || '—'}
            </td>
            <td>
                <span class="badge-stat">
                    <i class="bi bi-grid-3x3-gap"></i> ${f.total_lotes}
                </span>
            </td>
            <td>
                <span class="badge-stat">
    <img src="/ganado_pinsol/public/images/toro.png" 
         style="width:35px;height:35px;object-fit:contain;filter:sepia(1) saturate(3) hue-rotate(5deg);">
    ${f.total_cabezas}
</span>
            </td>
            <td>
                <span style="color:#E74C3C;font-weight:700;font-size:1.05rem;">
                    ${quetzales(f.total_gastos)}
                </span>
            </td>
            <td style="text-align:center;">
    <button class="btn-func editar" onclick="editarFinca(${f.id})">
                    <i class="bi bi-pencil-square"></i> Editar
                </button>
                <button class="btn-func lotes" onclick="verLotes(${f.id}, '${f.nombre}')">
                    <i class="bi bi-sliders"></i> Gestionar
                </button>
                <button class="btn-func eliminar" onclick="eliminarFinca(${f.id}, '${f.nombre}')">
                    <i class="bi bi-trash3"></i>
                </button>
            </td>
        </tr>
    `).join('');

    iniciarDataTable();
};

// ── CARGAR FINCAS ─────────────────────────────────────────────────────────────
const cargarFincas = async () => {
    mostrarLoader('Cargando fincas...');
    try {
        const r = await fetch(`${BASE}/API/fincas/listar?propietario_id=${PROPIETARIO_ID}`);
        const d = await r.json();
        if (d.codigo === 1) renderFincas(d.datos);
    } catch (e) {
        Toast.fire({ icon: 'error', title: 'Error al cargar fincas' });
    } finally {
        ocultarLoader();
    }
};

// ── FORM FINCA ────────────────────────────────────────────────────────────────
const mostrarFormFinca = async (datos = null) => {
    const esEdicion = datos !== null;

    const { value: formValues, isConfirmed } = await Swal.fire({
        title: esEdicion ? 'Editar Finca' : 'Nueva Finca',
        html: `
            <style>.swal2-popup input::placeholder { color:#8B6914!important;opacity:1; }</style>
            <div style="text-align:left;font-size:.85rem;">
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Nombre *</label>
                    <input id="f-nombre" type="text" class="form-control"
                        value="${datos?.nombre || ''}" placeholder="Ej: La Ponderosa"
                        style="margin-top:.3rem;background:#2a1f0e;color:#f5edd6;border:1px solid var(--ps-cafe);">
                </div>
                <div>
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Ubicación</label>
                    <input id="f-ubicacion" type="text" class="form-control"
                        value="${datos?.ubicacion || ''}" placeholder="Ej: Cobán, Alta Verapaz"
                        style="margin-top:.3rem;background:#2a1f0e;color:#f5edd6;border:1px solid var(--ps-cafe);">
                </div>
            </div>`,
        background: '#1c1208', color: '#f5edd6',
        showCancelButton: true,
        confirmButtonText: esEdicion ? 'Guardar' : 'Registrar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#C9A84C', cancelButtonColor: '#5C3A1E',
        width: '480px',
        preConfirm: () => {
            const nombre = document.getElementById('f-nombre').value.trim();
            if (!nombre) { Swal.showValidationMessage('El nombre es obligatorio'); return false; }
            return { nombre, ubicacion: document.getElementById('f-ubicacion').value.trim() };
        }
    });

    if (!isConfirmed || !formValues) return;

    mostrarLoader(esEdicion ? 'Guardando...' : 'Registrando...');
    try {
        const body = new FormData();
        Object.entries(formValues).forEach(([k, v]) => body.append(k, v));
        body.append('propietario_id', PROPIETARIO_ID);
        if (esEdicion) body.append('id', datos.id);

        const url = esEdicion ? `${BASE}/API/fincas/actualizar` : `${BASE}/API/fincas/crear`;
        const r = await fetch(url, { method: 'POST', body });
        const d = await r.json();
        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarFincas();
    } catch (e) {
        Toast.fire({ icon: 'error', title: e.message });
    } finally {
        ocultarLoader();
    }
};

window.editarFinca = async (id) => {
    mostrarLoader('Cargando...');
    try {
        const r = await fetch(`${BASE}/API/fincas/listar?propietario_id=${PROPIETARIO_ID}`);
        const d = await r.json();
        const finca = d.datos.find(f => f.id == id);
        ocultarLoader();
        if (finca) mostrarFormFinca(finca);
    } catch (e) { ocultarLoader(); Toast.fire({ icon: 'error', title: e.message }); }
};

window.eliminarFinca = async (id, nombre) => {
    const conf = await Swal.fire({
        icon: 'warning', title: '¿Eliminar finca?',
        html: `<strong style="color:var(--ps-dorado);">${nombre}</strong> será eliminada.<br>
               <small>No se puede eliminar si tiene lotes.</small>`,
        showCancelButton: true, confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar', confirmButtonColor: '#8B0000',
        cancelButtonColor: '#5C3A1E', background: '#1c1208', color: '#f5edd6'
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
    } catch (e) { Toast.fire({ icon: 'error', title: e.message }); }
    finally { ocultarLoader(); }
};

// ── ABRIR TAB DIRECTO ─────────────────────────────────────────────────────────
window.abrirTabFinca = async (fincaId, fincaNombre, tab) => {
    await verLotes(fincaId, fincaNombre);
    cambiarTab(tab);
};

// ── MODAL ─────────────────────────────────────────────────────────────────────
let FINCA_ACTIVA = null;

window.verLotes = async (fincaId, fincaNombre) => {
    FINCA_ACTIVA = { id: fincaId, nombre: fincaNombre };

    if (!document.getElementById('modalLotes')) {
        const modalHTML = `
        <div id="modalLotes" style="
            display:none;position:fixed;inset:0;
            background:rgba(0,0,0,.75);z-index:9999;
            padding:1rem;overflow-y:auto;">
            <div style="
                background:linear-gradient(160deg,#2a1f0e,#1c1208);
                border:1px solid var(--ps-cafe);
                border-top:4px solid var(--ps-dorado);
                border-radius:16px;
                max-width:1100px;margin:2rem auto;padding:1.5rem;">

                <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
                    <div style="
                        background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.25);
                        border-radius:10px;width:44px;height:44px;
                        display:flex;align-items:center;justify-content:center;
                        font-size:1.3rem;color:var(--ps-dorado);flex-shrink:0;">
                        <i class="bi bi-tree-fill"></i>
                    </div>
                    <div style="flex:1;">
                        <div id="modalFincaNombre" style="font-size:1.2rem;font-weight:700;color:var(--ps-crema);"></div>
                        <div style="font-size:.8rem;color:#a08060;">Gestión de lotes</div>
                    </div>
                    <button onclick="cerrarModalLotes()" style="
                        background:transparent;border:1px solid var(--ps-cafe);
                        border-radius:8px;color:var(--ps-crema);
                        padding:.4rem .8rem;cursor:pointer;font-size:.85rem;">
                        <i class="bi bi-x-lg"></i> Cerrar
                    </button>
                </div>

                <div style="display:flex;gap:.5rem;margin-bottom:1.5rem;
                    border-bottom:1px solid var(--ps-cafe);padding-bottom:.75rem;flex-wrap:wrap;">
                    <button class="tab-btn active" data-tab="lotes" onclick="cambiarTab('lotes')">
                        <i class="bi bi-grid-3x3-gap"></i> Lotes
                    </button>
                    <button class="tab-btn" data-tab="prestamos" onclick="cambiarTab('prestamos')">
                        <i class="bi bi-cash-coin"></i> Préstamos
                    </button>
                </div>

                <div id="tabLotes">
                    <div style="display:flex;justify-content:flex-end;margin-bottom:1rem;">
                        <button class="btn-nueva-finca" onclick="mostrarFormLote()">
                            <i class="bi bi-plus-circle-fill"></i> Nuevo Lote
                        </button>
                    </div>
                    <div id="lotesGrid" style="
                        display:grid;
                        grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
                        gap:1rem;"></div>
                </div>

                <div id="tabGastos" style="display:none;">
                    <div style="display:flex;justify-content:space-between;
                        align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem;">
                        <div id="resumenCategorias" style="display:flex;gap:.5rem;flex-wrap:wrap;"></div>
                        <button class="btn-nueva-finca" onclick="mostrarFormGasto()">
                            <i class="bi bi-plus-circle-fill"></i> Nuevo Gasto
                        </button>
                    </div>
                    <div id="totalGastos" style="
                        background:rgba(0,0,0,.2);border:1px solid rgba(201,168,76,.2);
                        border-radius:10px;padding:.75rem 1rem;margin-bottom:1rem;
                        font-size:.85rem;color:#a08060;
                        display:flex;align-items:center;gap:.5rem;"></div>
                    <div id="gastosLista"></div>
                </div>

                <div id="tabPrestamos" style="display:none;">
                    <div style="display:flex;justify-content:flex-end;margin-bottom:1rem;">
                        <button class="btn-nueva-finca" onclick="mostrarFormPrestamo()">
                            <i class="bi bi-plus-circle-fill"></i> Nuevo Préstamo
                        </button>
                    </div>
                    <div id="totalPrestamos" style="
                        background:rgba(0,0,0,.2);border:1px solid rgba(201,168,76,.2);
                        border-radius:10px;padding:.75rem 1rem;margin-bottom:1rem;
                        font-size:.85rem;color:#a08060;
                        display:flex;align-items:center;gap:.5rem;"></div>
                    <div id="prestamosLista"></div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const style = document.createElement('style');
        style.textContent = `
            .swal2-container { z-index:99999!important; }
            .tab-btn {
                background:#2a1f0e;border:1px solid var(--ps-cafe);
                border-radius:8px;color:#a08060;padding:.45rem 1rem;
                font-size:.82rem;cursor:pointer;transition:all .2s;
                display:flex;align-items:center;gap:.35rem;
            }
            .tab-btn.active { background:var(--ps-vino);border-color:var(--ps-dorado);color:var(--ps-dorado);font-weight:700; }
            .tab-btn:hover:not(.active):not(:disabled) { border-color:var(--ps-dorado);color:var(--ps-crema); }
            .lote-card {
                background:rgba(0,0,0,.2);border:1px solid var(--ps-cafe);
                border-radius:12px;padding:1rem;transition:all .2s;
            }
                
            .lote-card:hover { border-color:var(--ps-dorado);transform:translateY(-2px); }
            .lote-etapa-badge {
                display:inline-flex;align-items:center;gap:.3rem;
                padding:.2rem .65rem;border-radius:20px;
                font-size:.7rem;font-weight:700;margin-bottom:.75rem;
            }
            .btn-lote {
                flex:1;background:#2a1f0e;border:1px solid var(--ps-cafe);
                border-radius:6px;color:var(--ps-crema);padding:.35rem .4rem;
                font-size:.72rem;cursor:pointer;transition:all .2s;
                display:flex;align-items:center;justify-content:center;gap:.25rem;
            }
            .btn-lote:hover { border-color:var(--ps-dorado);color:var(--ps-dorado); }
            .btn-lote.vender { border-color:#4CAF7D;color:#4CAF7D; }
            .btn-lote.vender:hover { background:#4CAF7D;color:#1c1208; }
            .btn-lote.danger { border-color:#5C0A0A;color:#c0392b; }
            .btn-lote.danger:hover { background:#5C0A0A;color:var(--ps-crema); }
            .btn-vender-grande {
                width:100%;background:linear-gradient(135deg,#27ae60,#1e8449);
                border:2px solid #4CAF7D;border-radius:10px;
                color:#fff;padding:.7rem;font-size:.9rem;font-weight:700;
                cursor:pointer;transition:all .3s;
                display:flex;align-items:center;justify-content:center;gap:.5rem;
                margin-top:.75rem;
            }
            .btn-vender-grande:hover {
                transform:translateY(-2px);
                box-shadow:0 8px 20px rgba(76,175,125,.4);
            }
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
    // No llamar cargarFincas aquí — solo actualizar silenciosamente
    fetch(`${BASE}/API/fincas/listar?propietario_id=${PROPIETARIO_ID}`)
        .then(r => r.json())
        .then(d => {
            if (d.codigo === 1 && $.fn.DataTable.isDataTable('#tablaFincas')) {
                const tabla = $('#tablaFincas').DataTable();
                tabla.clear();
                d.datos.forEach((f, i) => {
                    tabla.row.add([
                        i + 1,
                        `<div style="font-weight:700;color:var(--ps-crema);">
                            <i class="bi bi-tree-fill" style="color:var(--ps-verde);margin-right:.3rem;"></i>
                            ${f.nombre}
                        </div>`,
                        `<span style="color:#a08060;">
                            <i class="bi bi-geo-alt" style="color:var(--ps-dorado);"></i>
                            ${f.ubicacion || '—'}
                        </span>`,
                        `<span class="badge-stat"><i class="bi bi-grid-3x3-gap"></i> ${f.total_lotes}</span>`,
                        `<span class="badge-stat"><img src="/ganado_pinsol/public/images/toro.png" style="width:35px;height:35px;object-fit:contain;filter:sepia(1) saturate(3) hue-rotate(5deg);"> ${f.total_cabezas}</span>`,
                        `<span style="color:#E74C3C;font-weight:700;font-size:1.05rem;">${quetzales(f.total_gastos)}</span>`,
                        `<div style="text-align:center;">
    <button class="btn-func editar" onclick="editarFinca(${f.id})">
        <i class="bi bi-pencil-square"></i> Editar
    </button>
    <button class="btn-func lotes" onclick="verLotes(${f.id}, '${f.nombre}')">
        <i class="bi bi-sliders"></i> Gestionar
    </button>
    <button class="btn-func eliminar" onclick="eliminarFinca(${f.id}, '${f.nombre}')">
        <i class="bi bi-trash3"></i>
    </button>
</div>`
                    ]);
                });
                tabla.draw();
            }
        })
        .catch(() => { });
};

// ── TABS ──────────────────────────────────────────────────────────────────────
window.cambiarTab = (tab) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`[data-tab="${tab}"]`);
    if (btn && !btn.disabled) btn.classList.add('active');

    ['lotes', 'gastos', 'prestamos', 'liquidacion'].forEach(t => {
        const el = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}`);
        if (el) el.style.display = 'none';
    });
    const tabEl = document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
    if (tabEl) tabEl.style.display = 'block';

    if (tab === 'gastos') cargarGastos();
    if (tab === 'prestamos') cargarPrestamos();
};

// ── LOTES ─────────────────────────────────────────────────────────────────────
const cargarLotes = async () => {
    const grid = document.getElementById('lotesGrid');
    grid.innerHTML = `<div style="text-align:center;padding:2rem;color:#7c6a3a;grid-column:1/-1;">
        <i class="bi bi-hourglass-split" style="font-size:1.5rem;opacity:.3;display:block;margin-bottom:.5rem;"></i>
        Cargando lotes...</div>`;
    try {
        const r = await fetch(`${BASE}/API/lotes/listar?finca_id=${FINCA_ACTIVA.id}`);
        const d = await r.json();
        if (d.codigo === 1) {
            renderLotes(d.datos);
        }
    } catch (e) {
        Toast.fire({ icon: 'error', title: e.message });
    }
};

const renderLotes = (lista) => {
    const grid = document.getElementById('lotesGrid');
    if (!lista.length) {
        grid.innerHTML = `<div style="text-align:center;padding:2rem;color:#7c6a3a;grid-column:1/-1;">
            <i class="bi bi-grid-3x3-gap" style="font-size:2rem;opacity:.3;display:block;margin-bottom:.5rem;"></i>
            No hay lotes registrados</div>`;
        return;
    }

    grid.innerHTML = lista.map(l => {
        const vendido = l.etapa === 'vendido';

        return `
    <div class="lote-card">
        <div style="font-size:1.4rem;font-weight:700;color:var(--ps-crema);margin-bottom:.5rem;">
            ${vendido ? `<i class="bi bi-check-circle-fill" style="color:#4CAF7D;margin-right:.3rem;"></i>` : ''}
            ${l.nombre}
        </div>
        <div style="font-size:1.2rem;color:#a08060;margin-bottom:.3rem;">
            <i class="bi bi-collection" style="color:var(--ps-dorado);"></i>
            ${l.cantidad_actual} / ${l.cantidad_cabezas} cabezas
        </div>
        <div style="font-size:1.2rem;color:#a08060;margin-bottom:.3rem;">
            <i class="bi bi-cash-stack" style="color:var(--ps-dorado);"></i>
            Inversión: ${quetzales(l.inversion_inicial)}
        </div>
        <div style="font-size:1.2rem;color:#a08060;margin-bottom:.3rem;">
            <i class="bi bi-calendar" style="color:var(--ps-dorado);"></i>
            Ingreso: ${l.fecha_ingreso ?? '—'}
        </div>
        <div style="font-size:1.2rem;color:#a08060;margin-bottom:.5rem;">
            <i class="bi bi-cash" style="color:var(--ps-dorado);"></i>
            Gastos: ${quetzales(l.total_gastos)}
        </div>
        ${vendido ? `
        <div style="font-size:1.25rem;color:#4CAF7D;margin-bottom:.5rem;font-weight:700;">
            <i class="bi bi-check-circle-fill"></i>
            Vendido: ${quetzales(l.precio_venta_total)}
        </div>` : ''}
        ${vendido ? `
        <button class="btn-vender-grande" 
            style="background:linear-gradient(135deg,#6a0dad,#4a0080);border-color:#9B59B6;"
            onclick="verLiquidacionLote(${l.id}, '${l.nombre}')">
            <i class="bi bi-calculator"></i> VER LIQUIDACIÓN
        </button>` : `
        <div style="display:flex;gap:.5rem;margin-bottom:.5rem;">
            <button class="btn-lote" onclick="editarLote(${l.id})">
                <i class="bi bi-pencil-square"></i> Editar
            </button>
            <button class="btn-lote" style="border-color:#E8A020;color:#E8A020;"
                onclick="verGastosLote(${l.id}, '${l.nombre}')">
                <i class="bi bi-cash-stack"></i> Gastos
            </button>
            <button class="btn-lote danger" onclick="eliminarLote(${l.id}, '${l.nombre}')">
                <i class="bi bi-trash3"></i>
            </button>
        </div>
        <button class="btn-vender-grande" onclick="iniciarFlujoVenta(${l.id}, '${l.nombre}')">
            <i class="bi bi-currency-dollar"></i> VENDER ESTE LOTE
        </button>`}
    </div>`;
    }).join('');
};


window.verLiquidacionLote = async (loteId, loteNombre) => {
    try {
        const [rLotes, rGastos, rPrest] = await Promise.all([
            fetch(`${BASE}/API/lotes/listar?finca_id=${FINCA_ACTIVA.id}`),
            fetch(`${BASE}/API/gastos/listar?finca_id=${FINCA_ACTIVA.id}`),
            fetch(`${BASE}/API/prestamos/listar?finca_id=${FINCA_ACTIVA.id}`)
        ]);
        const dLotes = await rLotes.json();
        const dGastos = await rGastos.json();
        const dPrest = await rPrest.json();

        const lote = dLotes.datos.find(l => l.id == loteId);
        const gastosLote = dGastos.datos.filter(g => g.lote_id == loteId);
        const prestamosLote = dPrest.datos.filter(p => p.lote_id == loteId || !p.lote_id);

        const inversion = parseFloat(lote.inversion_inicial || 0);
        const totalGastos = gastosLote.reduce((s, g) => s + parseFloat(g.monto), 0);
        const totalPrestamos = prestamosLote.reduce((s, p) => s + parseFloat(p.monto), 0);
        const precioVenta = parseFloat(lote.precio_venta_total || 0);
        const ganancia = precioVenta - inversion - totalGastos;
        const mitad = ganancia / 2;
        const pagoFinca = mitad - totalPrestamos;
        const pagoGanado = inversion + totalGastos + totalPrestamos + mitad;
        const colorNeto = ganancia >= 0 ? '#4CAF7D' : '#E74C3C';

        const gastosPorCat = {};
        gastosLote.forEach(g => {
            if (!gastosPorCat[g.categoria]) gastosPorCat[g.categoria] = 0;
            gastosPorCat[g.categoria] += parseFloat(g.monto);
        });

        await Swal.fire({
            title: `📊 Liquidación — ${loteNombre}`,
            width: '850px',
            background: '#1c1208',
            color: '#f5edd6',
            showConfirmButton: false,
            showCloseButton: true,
            html: `
                <div style="font-size:1rem;">

                    <!-- SUBTÍTULO -->
                    <div style="text-align:center;color:#7c6a3a;font-size:.85rem;margin-bottom:1.25rem;
                        border-bottom:1px solid rgba(201,168,76,.2);padding-bottom:.75rem;">
                        Finca: <strong style="color:var(--ps-dorado);">${FINCA_ACTIVA.nombre}</strong>
                        &nbsp;·&nbsp; Vendido: <strong style="color:var(--ps-dorado);">${lote.fecha_venta}</strong>
                    </div>

                    <!-- CUADRE SUPERIOR -->
                    <div style="background:rgba(0,0,0,.2);border:1px solid rgba(201,168,76,.15);
                        border-radius:10px;padding:1rem;margin-bottom:1.25rem;">

                        <div style="display:flex;justify-content:space-between;margin-bottom:.5rem;">
                            <span style="color:#a08060;">
                                <i class="bi bi-tag-fill" style="color:#4CAF7D;"></i> Precio de venta:
                            </span>
                            <strong style="color:#4CAF7D;font-size:1rem;">${quetzales(precioVenta)}</strong>
                        </div>

                        <div style="display:flex;justify-content:space-between;margin-bottom:.5rem;">
                            <span style="color:#a08060;">(-) Inversión inicial:</span>
                            <strong style="color:#E74C3C;">- ${quetzales(inversion)}</strong>
                        </div>

                        ${Object.entries(gastosPorCat).map(([cat, monto]) => {
                const info = categoriaInfo[cat] || categoriaInfo['otro'];
                return `<div style="display:flex;justify-content:space-between;margin-bottom:.5rem;">
                                <span style="color:#a08060;padding-left:1rem;">
                                    <i class="bi ${info.icon}" style="color:${info.color};"></i> (-) ${info.label}:
                                </span>
                                <strong style="color:#E74C3C;">- ${quetzales(monto)}</strong>
                            </div>`;
            }).join('')}

                        <div style="border-top:1px solid rgba(201,168,76,.2);margin:.5rem 0;"></div>

                        <div style="display:flex;justify-content:space-between;margin-bottom:.5rem;">
                            <strong style="color:var(--ps-crema);font-size:1.05rem;">
                                <i class="bi bi-calculator"></i> GANANCIA NETA:
                            </strong>
                            <strong style="color:${colorNeto};font-size:1.05rem;">${quetzales(ganancia)}</strong>
                        </div>

                        <div style="background:rgba(201,168,76,.05);border:1px solid rgba(201,168,76,.15);
                            border-radius:8px;padding:.75rem;margin-top:.5rem;">
                            <div style="font-size:.8rem;color:#7c6a3a;font-weight:700;margin-bottom:.4rem;">
                                DIVISIÓN 50 / 50
                            </div>
                            <div style="display:flex;justify-content:space-between;margin-bottom:.3rem;">
                                <span style="color:#a08060;">50% Dueño del ganado:</span>
                                <strong style="color:var(--ps-dorado);">${quetzales(mitad)}</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;">
                                <span style="color:#a08060;">50% Dueño de la finca:</span>
                                <strong style="color:var(--ps-dorado);">${quetzales(mitad)}</strong>
                            </div>
                        </div>

                        ${totalPrestamos > 0 ? `
                        <div style="display:flex;justify-content:space-between;margin-top:.5rem;">
                            <span style="color:#a08060;">
                                <i class="bi bi-dash-circle" style="color:#E74C3C;"></i>
                                (-) Préstamos dueño finca:
                            </span>
                            <strong style="color:#E74C3C;">- ${quetzales(totalPrestamos)}</strong>
                        </div>` : ''}
                    </div>

                    <!-- BLOQUES FINALES -->
                    <div style="display:flex;gap:.75rem;margin-bottom:1rem;">

                        <!-- DUEÑO GANADO -->
                        <div style="flex:1;background:rgba(76,175,125,.1);border:1px solid rgba(76,175,125,.3);
                            border-radius:10px;padding:1rem;text-align:left;">
                            <div style="font-size:.85rem;color:#7c6a3a;font-weight:700;
                                border-bottom:1px solid rgba(76,175,125,.2);padding-bottom:.4rem;margin-bottom:.6rem;">
                                PAGO DUEÑO DEL GANADO
                            </div>
                            <div style="display:flex;justify-content:space-between;margin-bottom:.3rem;">
                                <span style="font-size:.9rem;color:#a08060;">Recuperación inversión:</span>
                                <span style="font-size:.9rem;color:#4CAF7D;font-weight:600;">${quetzales(inversion)}</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;margin-bottom:.3rem;">
                                <span style="font-size:.9rem;color:#a08060;">Recuperación gastos:</span>
                                <span style="font-size:.9rem;color:#4CAF7D;font-weight:600;">${quetzales(totalGastos)}</span>
                            </div>
                            ${totalPrestamos > 0 ? `
                            <div style="display:flex;justify-content:space-between;margin-bottom:.3rem;">
                                <span style="font-size:.9rem;color:#a08060;">Préstamos recuperados:</span>
                                <span style="font-size:.9rem;color:#4CAF7D;font-weight:600;">${quetzales(totalPrestamos)}</span>
                            </div>` : ''}
                            <div style="display:flex;justify-content:space-between;margin-bottom:.6rem;">
                                <span style="font-size:.9rem;color:#a08060;">Ganancia (50%):</span>
                                <span style="font-size:.9rem;color:#4CAF7D;font-weight:600;">${quetzales(mitad)}</span>
                            </div>
                            <div style="border-top:1px solid rgba(76,175,125,.3);padding-top:.5rem;
                                display:flex;justify-content:space-between;align-items:center;">
                                <span style="font-size:1rem;font-weight:700;color:#4CAF7D;">TOTAL:</span>
                                <span style="font-size:1.5rem;font-weight:700;color:#4CAF7D;">${quetzales(pagoGanado)}</span>
                            </div>
                        </div>

                        <!-- DUEÑO FINCA -->
                        <div style="flex:1;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.3);
                            border-radius:10px;padding:1rem;text-align:left;">
                            <div style="font-size:.85rem;color:#7c6a3a;font-weight:700;
                                border-bottom:1px solid rgba(201,168,76,.2);padding-bottom:.4rem;margin-bottom:.6rem;">
                                PAGO DUEÑO DE LA FINCA
                                <span style="color:var(--ps-dorado);margin-left:.3rem;">${PROPIETARIO_NOMBRE}</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;margin-bottom:.3rem;">
                                <span style="font-size:.9rem;color:#a08060;">Ganancia (50%):</span>
                                <span style="font-size:.9rem;color:var(--ps-dorado);font-weight:600;">${quetzales(mitad)}</span>
                            </div>
                            ${totalPrestamos > 0 ? `
                            <div style="display:flex;justify-content:space-between;margin-bottom:.6rem;">
                                <span style="font-size:.9rem;color:#a08060;">(-) Préstamos otorgados:</span>
                                <span style="font-size:.9rem;color:#E74C3C;font-weight:600;">- ${quetzales(totalPrestamos)}</span>
                            </div>` : '<div style="margin-bottom:.6rem;"></div>'}
                            <div style="border-top:1px solid rgba(201,168,76,.3);padding-top:.5rem;
                                display:flex;justify-content:space-between;align-items:center;">
                                <span style="font-size:1rem;font-weight:700;color:var(--ps-dorado);">TOTAL:</span>
                                <span style="font-size:1.5rem;font-weight:700;color:var(--ps-dorado);">${quetzales(pagoFinca)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- BOTÓN IMPRIMIR -->
                    <div style="text-align:center;">
                        <button class="btn-nueva-finca" onclick="imprimirLiquidacion(${lote.id})">
                            <i class="bi bi-printer-fill"></i> Imprimir recibo PDF
                        </button>
                    </div>

                </div>`
        });
    } catch (e) {
        console.error(e);
        Toast.fire({ icon: 'error', title: e.message });
    }
};


// ── GASTOS POR LOTE ───────────────────────────────────────────────────────────
window.verGastosLote = async (loteId, loteNombre) => {
    const cargarYRenderizar = async () => {
        const r = await fetch(`${BASE}/API/gastos/listar?finca_id=${FINCA_ACTIVA.id}`);
        const d = await r.json();
        const gastosLote = d.datos.filter(g => g.lote_id == loteId);
        const total = gastosLote.reduce((s, g) => s + parseFloat(g.monto), 0);

        const lista = !gastosLote.length
            ? `<div style="text-align:center;padding:2rem;color:#7c6a3a;">
                <i class="bi bi-cash-stack" style="font-size:2rem;opacity:.3;display:block;margin-bottom:.5rem;"></i>
                No hay gastos para este lote</div>`
            : `<div style="display:flex;flex-direction:column;gap:.5rem;">
                ${gastosLote.map(g => {
                const info = categoriaInfo[g.categoria] || categoriaInfo['otro'];
                return `<div style="background:rgba(0,0,0,.2);border:1px solid var(--ps-cafe);
                        border-left:3px solid ${info.color};border-radius:8px;
                        padding:.75rem 1rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
                        <div style="background:${info.color}22;border-radius:8px;width:36px;height:36px;
                            display:flex;align-items:center;justify-content:center;
                            color:${info.color};font-size:1rem;flex-shrink:0;">
                            <i class="bi ${info.icon}"></i>
                        </div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:.95rem;font-weight:600;color:var(--ps-crema);">
                                ${g.descripcion || info.label}
                            </div>
                            <div style="font-size:.8rem;color:#7c6a3a;margin-top:.1rem;">
                                <i class="bi bi-calendar" style="color:var(--ps-dorado);"></i> ${g.fecha}
                            </div>
                        </div>
                        <div style="font-size:1rem;font-weight:700;color:var(--ps-dorado);">
                            ${quetzales(g.monto)}
                        </div>
                        <button class="btn-lote danger" style="flex:0;padding:.35rem .6rem;"
                            onclick="eliminarGastoLote(${g.id}, ${loteId}, '${loteNombre}')">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>`;
            }).join('')}
            </div>`;

        const totalHtml = `
            <div style="background:rgba(0,0,0,.2);border:1px solid rgba(201,168,76,.2);
                border-radius:10px;padding:.75rem 1rem;margin-bottom:1rem;
                display:flex;align-items:center;gap:.5rem;">
                <i class="bi bi-cash-stack" style="color:var(--ps-dorado);font-size:1.2rem;"></i>
                <span style="color:#a08060;">Total gastos:</span>
                <strong style="color:var(--ps-dorado);margin-left:.25rem;">${quetzales(total)}</strong>
            </div>`;

        document.getElementById('gastosLoteContenido').innerHTML = totalHtml + lista;
    };

    await Swal.fire({
        title: `💊 Gastos — ${loteNombre}`,
        width: '700px',
        background: '#1c1208',
        color: '#f5edd6',
        showConfirmButton: false,
        showCloseButton: true,
        html: `
            <div style="text-align:right;margin-bottom:1rem;">
                <button class="btn-nueva-finca" onclick="agregarGastoLote(${loteId}, '${loteNombre}')">
                    <i class="bi bi-plus-circle-fill"></i> Nuevo Gasto
                </button>
            </div>
            <div id="gastosLoteContenido">
                <div style="text-align:center;padding:2rem;color:#7c6a3a;">
                    <i class="bi bi-hourglass-split" style="font-size:1.5rem;opacity:.3;display:block;"></i>
                    Cargando...
                </div>
            </div>`,
        didOpen: () => {
            cargarYRenderizar();
        }
    });
};

window.agregarGastoLote = async (loteId, loteNombre) => {
    const { value: formValues, isConfirmed } = await Swal.fire({
        title: `Nuevo Gasto — ${loteNombre}`,
        html: `
            <style>
                .swal2-popup input,.swal2-popup select { color:#f5edd6!important; }
                .swal2-popup input::placeholder { color:#8B6914!important;opacity:1; }
            </style>
            <div style="text-align:left;font-size:.85rem;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem;">
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Categoría *</label>
                        <select id="g-cat" class="form-select"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                            <option value="medicina">Medicina</option>
                            <option value="sal">Sal</option>
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
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Descripción</label>
                    <input id="g-desc" type="text" class="form-control"
                        placeholder="Ej: Desparasitante"
                        style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                </div>
                <div>
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Fecha *</label>
                    <input id="g-fecha" type="date" class="form-control"
                        value="${new Date().toISOString().split('T')[0]}"
                        style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                </div>
            </div>`,
        background: '#1c1208', color: '#f5edd6',
        showCancelButton: true,
        confirmButtonText: 'Registrar gasto',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#C9A84C', cancelButtonColor: '#5C3A1E',
        width: '500px',
        preConfirm: () => {
            const monto = document.getElementById('g-monto').value;
            const fecha = document.getElementById('g-fecha').value;
            if (!monto || monto <= 0) { Swal.showValidationMessage('El monto es obligatorio'); return false; }
            if (!fecha) { Swal.showValidationMessage('La fecha es obligatoria'); return false; }
            return {
                categoria: document.getElementById('g-cat').value,
                monto,
                lote_id: loteId,
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
        const d = await r.json();
        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) {
            await cargarLotes();
            verGastosLote(loteId, loteNombre);
        }
    } catch (e) { Toast.fire({ icon: 'error', title: e.message }); }
};

window.eliminarGastoLote = async (gastoId, loteId, loteNombre) => {
    const conf = await Swal.fire({
        icon: 'warning', title: '¿Eliminar gasto?', text: 'Esta acción no se puede deshacer.',
        showCancelButton: true, confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar', confirmButtonColor: '#8B0000',
        cancelButtonColor: '#5C3A1E', background: '#1c1208', color: '#f5edd6'
    });
    if (!conf.isConfirmed) return;
    try {
        const body = new FormData();
        body.append('id', gastoId);
        const r = await fetch(`${BASE}/API/gastos/eliminar`, { method: 'POST', body });
        const d = await r.json();
        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) {
            await cargarLotes();
            verGastosLote(loteId, loteNombre);
        }
    } catch (e) { Toast.fire({ icon: 'error', title: e.message }); }
};

// ── FLUJO DE VENTA ────────────────────────────────────────────────────────────
window.iniciarFlujoVenta = async (loteId, loteNombre) => {
    try {
        const [rLotes, rGastos, rPrest] = await Promise.all([
            fetch(`${BASE}/API/lotes/listar?finca_id=${FINCA_ACTIVA.id}`),
            fetch(`${BASE}/API/gastos/listar?finca_id=${FINCA_ACTIVA.id}`),
            fetch(`${BASE}/API/prestamos/listar?finca_id=${FINCA_ACTIVA.id}`)
        ]);
        const dLotes = await rLotes.json();
        const dGastos = await rGastos.json();
        const dPrest = await rPrest.json();

        const lote = dLotes.datos.find(l => l.id == loteId);
        const gastosLote = dGastos.datos.filter(g => g.lote_id == loteId);
        const prestamosLote = dPrest.datos.filter(p => p.lote_id == loteId || !p.lote_id);

        const inversion = parseFloat(lote.inversion_inicial || 0);
        const totalGastos = gastosLote.reduce((s, g) => s + parseFloat(g.monto), 0);
        const totalPrestamos = prestamosLote.reduce((s, p) => s + parseFloat(p.monto), 0);

        const gastosPorCat = {};
        gastosLote.forEach(g => {
            if (!gastosPorCat[g.categoria]) gastosPorCat[g.categoria] = 0;
            gastosPorCat[g.categoria] += parseFloat(g.monto);
        });

        const recalcular = (precio) => {
            const p = parseFloat(precio) || 0;
            const ganancia = p - inversion - totalGastos;
            const mitad = ganancia / 2;
            const pagoFinca = mitad - totalPrestamos;
            const pagoGanado = inversion + totalGastos + totalPrestamos + mitad;
            const colorNeto = ganancia >= 0 ? '#4CAF7D' : '#E74C3C';
            return { p, ganancia, mitad, pagoFinca, pagoGanado, colorNeto };
        };

        // ── CREAR MODAL DOM ───────────────────────────────────────────────────
        const modalId = 'modalVenta';
        let modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.remove();

        modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.style.cssText = `
            position:fixed;inset:0;background:rgba(0,0,0,.85);
            z-index:99999;padding:1rem;overflow-y:auto;
            display:flex;align-items:flex-start;justify-content:center;`;

        modalEl.innerHTML = `
            <style>
                #modalVenta input::placeholder { color:#4a3a1a !important; opacity:1; }
                #modalVenta input { color:#f5edd6 !important; -webkit-text-fill-color:#f5edd6 !important; }
            </style>
            <div style="
                background:linear-gradient(160deg,#2a1f0e,#1c1208);
                border:1px solid var(--ps-cafe);
                border-top:4px solid #27ae60;
                border-radius:16px;
                width:100%;max-width:850px;
                margin:2rem auto;padding:2rem;
                color:#f5edd6;">

                <!-- HEADER -->
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;">
                    <div style="font-size:1.4rem;font-weight:700;color:var(--ps-crema);">
                        💰 Vender — ${loteNombre}
                    </div>
                    <button id="btnCerrarVenta" style="
                        background:transparent;border:1px solid var(--ps-cafe);
                        border-radius:8px;color:var(--ps-crema);
                        padding:.4rem .8rem;cursor:pointer;font-size:.85rem;">
                        <i class="bi bi-x-lg"></i> Cancelar
                    </button>
                </div>

                <!-- PRECIO -->
                <div style="margin-bottom:1rem;">
                    <label style="color:var(--ps-dorado);font-size:.95rem;font-weight:600;">
                        Precio total de venta (Q) *
                    </label>
                    <input id="precio-venta-input" type="number" min="0" step="0.01"
    class="form-control" placeholder="Ingresa el precio de venta..."
    style="margin-top:.4rem;background:#2a1f0e;
    border:1px solid var(--ps-dorado);font-size:1.1rem;
    font-weight:700;color:#f5edd6;padding:.6rem;
    -webkit-text-fill-color:#f5edd6;">
                    <div style="font-size:.85rem;color:#7c6a3a;margin-top:.3rem;">
                        El cuadre se actualiza automáticamente al ingresar el precio
                    </div>
                </div>

                <!-- FECHA -->
                <div style="margin-bottom:1rem;">
                    <label style="color:var(--ps-dorado);font-size:.95rem;font-weight:600;">
                        Fecha de venta *
                    </label>
                    <input id="fecha-venta-input" type="date" class="form-control"
                        value="${new Date().toISOString().split('T')[0]}"
                        style="margin-top:.4rem;background:#2a1f0e;
border:1px solid var(--ps-cafe);font-size:1rem;
color:#f5edd6;-webkit-text-fill-color:#f5edd6;
color-scheme:dark;">
                </div>

                <!-- PREVIEW -->
                <div id="liquidacion-preview" style="
                    background:rgba(0,0,0,.3);border:1px solid rgba(201,168,76,.2);
                    border-radius:10px;padding:1rem;font-size:1rem;margin-bottom:1.5rem;">
                    <div style="text-align:center;color:#7c6a3a;padding:.5rem;">
                        <i class="bi bi-calculator" style="font-size:1.5rem;opacity:.3;display:block;"></i>
                        Ingresa el precio para ver el cuadre
                    </div>
                </div>

                <!-- BOTÓN CONFIRMAR -->
                <div style="display:flex;gap:1rem;justify-content:flex-end;">
                    <button id="btnCancelarVenta" style="
                        background:transparent;border:1px solid #5C3A1E;
                        border-radius:10px;color:var(--ps-crema);
                        padding:.7rem 1.5rem;font-size:1rem;cursor:pointer;">
                        Cancelar
                    </button>
                    <button id="btnConfirmarVenta" style="
                        background:linear-gradient(135deg,#27ae60,#1e8449);
                        border:2px solid #4CAF7D;border-radius:10px;
                        color:#fff;padding:.7rem 1.5rem;font-size:1rem;
                        font-weight:700;cursor:pointer;">
                        ✅ Confirmar y cerrar venta
                    </button>
                </div>
            </div>`;

        document.body.appendChild(modalEl);

        // ── CERRAR MODAL ──────────────────────────────────────────────────────
        const cerrarModal = () => {
            modalEl.remove();
        };
        document.getElementById('btnCerrarVenta').addEventListener('click', cerrarModal);
        document.getElementById('btnCancelarVenta').addEventListener('click', cerrarModal);

        // ── ACTUALIZAR PREVIEW ────────────────────────────────────────────────
        const actualizarPreview = () => {
            const precio = document.getElementById('precio-venta-input').value;
            const { p, ganancia, mitad, pagoFinca, pagoGanado, colorNeto } = recalcular(precio);
            const preview = document.getElementById('liquidacion-preview');

            if (!precio) {
                preview.innerHTML = `<div style="text-align:center;color:#7c6a3a;padding:.5rem;">
                    <i class="bi bi-calculator" style="font-size:1.5rem;opacity:.3;display:block;"></i>
                    Ingresa el precio para ver el cuadre</div>`;
                return;
            }

            preview.innerHTML = `
                <div style="font-size:1rem;font-weight:700;color:var(--ps-dorado);
                    margin-bottom:.75rem;border-bottom:1px solid rgba(201,168,76,.2);padding-bottom:.5rem;">
                    CUADRE DE LIQUIDACIÓN
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:.5rem;">
                    <span style="color:#a08060;font-size:1rem;">
                        <i class="bi bi-tag-fill" style="color:#4CAF7D;"></i> Precio venta:
                    </span>
                    <strong style="color:#4CAF7D;font-size:1rem;">${quetzales(p)}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:.5rem;">
                    <span style="color:#a08060;font-size:1rem;">(-) Inversión:</span>
                    <strong style="color:#E74C3C;font-size:1rem;">- ${quetzales(inversion)}</strong>
                </div>
                ${Object.entries(gastosPorCat).map(([cat, monto]) => {
                const info = categoriaInfo[cat] || categoriaInfo['otro'];
                return `<div style="display:flex;justify-content:space-between;margin-bottom:.5rem;">
                        <span style="color:#a08060;padding-left:.75rem;font-size:1rem;">
                            <i class="bi ${info.icon}" style="color:${info.color};"></i> (-) ${info.label}:
                        </span>
                        <strong style="color:#E74C3C;font-size:1rem;">- ${quetzales(monto)}</strong>
                    </div>`;
            }).join('')}
                <div style="border-top:1px solid rgba(201,168,76,.2);margin:.5rem 0;"></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:${ganancia < 0 ? '.5rem' : '1rem'};
    background:rgba(0,0,0,.2);border:1px solid rgba(201,168,76,.2);
    border-radius:8px;padding:.75rem 1rem;">
    <strong style="color:var(--ps-crema);font-size:1.4rem;">GANANCIA NETA:</strong>
    <strong style="color:${colorNeto};font-size:1.4rem;">${quetzales(ganancia)}</strong>
</div>
                ${ganancia < 0 ? `
                <div style="background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.4);
                    border-radius:8px;padding:.75rem 1rem;margin-bottom:1rem;
                    display:flex;align-items:center;gap:.5rem;">
                    <i class="bi bi-exclamation-triangle-fill" style="color:#E74C3C;font-size:1.2rem;"></i>
                    <div>
                        <div style="color:#E74C3C;font-weight:700;font-size:.95rem;"> VENTA A PÉRDIDA</div>
                        <div style="color:#a08060;font-size:.82rem;margin-top:.2rem;">
                            Costo total: <strong style="color:var(--ps-dorado);">${quetzales(inversion + totalGastos)}</strong>
                            · Pérdida: <strong style="color:#E74C3C;">${quetzales(Math.abs(ganancia))}</strong>
                        </div>
                    </div>
                </div>` : ''}
                <div style="display:flex;gap:.75rem;margin-top:.75rem;">
                    <div style="flex:1;background:rgba(76,175,125,.1);border:1px solid rgba(76,175,125,.3);
                        border-radius:10px;padding:1rem;text-align:left;">
                        <div style="font-size:.85rem;color:#7c6a3a;font-weight:700;
                            border-bottom:1px solid rgba(76,175,125,.2);padding-bottom:.4rem;margin-bottom:.6rem;">
                            DUEÑO DEL GANADO
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:.3rem;">
                            <span style="font-size:.9rem;color:#a08060;">Recuperación inversión:</span>
                            <span style="font-size:.9rem;color:#4CAF7D;font-weight:600;">${quetzales(inversion)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:.3rem;">
                            <span style="font-size:.9rem;color:#a08060;">Recuperación gastos:</span>
                            <span style="font-size:.9rem;color:#4CAF7D;font-weight:600;">${quetzales(totalGastos)}</span>
                        </div>
                        ${totalPrestamos > 0 ? `
                        <div style="display:flex;justify-content:space-between;margin-bottom:.3rem;">
                            <span style="font-size:.9rem;color:#a08060;">Préstamos recuperados:</span>
                            <span style="font-size:.9rem;color:#4CAF7D;font-weight:600;">${quetzales(totalPrestamos)}</span>
                        </div>` : ''}
                        <div style="display:flex;justify-content:space-between;margin-bottom:.6rem;">
                            <span style="font-size:.9rem;color:#a08060;">Ganancia (50%):</span>
                            <span style="font-size:.9rem;color:#4CAF7D;font-weight:600;">${quetzales(mitad)}</span>
                        </div>
                        <div style="border-top:1px solid rgba(76,175,125,.3);padding-top:.5rem;
                            display:flex;justify-content:space-between;align-items:center;">
                            <span style="font-size:1rem;font-weight:700;color:#4CAF7D;">TOTAL:</span>
                            <span style="font-size:1.4rem;font-weight:700;color:#4CAF7D;">${quetzales(pagoGanado)}</span>
                        </div>
                    </div>
                    <div style="flex:1;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.3);
                        border-radius:10px;padding:1rem;text-align:left;">
                        <div style="font-size:.85rem;color:#7c6a3a;font-weight:700;
                            border-bottom:1px solid rgba(201,168,76,.2);padding-bottom:.4rem;margin-bottom:.6rem;">
                            DUEÑO DE LA FINCA
                            <span style="color:var(--ps-dorado);margin-left:.3rem;">${PROPIETARIO_NOMBRE}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:.3rem;">
                            <span style="font-size:.9rem;color:#a08060;">Ganancia (50%):</span>
                            <span style="font-size:.9rem;color:var(--ps-dorado);font-weight:600;">${quetzales(mitad)}</span>
                        </div>
                        ${totalPrestamos > 0 ? `
                        <div style="display:flex;justify-content:space-between;margin-bottom:.6rem;">
                            <span style="font-size:.9rem;color:#a08060;">(-) Préstamos otorgados:</span>
                            <span style="font-size:.9rem;color:#E74C3C;font-weight:600;">- ${quetzales(totalPrestamos)}</span>
                        </div>` : '<div style="margin-bottom:.6rem;"></div>'}
                        <div style="border-top:1px solid rgba(201,168,76,.3);padding-top:.5rem;
                            display:flex;justify-content:space-between;align-items:center;">
                            <span style="font-size:1rem;font-weight:700;color:var(--ps-dorado);">TOTAL:</span>
                            <span style="font-size:1.4rem;font-weight:700;color:var(--ps-dorado);">${quetzales(pagoFinca)}</span>
                        </div>
                    </div>
                </div>`;
        };

        document.getElementById('precio-venta-input').addEventListener('input', actualizarPreview);

        // ── CONFIRMAR VENTA ───────────────────────────────────────────────────
        document.getElementById('btnConfirmarVenta').addEventListener('click', async () => {
            const precio = document.getElementById('precio-venta-input').value;
            const fecha = document.getElementById('fecha-venta-input').value;

            if (!precio || precio <= 0) {
                Swal.fire({ icon: 'error', title: 'El precio es obligatorio', background: '#1c1208', color: '#f5edd6' });
                return;
            }
            if (!fecha) {
                Swal.fire({ icon: 'error', title: 'La fecha es obligatoria', background: '#1c1208', color: '#f5edd6' });
                return;
            }

            const costoTotal = inversion + totalGastos;
            if (parseFloat(precio) < costoTotal) {
                const conf = await Swal.fire({
                    icon: 'warning',
                    title: '⚠️ ¡Venta a pérdida!',
                    html: `El precio <strong style="color:#E74C3C;">${quetzales(precio)}</strong> 
                           es menor al costo total de 
                           <strong style="color:var(--ps-dorado);">${quetzales(costoTotal)}</strong>.<br><br>
                           Perderás <strong style="color:#E74C3C;">${quetzales(costoTotal - parseFloat(precio))}</strong>.<br><br>
                           ¿Deseas continuar de todas formas?`,
                    showCancelButton: true,
                    confirmButtonText: 'Sí, registrar pérdida',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#8B0000',
                    cancelButtonColor: '#5C3A1E',
                    background: '#1c1208',
                    color: '#f5edd6'
                });
                if (!conf.isConfirmed) return;
            }

            mostrarLoader('Registrando venta...');
            cerrarModal();
            try {
                const body = new FormData();
                body.append('id', loteId);
                body.append('precio_venta_total', precio);
                body.append('fecha_venta', fecha);

                const r = await fetch(`${BASE}/API/lotes/vender`, { method: 'POST', body });
                const d = await r.json();
                if (d.codigo === 1) {
                    await cargarLotes();
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: '🐄 ¡VENDIDO!',
                        showConfirmButton: false,
                        timer: 2000,
                        background: '#1c1208',
                        color: '#f5edd6',
                        iconColor: '#4CAF7D'
                    });
                } else {
                    Swal.fire({ icon: 'error', title: d.mensaje, background: '#1c1208', color: '#f5edd6' });
                }
            } catch (e) {
                Swal.fire({ icon: 'error', title: e.message, background: '#1c1208', color: '#f5edd6' });
            } finally {
                ocultarLoader();
            }
        });

    } catch (e) {
        console.error(e);
        Toast.fire({ icon: 'error', title: e.message });
    }
};
// ── FORM LOTE ─────────────────────────────────────────────────────────────────
window.mostrarFormLote = async (datos = null) => {
    const esEdicion = datos !== null;

    const { value: formValues, isConfirmed } = await Swal.fire({
        title: esEdicion ? 'Editar Lote' : 'Nuevo Lote',
        html: `
            <style>
                .swal2-popup input,.swal2-popup select,.swal2-popup textarea { color:#f5edd6!important; }
                .swal2-popup input::placeholder,.swal2-popup textarea::placeholder { color:#8B6914!important;opacity:1; }
            </style>
            <div style="text-align:left;font-size:.85rem;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem;">
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Inversión inicial (Q) *</label>
                        <input id="l-inversion" type="number" min="0" step="0.01" class="form-control"
                            value="${datos?.inversion_inicial || ''}" placeholder="Ej: 100000.00"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                    </div>
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Cabezas *</label>
                        <input id="l-cabezas" type="number" min="1" class="form-control"
                            value="${datos?.cantidad_cabezas || ''}" placeholder="Ej: 100"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                    </div>
                </div>
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Nombre *</label>
                    <input id="l-nombre" type="text" class="form-control"
                        value="${datos?.nombre || ''}" placeholder="Ej: Lote A Ene/2024"
                        style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem;">
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
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Peso prom. (kg)</label>
                        <input id="l-peso" type="number" min="0" step="0.1" class="form-control"
                            value="${datos?.peso_promedio_kg || ''}" placeholder="Ej: 180"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                    </div>
                </div>
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Fecha ingreso *</label>
                    <input id="l-fecha" type="date" class="form-control"
                        value="${datos?.fecha_ingreso || ''}"
                        style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                </div>
                <div>
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Observaciones</label>
                    <textarea id="l-obs" class="form-control" rows="2"
                        placeholder="Notas adicionales..."
                        style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);resize:none;"
                        >${datos?.observaciones || ''}</textarea>
                </div>
            </div>`,
        background: '#1c1208', color: '#f5edd6',
        showCancelButton: true,
        confirmButtonText: esEdicion ? 'Guardar' : 'Registrar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#C9A84C', cancelButtonColor: '#5C3A1E',
        width: '560px',
        preConfirm: () => {
            const nombre = document.getElementById('l-nombre').value.trim();
            const cabezas = document.getElementById('l-cabezas').value;
            const fecha = document.getElementById('l-fecha').value;
            const inversion = document.getElementById('l-inversion').value;
            if (!inversion || inversion < 0) { Swal.showValidationMessage('La inversión es obligatoria'); return false; }
            if (!nombre) { Swal.showValidationMessage('El nombre es obligatorio'); return false; }
            if (!cabezas || cabezas <= 0) { Swal.showValidationMessage('Las cabezas son obligatorias'); return false; }
            if (!fecha) { Swal.showValidationMessage('La fecha es obligatoria'); return false; }
            return {
                nombre, tipo: document.getElementById('l-tipo').value,
                cantidad_cabezas: cabezas, inversion_inicial: inversion,
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

        const url = esEdicion ? `${BASE}/API/lotes/actualizar` : `${BASE}/API/lotes/crear`;
        const r = await fetch(url, { method: 'POST', body });
        const text = await r.text();
        console.log('Respuesta:', text); // ← agrega esto
        const d = JSON.parse(text);
        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarLotes();
    } catch (e) {
        Toast.fire({ icon: 'error', title: e.message });
    }
};

window.editarLote = async (id) => {
    try {
        const r = await fetch(`${BASE}/API/lotes/listar?finca_id=${FINCA_ACTIVA.id}`);
        const d = await r.json();
        console.log('Respuesta:', d); // ← agrega esto
        const lote = d.datos.find(l => l.id == id);
        if (lote) mostrarFormLote(lote);
    } catch (e) { Toast.fire({ icon: 'error', title: e.message }); }
};

window.eliminarLote = async (id, nombre) => {
    const conf = await Swal.fire({
        icon: 'warning', title: '¿Eliminar lote?',
        html: `<strong style="color:var(--ps-dorado);">${nombre}</strong> será eliminado.`,
        showCancelButton: true, confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar', confirmButtonColor: '#8B0000',
        cancelButtonColor: '#5C3A1E', background: '#1c1208', color: '#f5edd6'
    });
    if (!conf.isConfirmed) return;
    try {
        const body = new FormData();
        body.append('id', id);
        const r = await fetch(`${BASE}/API/lotes/eliminar`, { method: 'POST', body });
        const d = await r.json();
        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarLotes();
    } catch (e) { Toast.fire({ icon: 'error', title: e.message }); }
};

// ── GASTOS ────────────────────────────────────────────────────────────────────
const cargarGastos = async () => {
    document.getElementById('gastosLista').innerHTML = `
        <div style="text-align:center;padding:2rem;color:#7c6a3a;">
            <i class="bi bi-hourglass-split" style="font-size:1.5rem;opacity:.3;display:block;margin-bottom:.5rem;"></i>
            Cargando gastos...</div>`;
    try {
        const r = await fetch(`${BASE}/API/gastos/listar?finca_id=${FINCA_ACTIVA.id}`);
        const d = await r.json();
        if (d.codigo === 1) renderGastos(d.datos, d.categorias, d.total);
    } catch (e) { Toast.fire({ icon: 'error', title: e.message }); }
};

const renderGastos = (lista, categorias, total) => {
    document.getElementById('totalGastos').innerHTML = `
        <i class="bi bi-cash-stack" style="color:var(--ps-dorado);font-size:1.2rem;"></i>
        <span>Total gastos:</span>
        <strong style="color:var(--ps-dorado);margin-left:.25rem;">${quetzales(total)}</strong>`;

    document.getElementById('resumenCategorias').innerHTML = categorias.map(c => {
        const info = categoriaInfo[c.categoria] || categoriaInfo['otro'];
        return `<div style="background:${info.color}22;border:1px solid ${info.color}44;
            border-radius:20px;padding:.2rem .7rem;font-size:.72rem;
            color:${info.color};font-weight:700;display:flex;align-items:center;gap:.3rem;">
            <i class="bi ${info.icon}"></i> ${info.label}: ${quetzales(c.total_monto)}
        </div>`;
    }).join('');

    if (!lista.length) {
        document.getElementById('gastosLista').innerHTML = `
            <div style="text-align:center;padding:2rem;color:#7c6a3a;">
                <i class="bi bi-cash-stack" style="font-size:2rem;opacity:.3;display:block;margin-bottom:.5rem;"></i>
                No hay gastos registrados</div>`;
        return;
    }

    document.getElementById('gastosLista').innerHTML = `
        <div style="display:flex;flex-direction:column;gap:.5rem;">
        ${lista.map(g => {
        const info = categoriaInfo[g.categoria] || categoriaInfo['otro'];
        return `<div style="background:rgba(0,0,0,.2);border:1px solid var(--ps-cafe);
                border-left:3px solid ${info.color};border-radius:8px;
                padding:.75rem 1rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
                <div style="background:${info.color}22;border-radius:8px;width:36px;height:36px;
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
                        ${g.lote_nombre
                ? `· <i class="bi bi-grid-3x3-gap" style="color:var(--ps-dorado);"></i> ${g.lote_nombre}`
                : '· Gasto general'}
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

window.mostrarFormGasto = async () => {
    let lotesOpts = '<option value="">— Gasto general de finca —</option>';
    try {
        const r = await fetch(`${BASE}/API/lotes/listar?finca_id=${FINCA_ACTIVA.id}`);
        const d = await r.json();
        if (d.codigo === 1) {
            lotesOpts += d.datos.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('');
        }
    } catch { }

    const { value: formValues, isConfirmed } = await Swal.fire({
        title: 'Nuevo Gasto',
        html: `
            <style>
                .swal2-popup input,.swal2-popup select { color:#f5edd6!important; }
                .swal2-popup input::placeholder { color:#8B6914!important;opacity:1; }
            </style>
            <div style="text-align:left;font-size:.85rem;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem;">
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Categoría *</label>
                        <select id="g-cat" class="form-select"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                            <option value="medicina">Medicina</option>
                            <option value="sal">Sal</option>
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
        background: '#1c1208', color: '#f5edd6',
        showCancelButton: true,
        confirmButtonText: 'Registrar gasto', cancelButtonText: 'Cancelar',
        confirmButtonColor: '#C9A84C', cancelButtonColor: '#5C3A1E',
        width: '500px',
        preConfirm: () => {
            const monto = document.getElementById('g-monto').value;
            const fecha = document.getElementById('g-fecha').value;
            if (!monto || monto <= 0) { Swal.showValidationMessage('El monto es obligatorio'); return false; }
            if (!fecha) { Swal.showValidationMessage('La fecha es obligatoria'); return false; }
            return {
                categoria: document.getElementById('g-cat').value,
                monto, lote_id: document.getElementById('g-lote').value || '',
                descripcion: document.getElementById('g-desc').value.trim(), fecha
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
    } catch (e) { Toast.fire({ icon: 'error', title: e.message }); }
};

window.eliminarGasto = async (id) => {
    const conf = await Swal.fire({
        icon: 'warning', title: '¿Eliminar gasto?', text: 'Esta acción no se puede deshacer.',
        showCancelButton: true, confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar', confirmButtonColor: '#8B0000',
        cancelButtonColor: '#5C3A1E', background: '#1c1208', color: '#f5edd6'
    });
    if (!conf.isConfirmed) return;
    try {
        const body = new FormData();
        body.append('id', id);
        const r = await fetch(`${BASE}/API/gastos/eliminar`, { method: 'POST', body });
        const d = await r.json();
        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarGastos();
    } catch (e) { Toast.fire({ icon: 'error', title: e.message }); }
};

// ── PRÉSTAMOS ─────────────────────────────────────────────────────────────────
const cargarPrestamos = async () => {
    document.getElementById('prestamosLista').innerHTML = `
        <div style="text-align:center;padding:2rem;color:#7c6a3a;">
            <i class="bi bi-hourglass-split" style="font-size:1.5rem;opacity:.3;display:block;margin-bottom:.5rem;"></i>
            Cargando préstamos...</div>`;
    try {
        const r = await fetch(`${BASE}/API/prestamos/listar?finca_id=${FINCA_ACTIVA.id}`);
        const d = await r.json();
        if (d.codigo === 1) renderPrestamos(d.datos, d.total);
    } catch (e) { Toast.fire({ icon: 'error', title: e.message }); }
};

const renderPrestamos = (lista, total) => {
    document.getElementById('totalPrestamos').innerHTML = `
        <i class="bi bi-cash-coin" style="color:#E74C3C;font-size:1.2rem;"></i>
        <span>Total préstamos:</span>
        <strong style="color:#E74C3C;margin-left:.25rem;">${quetzales(total)}</strong>`;

    if (!lista.length) {
        console.log('Préstamos:', lista);
        document.getElementById('prestamosLista').innerHTML = `
            <div style="text-align:center;padding:2rem;color:#7c6a3a;">
                <i class="bi bi-cash-coin" style="font-size:2rem;opacity:.3;display:block;margin-bottom:.5rem;"></i>
                No hay préstamos registrados</div>`;
        return;
    }

    console.log('Préstamos:', lista);

    document.getElementById('prestamosLista').innerHTML = `
        <div style="display:flex;flex-direction:column;gap:.5rem;">
        ${lista.map(p => `
        <div style="background:rgba(0,0,0,.2);border:1px solid var(--ps-cafe);
            border-left:3px solid #E74C3C;border-radius:8px;
            padding:.75rem 1rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
            <div style="background:rgba(231,76,60,.15);border-radius:8px;width:36px;height:36px;
                display:flex;align-items:center;justify-content:center;
                color:#E74C3C;font-size:1rem;flex-shrink:0;">
                <i class="bi bi-cash-coin"></i>
            </div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:.5rem;">
    <div style="font-size:.85rem;font-weight:600;color:var(--ps-crema);">${p.propietario_nombre}</div>
    ${p.lote_etapa === 'vendido' ? `
    <span style="background:rgba(76,175,125,.2);border:1px solid #4CAF7D;
        border-radius:20px;padding:.1rem .5rem;font-size:.7rem;
        color:#4CAF7D;font-weight:700;">
        ✓ SALDADO
    </span>` : ''}
</div>
<div style="font-size:.75rem;color:#7c6a3a;">${p.descripcion || 'Sin descripción'}</div>
                <div style="font-size:.75rem;color:#7c6a3a;">
                    <i class="bi bi-calendar" style="color:var(--ps-dorado);"></i> ${p.fecha}
                    ${p.lote_nombre ? `· <i class="bi bi-grid-3x3-gap" style="color:var(--ps-dorado);"></i> ${p.lote_nombre}` : ''}
                </div>
            </div>
            <div style="font-size:1rem;font-weight:700;color:#E74C3C;">${quetzales(p.monto)}</div>
            <button class="btn-lote danger" style="flex:0;padding:.35rem .6rem;"
                onclick="eliminarPrestamo(${p.id})">
                <i class="bi bi-trash3"></i>
            </button>
        </div>`).join('')}
        </div>`;
};

window.mostrarFormPrestamo = async () => {
    let lotesOpts = '<option value="">— Sin lote específico —</option>';
    try {
        const r = await fetch(`${BASE}/API/lotes/listar?finca_id=${FINCA_ACTIVA.id}`);
        const d = await r.json();
        if (d.codigo === 1) {
            lotesOpts += d.datos
                .filter(l => l.etapa !== 'vendido')
                .map(l => `<option value="${l.id}">${l.nombre}</option>`).join('');
        }
    } catch { }

    const { value: formValues, isConfirmed } = await Swal.fire({
        title: 'Nuevo Préstamo',
        html: `
            <style>
                .swal2-popup input,.swal2-popup select { color:#f5edd6!important; }
                .swal2-popup input::placeholder { color:#8B6914!important;opacity:1; }
            </style>
            <div style="text-align:left;font-size:.85rem;">
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Nombre del propietario *</label>
                    <input id="p-nombre" type="text" class="form-control"
                        value="${PROPIETARIO_NOMBRE}" readonly
                        style="margin-top:.3rem;background:#1a1208;color:#a08060;
                        border:1px solid var(--ps-cafe);cursor:not-allowed;">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem;">
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Monto (Q) *</label>
                        <input id="p-monto" type="number" min="0" step="0.01" class="form-control"
                            placeholder="Ej: 10000.00"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                    </div>
                    <div>
                        <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Fecha *</label>
                        <input id="p-fecha" type="date" class="form-control"
                            value="${new Date().toISOString().split('T')[0]}"
                            style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                    </div>
                </div>
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Lote relacionado (opcional)</label>
                    <select id="p-lote" class="form-select"
                        style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                        ${lotesOpts}
                    </select>
                </div>
                <div>
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">Descripción</label>
                    <input id="p-desc" type="text" class="form-control"
                        placeholder="Ej: Adelanto para gastos personales"
                        style="margin-top:.3rem;background:#2a1f0e;border:1px solid var(--ps-cafe);">
                </div>
            </div>`,
        background: '#1c1208', color: '#f5edd6',
        showCancelButton: true,
        confirmButtonText: 'Registrar préstamo', cancelButtonText: 'Cancelar',
        confirmButtonColor: '#C9A84C', cancelButtonColor: '#5C3A1E',
        width: '500px',
        preConfirm: () => {
            const monto = document.getElementById('p-monto').value;
            const fecha = document.getElementById('p-fecha').value;
            if (!monto || monto <= 0) { Swal.showValidationMessage('El monto es obligatorio'); return false; }
            if (!fecha) { Swal.showValidationMessage('La fecha es obligatoria'); return false; }
            return {
                propietario_nombre: PROPIETARIO_NOMBRE, monto, fecha,
                lote_id: document.getElementById('p-lote').value || '',
                descripcion: document.getElementById('p-desc').value.trim()
            };
        }
    });

    if (!isConfirmed || !formValues) return;
    try {
        const body = new FormData();
        Object.entries(formValues).forEach(([k, v]) => body.append(k, v));
        body.append('finca_id', FINCA_ACTIVA.id);
        const r = await fetch(`${BASE}/API/prestamos/crear`, { method: 'POST', body });
        const text = await r.text();
        const d = JSON.parse(text);
        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarPrestamos();
    } catch (e) { Toast.fire({ icon: 'error', title: e.message }); }
};

window.eliminarPrestamo = async (id) => {
    const conf = await Swal.fire({
        icon: 'warning', title: '¿Eliminar préstamo?', text: 'Esta acción no se puede deshacer.',
        showCancelButton: true, confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar', confirmButtonColor: '#8B0000',
        cancelButtonColor: '#5C3A1E', background: '#1c1208', color: '#f5edd6'
    });
    if (!conf.isConfirmed) return;
    try {
        const body = new FormData();
        body.append('id', id);
        const r = await fetch(`${BASE}/API/prestamos/eliminar`, { method: 'POST', body });
        const d = await r.json();
        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarPrestamos();
    } catch (e) { Toast.fire({ icon: 'error', title: e.message }); }
};

// ── INIT ──────────────────────────────────────────────────────────────────────
document.getElementById('subtituloPropietario').textContent = `Fincas de: ${PROPIETARIO_NOMBRE}`;
document.getElementById('btnNuevaFinca').addEventListener('click', () => mostrarFormFinca());
cargarFincas();