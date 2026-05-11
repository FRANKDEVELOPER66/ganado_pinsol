import { Toast } from '../funciones';
import Swal from 'sweetalert2';

const BASE = '/ganado_pinsol';

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

// ── RENDER CARDS ──────────────────────────────────────────────────────────────
const renderPropietarios = (lista) => {
    const grid = document.getElementById('propietariosGrid');

    if (!lista.length) {
        grid.innerHTML = `
        <div style="text-align:center;padding:3rem;color:#7c6a3a;grid-column:1/-1;">
            <i class="bi bi-person-x" style="font-size:3rem;opacity:.3;display:block;margin-bottom:1rem;"></i>
            <p>No hay propietarios registrados</p>
        </div>`;
        return;
    }

    grid.innerHTML = lista.map(p => `
        <div class="card-pinsol">
            <div class="card-title">
                <i class="bi bi-person-fill"></i> ${p.nombre}
            </div>
            <div style="font-size:.88rem;margin-bottom:.5rem;">
                <i class="bi bi-telephone" style="color:var(--ps-dorado);"></i>
                ${p.telefono || '<span style="opacity:.5;">Sin teléfono</span>'}
            </div>
            <div style="font-size:.88rem;margin-bottom:1rem;">
                <i class="bi bi-geo-alt" style="color:var(--ps-dorado);"></i>
                ${p.direccion || '<span style="opacity:.5;">Sin dirección</span>'}
            </div>
            <div style="font-size:.82rem;margin-bottom:1rem;">
                <span style="
                    background:var(--ps-verde);
                    color:var(--ps-dorado);
                    padding:.2rem .7rem;
                    border-radius:20px;
                    font-weight:600;">
                    <i class="bi bi-tree-fill"></i>
                    ${p.total_fincas} finca${p.total_fincas != 1 ? 's' : ''}
                </span>
            </div>
            <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
                <button class="btn-prop" onclick="editarPropietario(${p.id})">
    <i class="bi bi-pencil-square"></i> Editar
</button>
<button class="btn-prop fincas" onclick="verFincas(${p.id}, '${p.nombre}')">
    <i class="bi bi-tree"></i> Fincas
</button>
<button class="btn-prop danger" onclick="eliminarPropietario(${p.id}, '${p.nombre}')">
    <i class="bi bi-trash3"></i> Eliminar
</button>
            </div>
        </div>
    `).join('');
};

// ── CARGAR ────────────────────────────────────────────────────────────────────
const cargarPropietarios = async () => {
    mostrarLoader('Cargando propietarios...');
    try {
        const r = await fetch(`${BASE}/API/propietarios/listar`);
        const d = await r.json();
        if (d.codigo === 1) renderPropietarios(d.datos);
    } catch {
        Toast.fire({ icon: 'error', title: 'Error al cargar propietarios' });
    } finally {
        ocultarLoader();
    }
};

