# 🚀 SheGoals — Aplicación Inteligente de Gestión de Objetivos

**SheGoals** es una plataforma web Full-Stack diseñada para ayudar a organizar metas y prioridades de forma estratégica en tres pilares fundamentales: Carrera, Salud y Bienestar Personal. 

A diferencia de las aplicaciones de tareas tradicionales, SheGoals incluye un **sistema inteligente de alertas temporales** y barras de progreso reactivas que te avisan visualmente si estás avanzando al ritmo adecuado o si el plazo de tu meta está en riesgo.

---

## ✨ Características Principales

* **🔐 Registro e Inicio de Sesión Seguro:** Autenticación de usuarios mediante tokens (JWT) para mantener tus metas 100% privadas.
* **📋 Control de Objetivos Completo:** Crea, edita en el momento, filtra por categorías y elimina metas con total facilidad.
* **🛠️ Pasos Clave (Subtareas) con Borrado Granular:** Desglosa tus grandes objetivos en pequeños pasos diarios y elimina o marca tareas al instante.
* **🚨 Semáforo de Urgencia e Indicadores Inteligentes:** * Muestra una alerta roja (`🚨 Crítico`) si te quedan menos de 3 días para una meta importante.
  * Muestra una alerta naranja (`⚠️ Ritmo Lento`) si ha pasado más de la mitad del tiempo del plazo y aún no has completado suficientes pasos.
* **📊 Gráfica de Progreso Visual:** Un panel estadístico interactivo (hecho con Recharts) que compara visualmente tus tareas totales creadas frente a las completadas por categoría.

---

## 🛠️ Tecnologías Utilizadas (Tech Stack)

### **Frontend (Cliente)**
* **React.js** (Vite) — Estructura modular y gestión de estados rápidos.
* **Axios** — Para conectar el frontend con el servidor de forma segura.
* **Recharts** — Para las gráficas estadísticas interactivas.
* **CSS3** — Interfaz limpia, minimalista y adaptada con un estilo moderno.

### **Backend (Servidor) y Base de Datos**
* **Node.js y Express.js** — Creación de la API REST para procesar todas las peticiones.
* **MySQL** — Base de datos relacional para guardar usuarios, metas y subtareas de forma consistente.
* **JWT (JSON Web Tokens)** — Para proteger las rutas y asegurar las sesiones.

---

## 🚀 Cómo Ejecutar el Proyecto Localmente

Sigue estos sencillos pasos para tener la aplicación corriendo en tu ordenador:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/shegoals.git](https://github.com/tu-usuario/shegoals.git)
cd shegoals
