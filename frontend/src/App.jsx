import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [vista, setVista] = useState(() => localStorage.getItem('token') ? 'dashboard' : 'login'); 
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
  const [mensaje, setMensaje] = useState('');
  const [objetivos, setObjetivos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [idMetaAEliminar, setIdMetaAEliminar] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');

  // 🌟 Estados nuevos para las subtareas
  const [subtareas, setSubtareas] = useState({}); // Guardará las subtareas agrupadas por objetivo_id
  const [nuevaSubtareaTexto, setNuevaSubtareaTexto] = useState({}); // Para controlar los inputs de cada tarjeta

  const [nuevoObjetivo, setNuevoObjetivo] = useState({
    titulo: '', descripcion: '', categoria: 'Carrera', fecha_inicio: '', fecha_fin: ''
  });

  useEffect(() => {
    const tokenExistente = localStorage.getItem('token');
    if (tokenExistente) cargarObjetivos(tokenExistente);
  }, []);

  // Cargar objetivos y sus respectivas subtareas
  const cargarObjetivos = async (token) => {
    try {
      const respuesta = await axios.get('https://shegoals.onrender.com/api/objetivos/listar', {
        headers: { Authorization: token }
      });
      setObjetivos(respuesta.data);
      
      // Por cada objetivo, vamos a pedir sus subtareas al backend
      respuesta.data.forEach(obj => {
        cargarSubtareas(obj.id, token);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const cargarSubtareas = async (objetivoId, token) => {
    try {
      const respuesta = await axios.get(`https://shegoals.onrender.com/api/subtareas/${objetivoId}`, {
        headers: { Authorization: token }
      });
      setSubtareas(prev => ({ ...prev, [objetivoId]: respuesta.data }));
    } catch (error) {
      console.error(error);
    }
  };

  // 📝 Crear una subtarea
  const handleCrearSubtarea = async (e, objetivoId) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const texto = nuevaSubtareaTexto[objetivoId];
    if (!texto || !texto.trim()) return;

    try {
      await axios.post('https://shegoals.onrender.com/api/subtareas/crear', { objetivo_id: objetivoId, texto }, {
        headers: { Authorization: token }
      });
      setNuevaSubtareaTexto(prev => ({ ...prev, [objetivoId]: '' })); // Limpiamos el input
      cargarSubtareas(objetivoId, token); // Recargamos el checklist
    } catch (error) {
      console.error(error);
    }
  };

  // 🔄 Marcar o desmarcar una subtarea (Check / Uncheck)
  const handleAlternarSubtarea = async (subtareaId, objetivoId, estadoActual) => {
    const token = localStorage.getItem('token');
    const nuevoEstado = estadoActual === 1 ? 0 : 1; // Si es 1 pasa a 0, y viceversa
    try {
      await axios.put(`https://shegoals.onrender.com/api/subtareas/alternar/${subtareaId}`, { completado: nuevoEstado }, {
        headers: { Authorization: token }
      });
      cargarSubtareas(objetivoId, token); // Refrescamos el estado visual
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      if (vista === 'registro') {
        const respuesta = await axios.post('https://shegoals.onrender.com/api/auth/register', formData);
        setMensaje(respuesta.data.msg);
      } else {
        const respuesta = await axios.post('https://shegoals.onrender.com/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('token', respuesta.data.token);
        setVista('dashboard');
        cargarObjetivos(respuesta.data.token);
      }
    } catch (error) {
      setMensaje(error.response ? error.response.data.msg : 'Error');
    }
  };

  const handleCrearObjetivo = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('https://shegoals.onrender.com/api/objetivos/crear', nuevoObjetivo, {
        headers: { Authorization: token }
      });
      setNuevoObjetivo({ titulo: '', descripcion: '', categoria: 'Carrera', fecha_inicio: '', fecha_fin: '' });
      setMostrarFormulario(false);
      cargarObjetivos(token);
    } catch (error) {
      alert('Error');
    }
  };

  const ejecutarEliminarObjetivo = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://shegoals.onrender.com/api/objetivos/eliminar/${idMetaAEliminar}`, {
        headers: { Authorization: token }
      });
      cargarObjetivos(token);
      setIdMetaAEliminar(null);
    } catch (error) {
      console.error(error);
    }
  };

  const objetivosFiltrados = objetivos.filter((obj) => {
    if (categoriaActiva === 'Todas') return true;
    return obj.categoria === categoriaActiva;
  });

  return (
    <div style={{ backgroundColor: 'var(--lux-bg)', minHeight: '100vh' }}>
      
      {/* MODAL DE CONFIRMACIÓN */}
      {idMetaAEliminar && (
        <div className="lux-modal-overlay">
          <div className="lux-modal">
            <p>¿Seguro que quieres eliminar la meta?</p>
            <div className="lux-modal-buttons">
              <button onClick={ejecutarEliminarObjetivo} className="btn-lux-primary" style={{ backgroundColor: '#e53e3e' }}>Eliminar</button>
              <button onClick={() => setIdMetaAEliminar(null)} className="btn-lux-primary" style={{ backgroundColor: '#edf2f7', color: 'var(--lux-text)' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {vista === 'dashboard' ? (
        <div className="lux-layout">
          <header className="lux-header">
            <div className="lux-logo">She<strong>Goals</strong></div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button onClick={() => setMostrarFormulario(!mostrarFormulario)} className="btn-lux-primary">
                {mostrarFormulario ? 'Cancelar' : '✨ Nueva Meta'}
              </button>
              <button onClick={() => { localStorage.removeItem('token'); setVista('login'); setObjetivos([]); }} className="btn-lux-text">Salir</button>
            </div>
          </header>

          {/* Formulario de Metas */}
          {mostrarFormulario && (
            <div className="lux-form-box">
              <form onSubmit={handleCrearObjetivo}>
                <input type="text" placeholder="¿Qué quieres lograr?" value={nuevoObjetivo.titulo} onChange={(e) => setNuevoObjetivo({...nuevoObjetivo, titulo: e.target.value})} required className="lux-input" />
                <input type="text" placeholder="Añade una breve descripción..." value={nuevoObjetivo.descripcion} onChange={(e) => setNuevoObjetivo({...nuevoObjetivo, descripcion: e.target.value})} required className="lux-input" />
                <select value={nuevoObjetivo.categoria} onChange={(e) => setNuevoObjetivo({...nuevoObjetivo, categoria: e.target.value})} className="lux-input" style={{ paddingBottom: '10px' }}>
                  <option value="Carrera">💻 Carrera y Crecimiento</option>
                  <option value="Salud">💪 Salud y Vitalidad</option>
                  <option value="Personal">🧘 Bienestar Interior</option>
                </select>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--lux-muted)' }}>Fecha Inicio</label>
                    <input type="date" value={nuevoObjetivo.fecha_inicio} onChange={(e) => setNuevoObjetivo({...nuevoObjetivo, fecha_inicio: e.target.value})} required className="lux-input" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--lux-muted)' }}>Fecha Fin</label>
                    <input type="date" value={nuevoObjetivo.fecha_fin} onChange={(e) => setNuevoObjetivo({...nuevoObjetivo, fecha_fin: e.target.value})} required className="lux-input" />
                  </div>
                </div>
                <button type="submit" className="btn-lux-primary" style={{ width: '100%', marginTop: '10px' }}>Guardar Meta</button>
              </form>
            </div>
          )}

          {/* Filtros */}
          <div className="lux-filter-container">
            {['Todas', 'Carrera', 'Salud', 'Personal'].map(cat => (
              <button key={cat} onClick={() => setCategoriaActiva(cat)} className={`lux-filter-pill ${categoriaActiva === cat ? 'active' : ''}`}>
                {cat === 'Todas' ? '⚡ Todas' : cat === 'Carrera' ? '💻 Carrera' : cat === 'Salud' ? '💪 Salud' : '🧘 Bienestar'}
              </button>
            ))}
          </div>

          {/* Tarjetas de Objetivos */}
          <div>
            {objetivosFiltrados.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--lux-muted)', marginTop: '40px' }}>No hay metas en esta categoría.</p>
            ) : (
              objetivosFiltrados.map((obj) => (
                <div key={obj.id} className="lux-goal-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 className="lux-goal-title">{obj.titulo}</h4>
                      <p className="lux-goal-desc">{obj.descripcion}</p>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                        <span className="lux-tag">{obj.categoria}</span>
                        <span style={{ fontSize: '12px', color: 'var(--lux-muted)' }}>
                          Meta: {new Date(obj.fecha_fin).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setIdMetaAEliminar(obj.id)} className="btn-lux-text" style={{ fontSize: '16px' }}>✕</button>
                  </div>

                  {/* 📋 SECCIÓN CHECKLIST DE SUBTAREAS */}
                  <div style={{ borderTop: '1px solid #f0eff1', paddingTop: '15px', marginTop: '5px' }}>
                    {/* Lista de pasos agregados */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                      {subtareas[obj.id] && subtareas[obj.id].map(sub => (
                        <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                          <input 
                            type="checkbox" 
                            checked={sub.completado === 1} 
                            onChange={() => handleAlternarSubtarea(sub.id, obj.id, sub.completado)}
                            style={{ accentColor: 'var(--lux-pink)', cursor: 'pointer', width: '16px', height: '16px' }}
                          />
                          <span style={{ 
                            color: sub.completado === 1 ? 'var(--lux-muted)' : 'var(--lux-text)',
                            textDecoration: sub.completado === 1 ? 'line-through' : 'none',
                            transition: 'all 0.3s'
                          }}>
                            {sub.texto}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Formulario mini para añadir paso rápido */}
                    <form onSubmit={(e) => handleCrearSubtarea(e, obj.id)} style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="+ Añadir un paso concreto..." 
                        value={nuevaSubtareaTexto[obj.id] || ''} 
                        onChange={(e) => setNuevaSubtareaTexto({ ...nuevaSubtareaTexto, [obj.id]: e.target.value })}
                        style={{ border: 'none', borderBottom: '1px dashed #e2e2e6', fontSize: '13px', padding: '6px 0', outline: 'none', flex: 1, background: 'none' }}
                      />
                      <button type="submit" className="btn-lux-text" style={{ fontWeight: '600', color: 'var(--lux-pink)' }}>Añadir</button>
                    </form>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* ACCESO */
        <div className="lux-auth-view">
          <div className="lux-auth-card">
            <h2>She<strong>Goals</strong></h2>
            <form onSubmit={handleSubmit}>
              {vista === 'registro' && (
                <input type="text" name="nombre" placeholder="Nombre completo" value={formData.nombre} onChange={handleInputChange} required className="lux-input" />
              )}
              <input type="email" name="email" placeholder="Dirección de email" value={formData.email} onChange={handleInputChange} required className="lux-input" />
              <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleInputChange} required className="lux-input" />
              <button type="submit" className="btn-lux-primary" style={{ width: '100%', marginTop: '20px', padding: '16px' }}>
                {vista === 'login' ? 'Entrar' : 'Crear Espacio'}
              </button>
            </form>
            {mensaje && <p style={{ color: 'var(--lux-pink)', fontSize: '14px', marginTop: '20px' }}>{mensaje}</p>}
            <p style={{ fontSize: '13px', color: 'var(--lux-muted)', marginTop: '40px' }}>
              {vista === 'login' ? (
                <>¿Nueva aquí? <span onClick={() => setVista('registro')} style={{ color: 'var(--lux-text)', cursor: 'pointer', fontWeight: '500' }}>Crea una cuenta</span></>
              ) : (
                <>¿Ya tienes cuenta? <span onClick={() => setVista('login')} style={{ color: 'var(--lux-text)', cursor: 'pointer', fontWeight: '500' }}>Inicia sesión</span></>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;