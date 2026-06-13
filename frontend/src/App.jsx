import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [vista, setVista] = useState(() => localStorage.getItem('token') ? 'dashboard' : 'login'); 
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
  const [mensaje, setMensaje] = useState('');
  const [objetivos, setObjetivos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [idMetaAEliminar, setIdMetaAEliminar] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [pestanaActiva, setPestanaActiva] = useState('metas');

  const [subtareas, setSubtareas] = useState({}); 
  const [nuevaSubtareaTexto, setNuevaSubtareaTexto] = useState({}); 

  const [idMetaEnEdicion, setIdMetaEnEdicion] = useState(null);
  const [metaEditada, setMetaEditada] = useState({
    titulo: '', descripcion: '', categoria: '', fecha_inicio: '', fecha_fin: '', prioridad: 'Media'
  });

  const [nuevoObjetivo, setNuevoObjetivo] = useState({
    titulo: '', descripcion: '', categoria: 'Carrera', fecha_inicio: '', fecha_fin: '', prioridad: 'Media'
  });

  useEffect(() => {
    const tokenExistente = localStorage.getItem('token');
    if (tokenExistente) cargarObjetivos(tokenExistente);
  }, []);

  const cargarObjetivos = async (token) => {
    try {
      const respuesta = await axios.get('http://localhost:5000/api/objetivos/listar', {
        headers: { Authorization: token }
      });
      setObjetivos(respuesta.data);
      respuesta.data.forEach(obj => {
        cargarSubtareas(obj.id, token);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const cargarSubtareas = async (objetivoId, token) => {
    try {
      const respuesta = await axios.get(`http://localhost:5000/api/subtareas/${objetivoId}`, {
        headers: { Authorization: token }
      });
      setSubtareas(prev => ({ ...prev, [objetivoId]: respuesta.data }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCrearSubtarea = async (e, objetivoId) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const texto = nuevaSubtareaTexto[objetivoId];
    if (!texto || !texto.trim()) return;

    try {
      await axios.post('http://localhost:5000/api/subtareas/crear', { objetivo_id: objetivoId, texto }, {
        headers: { Authorization: token }
      });
      setNuevaSubtareaTexto(prev => ({ ...prev, [objetivoId]: '' })); 
      cargarSubtareas(objetivoId, token); 
    } catch (error) {
      console.error(error);
    }
  };

  const handleAlternarSubtarea = async (subtareaId, objetivoId, estadoActual) => {
    const token = localStorage.getItem('token');
    const nuevoEstado = estadoActual === 1 ? 0 : 1; 
    try {
      await axios.put(`http://localhost:5000/api/subtareas/alternar/${subtareaId}`, { completado: nuevoEstado }, {
        headers: { Authorization: token }
      });
      cargarSubtareas(objetivoId, token); 
    } catch (error) {
      console.error(error);
    }
  };

  // 🗑️ ELIMINAR SUBTAREA INDIVIDUAL
  const handleEliminarSubtarea = async (subtareaId, objetivoId) => {
    try {
      await axios.delete(`http://localhost:5000/api/subtareas/eliminar/${subtareaId}`);
      const token = localStorage.getItem('token');
      cargarSubtareas(objetivoId, token);
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
        const respuesta = await axios.post('http://localhost:5000/api/usuarios/registro', formData);
        setMensaje(respuesta.data.msg);
      } else {
        const respuesta = await axios.post('http://localhost:5000/api/usuarios/login', {
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('token', respuesta.data.token);
        setVista('dashboard');
        cargarObjetivos(respuesta.data.token);
      }
    } catch (error) {
      setMensaje(error.response ? error.response.data.msg : 'Error al conectar');
    }
  };

  const handleCrearObjetivo = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/objetivos/crear', nuevoObjetivo, {
        headers: { Authorization: token }
      });
      setNuevoObjetivo({ titulo: '', descripcion: '', categoria: 'Carrera', fecha_inicio: '', fecha_fin: '', prioridad: 'Media' });
      setMostrarFormulario(false);
      cargarObjetivos(token);
    } catch (error) {
      alert('Error');
    }
  };

  const activarEdicion = (obj) => {
    setIdMetaEnEdicion(obj.id);
    const fInicio = obj.fecha_inicio ? obj.fecha_inicio.split('T')[0] : '';
    const fFin = obj.fecha_fin ? obj.fecha_fin.split('T')[0] : '';
    setMetaEditada({
      titulo: obj.titulo,
      descripcion: obj.descripcion,
      categoria: obj.categoria,
      fecha_inicio: fInicio,
      fecha_fin: fFin,
      prioridad: obj.prioridad || 'Media'
    });
  };

  const handleGuardarEdicion = async (e, id) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/objetivos/editar/${id}`, metaEditada, {
        headers: { Authorization: token }
      });
      setIdMetaEnEdicion(null);
      cargarObjetivos(token);
    } catch (error) {
      console.error(error);
      alert('Error al editar la meta');
    }
  };

  const ejecutarEliminarObjetivo = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/objetivos/eliminar/${idMetaAEliminar}`, {
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

  const calcularProgreso = (objetivoId) => {
    const listaSubtareas = subtareas[objetivoId];
    if (!listaSubtareas || listaSubtareas.length === 0) return 0;

    const completadas = listaSubtareas.filter(sub => sub.completado === 1).length;
    return Math.round((completadas / listaSubtareas.length) * 100);
  };

  // ⏱️ ALGORITMO EXCLUSIVO "HEALTH & TIME-SQUEEZE" PARA PORTFOLIO SENIOR
  const obtenerAlertaUrgencia = (obj) => {
    const progreso = calcularProgreso(obj.id);
    if (progreso === 100) return null; 

    const hoy = new Date();
    const inicio = new Date(obj.fecha_inicio);
    const fin = new Date(obj.fecha_fin);

    const tiempoTotal = fin.getTime() - inicio.getTime();
    const tiempoConsumido = hoy.getTime() - inicio.getTime();

    if (tiempoTotal <= 0) return null;

    const porcentajeTiempoPasado = (tiempoConsumido / tiempoTotal) * 100;
    const diasRestantes = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return { mensaje: `⏳ Plazo Expirado`, color: '#718096', bg: '#edf2f7' };
    }
    if (obj.prioridad === 'Alta' && diasRestantes <= 3) {
      return { mensaje: `🚨 Crítico: ¡Quedan ${diasRestantes} días!`, color: '#e53e3e', bg: '#fff5f5' };
    }
    // 💡 Alerta Inteligente: Si el tiempo pasa más rápido que tu ejecución
    if (porcentajeTiempoPasado > 60 && progreso < 30) {
      return { mensaje: `⚠️ Ritmo Lento: Ha pasado el ${Math.round(porcentajeTiempoPasado)}% del plazo`, color: '#dd6b20', bg: '#fffaf0' };
    }
    return null;
  };

  // Estadísticas
  const totalMetas = objetivos.length;
  const metasCompletadas = objetivos.filter(obj => {
    const lista = subtareas[obj.id];
    if (!lista || lista.length === 0) return false;
    return lista.filter(sub => sub.completado === 1).length === lista.length;
  }).length;
  const metasEnProgreso = totalMetas - metasCompletadas;
  const totalPasosDados = Object.values(subtareas).flat().filter(sub => sub.completado === 1).length;

  const generarDatosGrafica = () => {
    const categorias = ['Carrera', 'Salud', 'Personal'];
    return categorias.map(cat => {
      const metasDeCat = objetivos.filter(obj => obj.categoria === cat);
      let pasosTotales = 0;
      let pasosCompletados = 0;
      metasDeCat.forEach(obj => {
        const listaSub = subtareas[obj.id] || [];
        pasosTotales += listaSub.length;
        pasosCompletados += listaSub.filter(sub => sub.completado === 1).length;
      });
      const nombreBonito = cat === 'Carrera' ? '💻 Carrera' : cat === 'Salud' ? '💪 Salud' : '🧘 Bienestar';
      return { name: nombreBonito, 'Pasos Totales': pasosTotales, 'Pasos Completados': pasosCompletados };
    });
  };

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

          {/* 📈 PANEL DE ESTADÍSTICAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginBottom: '25px', marginTop: '10px' }}>
            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f0eff1' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--lux-muted)', fontWeight: '500' }}>Metas Activas</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--lux-text)' }}>{metasEnProgreso}</p>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f0eff1' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--lux-muted)', fontWeight: '500' }}>Completadas</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#48bb78' }}>{metasCompletadas} ✨</p>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f0eff1' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--lux-muted)', fontWeight: '500' }}>Pasos Dados</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--lux-pink)' }}>{totalPasosDados} 🛠️</p>
            </div>
          </div>

          {/* PESTAÑAS */}
          <div style={{ display: 'flex', borderBottom: '2px solid #edf2f7', marginBottom: '25px', gap: '5px' }}>
            <button onClick={() => setPestanaActiva('metas')} style={{ padding: '12px 24px', background: 'none', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: pestanaActiva === 'metas' ? 'var(--lux-pink)' : 'var(--lux-muted)', borderBottom: pestanaActiva === 'metas' ? '2px solid var(--lux-pink)' : '2px solid transparent', marginBottom: '-2px', transition: 'all 0.3s' }}>📋 Mis Metas</button>
            <button onClick={() => setPestanaActiva('grafica')} style={{ padding: '12px 24px', background: 'none', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: pestanaActiva === 'grafica' ? 'var(--lux-pink)' : 'var(--lux-muted)', borderBottom: pestanaActiva === 'grafica' ? '2px solid var(--lux-pink)' : '2px solid transparent', marginBottom: '-2px', transition: 'all 0.3s' }}>📊 Mi Progreso Visual</button>
          </div>

          {/* Formulario de Creación */}
          {mostrarFormulario && (
            <div className="lux-form-box">
              <form onSubmit={handleCrearObjetivo}>
                <input type="text" placeholder="¿Qué quieres lograr?" value={nuevoObjetivo.titulo} onChange={(e) => setNuevoObjetivo({...nuevoObjetivo, titulo: e.target.value})} required className="lux-input" />
                <input type="text" placeholder="Añade una breve descripción..." value={nuevoObjetivo.descripcion} onChange={(e) => setNuevoObjetivo({...nuevoObjetivo, descripcion: e.target.value})} required className="lux-input" />
                
                <div style={{ display: 'flex', gap: '20px' }}>
                  <select value={nuevoObjetivo.categoria} onChange={(e) => setNuevoObjetivo({...nuevoObjetivo, categoria: e.target.value})} className="lux-input" style={{ flex: 1 }}>
                    <option value="Carrera">💻 Carrera y Crecimiento</option>
                    <option value="Salud">💪 Salud y Vitalidad</option>
                    <option value="Personal">🧘 Bienestar Interior</option>
                  </select>
                  <select value={nuevoObjetivo.prioridad} onChange={(e) => setNuevoObjetivo({...nuevoObjetivo, prioridad: e.target.value})} className="lux-input" style={{ flex: 1 }}>
                    <option value="Baja">🌿 Prioridad Baja</option>
                    <option value="Media">⚡ Prioridad Media</option>
                    <option value="Alta">🔥 Prioridad Alta</option>
                  </select>
                </div>

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
                <button type="submit" className="btn-lux-primary" style={{ width: '100%', marginTop: '15px' }}>Guardar Meta</button>
              </form>
            </div>
          )}

          {pestanaActiva === 'metas' ? (
            <>
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
                {objetivosFiltrados.map((obj) => (
                  <div key={obj.id} className="lux-goal-card" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'stretch',
                    border: idMetaEnEdicion === obj.id ? '1px solid var(--lux-pink)' : obtenerAlertaUrgencia(obj) ? `1px solid ${obtenerAlertaUrgencia(obj).color}` : calcularProgreso(obj.id) === 100 ? '1px solid #48bb78' : '1px solid #f0eff1',
                    boxShadow: obtenerAlertaUrgencia(obj) ? '0 4px 20px rgba(221, 107, 32, 0.04)' : '0 4px 20px rgba(0,0,0,0.01)',
                    transition: 'all 0.3s'
                  }}>
                    
                    {idMetaEnEdicion === obj.id ? (
                      /* FORMULARIO EDICIÓN */
                      <form onSubmit={(e) => handleGuardarEdicion(e, obj.id)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" value={metaEditada.titulo} onChange={(e) => setMetaEditada({...metaEditada, titulo: e.target.value})} required className="lux-input" />
                        <input type="text" value={metaEditada.descripcion} onChange={(e) => setMetaEditada({...metaEditada, descripcion: e.target.value})} required className="lux-input" />
                        <div style={{ display: 'flex', gap: '15px' }}>
                          <select value={metaEditada.categoria} onChange={(e) => setMetaEditada({...metaEditada, categoria: e.target.value})} className="lux-input" style={{ flex: 1 }}>
                            <option value="Carrera">💻 Carrera</option>
                            <option value="Salud">💪 Salud</option>
                            <option value="Personal">🧘 Bienestar</option>
                          </select>
                          <select value={metaEditada.prioridad} onChange={(e) => setMetaEditada({...metaEditada, prioridad: e.target.value})} className="lux-input" style={{ flex: 1 }}>
                            <option value="Baja">🌿 Baja</option>
                            <option value="Media">⚡ Media</option>
                            <option value="Alta">🔥 Alta</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '11px', color: 'var(--lux-muted)' }}>Inicio</label>
                            <input type="date" value={metaEditada.fecha_inicio} onChange={(e) => setMetaEditada({...metaEditada, fecha_inicio: e.target.value})} required className="lux-input" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '11px', color: 'var(--lux-muted)' }}>Fin</label>
                            <input type="date" value={metaEditada.fecha_fin} onChange={(e) => setMetaEditada({...metaEditada, fecha_fin: e.target.value})} required className="lux-input" />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                          <button type="submit" className="btn-lux-primary" style={{ flex: 1, padding: '10px' }}>Guardar Cambios</button>
                          <button type="button" onClick={() => setIdMetaEnEdicion(null)} className="btn-lux-text" style={{ backgroundColor: '#edf2f7', padding: '0 15px', borderRadius: '12px' }}>Cancelar</button>
                        </div>
                      </form>
                    ) : (
                      /* TARJETA NORMAL */
                      <>
                        {obtenerAlertaUrgencia(obj) && (
                          <div style={{ backgroundColor: obtenerAlertaUrgencia(obj).bg, color: obtenerAlertaUrgencia(obj).color, padding: '8px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', marginBottom: '15px', display: 'inline-block', alignSelf: 'flex-start' }}>
                            {obtenerAlertaUrgencia(obj).mensaje}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 className="lux-goal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {obj.titulo}
                              <span style={{ 
                                fontSize: '10px', 
                                fontWeight: '600', 
                                padding: '2px 8px', 
                                borderRadius: '999px',
                                backgroundColor: obj.prioridad === 'Alta' ? '#fff5f5' : obj.prioridad === 'Baja' ? '#f0fff4' : '#f7fafc',
                                color: obj.prioridad === 'Alta' ? '#e53e3e' : obj.prioridad === 'Baja' ? '#38a169' : '#4a5568',
                                border: obj.prioridad === 'Alta' ? '1px solid #fed7d7' : obj.prioridad === 'Baja' ? '1px solid #c6f6d5' : '1px solid #e2e8f0'
                              }}>
                                {obj.prioridad === 'Alta' ? '🔥 Alta' : obj.prioridad === 'Baja' ? '🌿 Baja' : '⚡ Media'}
                              </span>
                            </h4>
                            <p className="lux-goal-desc">{obj.descripcion}</p>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                              <span className="lux-tag">{obj.categoria}</span>
                              <span style={{ fontSize: '12px', color: 'var(--lux-muted)' }}>
                                Meta: {new Date(obj.fecha_fin).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                              <button onClick={() => activarEdicion(obj)} className="btn-lux-text" style={{ fontSize: '12px', color: 'var(--lux-pink)', fontWeight: '500', padding: 0 }}>
                                ✏️ Editar
                              </button>
                            </div>
                          </div>
                          <button onClick={() => setIdMetaAEliminar(obj.id)} className="btn-lux-text" style={{ fontSize: '16px' }}>✕</button>
                        </div>

                        {/* BARRA PROGRESO */}
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: calcularProgreso(obj.id) === 100 ? '#48bb78' : 'var(--lux-muted)' }}>
                              {calcularProgreso(obj.id) === 100 ? '🎉 ¡Brutal! Meta completada' : 'Progreso de la meta'}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: calcularProgreso(obj.id) === 100 ? '#48bb78' : 'var(--lux-pink)' }}>{calcularProgreso(obj.id)}%</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: '#edf2f7', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${calcularProgreso(obj.id)}%`, height: '100%', backgroundColor: calcularProgreso(obj.id) === 100 ? '#48bb78' : 'var(--lux-pink)', borderRadius: '999px', transition: 'width 0.4s ease-in-out' }} />
                          </div>
                        </div>

                        {/* SUBTAREAS */}
                        <div style={{ borderTop: '1px solid #f0eff1', paddingTop: '15px', marginTop: '5px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                            {subtareas[obj.id] && subtareas[obj.id].map(sub => (
                              <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }} className="lux-subtask-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <input type="checkbox" checked={sub.completado === 1} onChange={() => handleAlternarSubtarea(sub.id, obj.id, sub.completado)} style={{ accentColor: 'var(--lux-pink)', cursor: 'pointer', width: '16px', height: '16px' }} />
                                  <span style={{ color: sub.completado === 1 ? 'var(--lux-muted)' : 'var(--lux-text)', textDecoration: sub.completado === 1 ? 'line-through' : 'none' }}>{sub.texto}</span>
                                </div>
                                {/* 🗑️ BOTÓN DE ELIMINACIÓN MICRO-GRANULAR */}
                                <button onClick={() => handleEliminarSubtarea(sub.id, obj.id)} className="btn-lux-text" style={{ fontSize: '11px', color: '#a0aec0', padding: '2px 6px' }}>
                                  Borrar
                                </button>
                              </div>
                            ))}
                          </div>
                          <form onSubmit={(e) => handleCrearSubtarea(e, obj.id)} style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" placeholder="+ Añadir un paso concreto..." value={nuevaSubtareaTexto[obj.id] || ''} onChange={(e) => setNuevaSubtareaTexto({ ...nuevaSubtareaTexto, [obj.id]: e.target.value })} style={{ border: 'none', borderBottom: '1px dashed #e2e2e6', fontSize: '13px', padding: '6px 0', outline: 'none', flex: 1, background: 'none' }} />
                            <button type="submit" className="btn-lux-text" style={{ fontWeight: '600', color: 'var(--lux-pink)' }}>Añadir</button>
                          </form>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* GRÁFICA */
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', border: '1px solid #f0eff1', marginTop: '10px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600', color: 'var(--lux-text)' }}>Análisis de Pasos por Enfoque</h3>
              <p style={{ margin: '0 0 25px 0', fontSize: '13px', color: 'var(--lux-muted)' }}>Compara el volumen total de tareas creadas frente a las que ya has completado en cada pilar de tu vida.</p>
              <div style={{ width: '100%', height: 300, fontSize: '12px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={generarDatosGrafica()} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0eff1" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="var(--lux-muted)" />
                    <YAxis tickLine={false} axisLine={false} stroke="var(--lux-muted)" />
                    <Tooltip cursor={{ fill: '#faf9fb' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px' }} />
                    <Bar dataKey="Pasos Totales" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pasos Completados" fill="var(--lux-pink)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

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