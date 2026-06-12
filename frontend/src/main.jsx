import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' 
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
// 📱 Registro automático del Service Worker para soporte móvil (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('¡Service Worker de SheGoals listo y activo!', reg.scope))
      .catch((err) => console.error('Error al registrar el Service Worker:', err));
  });
}