// ── MODAL CREAR / EDITAR ──────────────────────────────────────────────────────
const mostrarFormPropietario = async (datos = null) => {
    const esEdicion = datos !== null;

    const { value: formValues, isConfirmed } = await Swal.fire({
        title: esEdicion ? 'Editar Propietario' : 'Nuevo Propietario',
        html: `
            <div style="text-align:left;font-size:.85rem;">
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">
                        Nombre completo *
                    </label>
                    <input id="f-nombre" type="text" class="form-control"
                        value="${datos?.nombre || ''}"
                        placeholder="Ej: Carlos Pineda Solares"
                        style="margin-top:.3rem;background:#2a1f0e;color:#f5edd6;
                               border:1px solid var(--ps-cafe);">
                </div>
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">
                        Teléfono
                    </label>
                    <input id="f-telefono" type="text" class="form-control"
                        value="${datos?.telefono || ''}"
                        placeholder="Ej: 5555-1234"
                        style="margin-top:.3rem;background:#2a1f0e;color:#f5edd6;
                               border:1px solid var(--ps-cafe);">
                </div>
                <div style="margin-bottom:.75rem;">
                    <label style="color:var(--ps-dorado);font-size:.75rem;font-weight:600;">
                        Dirección
                    </label>
                    <input id="f-direccion" type="text" class="form-control"
                        value="${datos?.direccion || ''}"
                        placeholder="Ej: Cobán, Alta Verapaz"
                        style="margin-top:.3rem;background:#2a1f0e;color:#f5edd6;
                               border:1px solid var(--ps-cafe);">
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
            const telefono = document.getElementById('f-telefono').value.trim();
            const direccion = document.getElementById('f-direccion').value.trim();

            if (!nombre) {
                Swal.showValidationMessage('El nombre es obligatorio');
                return false;
            }
            return { nombre, telefono, direccion };
        }
    });

    if (!isConfirmed || !formValues) return;

    mostrarLoader(esEdicion ? 'Guardando cambios...' : 'Registrando propietario...');
    try {
        const body = new FormData();
        Object.entries(formValues).forEach(([k, v]) => body.append(k, v));
        if (esEdicion) body.append('id', datos.id);

        const url = esEdicion
            ? `${BASE}/API/propietarios/actualizar`
            : `${BASE}/API/propietarios/crear`;

        const r = await fetch(url, { method: 'POST', body });
        const d = await r.json();

        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarPropietarios();

    } catch {
        Toast.fire({ icon: 'error', title: 'Error de conexión' });
    } finally {
        ocultarLoader();
    }
};

// ── EDITAR ────────────────────────────────────────────────────────────────────
window.editarPropietario = async (id) => {
    mostrarLoader('Cargando datos...');
    try {
        const r = await fetch(`${BASE}/API/propietarios/listar`);
        const d = await r.json();
        const prop = d.datos.find(p => p.id == id);
        ocultarLoader();
        if (prop) mostrarFormPropietario(prop);
    } catch {
        ocultarLoader();
        Toast.fire({ icon: 'error', title: 'Error de conexión' });
    }
};

// ── ELIMINAR ──────────────────────────────────────────────────────────────────
window.eliminarPropietario = async (id, nombre) => {
    const conf = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar propietario?',
        html: `<strong style="color:var(--ps-dorado);">${nombre}</strong> será eliminado.<br>
                <small>No se puede eliminar si tiene fincas registradas.</small>`,
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
        const r = await fetch(`${BASE}/API/propietarios/eliminar`, { method: 'POST', body });
        const d = await r.json();
        Toast.fire({ icon: d.codigo === 1 ? 'success' : 'error', title: d.mensaje });
        if (d.codigo === 1) cargarPropietarios();
    } catch {
        Toast.fire({ icon: 'error', title: 'Error de conexión' });
    } finally {
        ocultarLoader();
    }
};

// ── VER FINCAS (placeholder para siguiente módulo) ────────────────────────────
window.verFincas = (id, nombre) => {
    window.location.href = `${BASE}/fincas?propietario=${id}&nombre=${encodeURIComponent(nombre)}`;
};

// ── BUSCAR ────────────────────────────────────────────────────────────────────
const buscarPropietario = async (termino) => {
    if (!termino) { cargarPropietarios(); return; }
    mostrarLoader('Buscando...');
    try {
        const r = await fetch(`${BASE}/API/propietarios/buscar?termino=${encodeURIComponent(termino)}`);
        const d = await r.json();
        if (d.codigo === 1) renderPropietarios(d.datos);
    } catch {
        Toast.fire({ icon: 'error', title: 'Error al buscar' });
    } finally {
        ocultarLoader();
    }
};

// ── INIT ──────────────────────────────────────────────────────────────────────
document.getElementById('btnNuevoPropietario')
    .addEventListener('click', () => mostrarFormPropietario());

document.getElementById('inputBuscar')
    .addEventListener('input', (e) => buscarPropietario(e.target.value.trim()));

cargarPropietarios();