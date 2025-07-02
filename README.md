# GestIAPro: Gestión Colaborativa de Proyectos con Inteligencia Artificial

**Versión:** 1.0  
**Fecha de lanzamiento:** 02/07/2025  
**Ubicación:** Huancayo, Perú  
**Autores:**  
- Contreras Cerron David Anthony (74465364@continental.edu.pe)  
- García Betancourt Josué Daniel (77043114@continental.edu.pe)  
- Huamán Quiñones Anghelo Josue (73545882@continental.edu.pe)  
- Payano Salvador Cesar Alejandro (70231150@continental.edu.pe)  
- Torre Medina Raul Alejandro (77331712@continental.edu.pe)  
- Urbano Fabian Jorge Jose (71700320@continental.edu.pe)  
- Vilcapoma Camposano Yony (71197528@continental.edu.pe)  

---

## 📌 Descripción

**GestIAPro** es una plataforma web desarrollada con el stack MERN (MongoDB, Express.js, React.js y Node.js) que permite la gestión colaborativa de proyectos, integrando herramientas de inteligencia artificial para facilitar la creación de historias de usuario, traducción de mensajes en tiempo real y análisis inteligente de desempeño.

---

## 🚀 Características

- Gestión de proyectos y épicas con tablero Kanban
- Chat en tiempo real con traducción automática
- Generación de historias de usuario con IA
- Panel administrativo con métricas clave
- Arquitectura modular cliente-servidor
- Despliegue automatizado vía Railway

---

## 🛠️ Tecnologías Utilizadas

- MongoDB
- Express.js
- React.js
- Node.js
- Tailwind CSS
- Socket.IO
- Railway
- Jest / Mocha / Cypress (pruebas)

---

## 📥 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu_usuario/gestiapro.git
cd gestiapro
2. Instalar dependencias del backend
bash
Copiar
Editar
cd backend
npm install
3. Instalar dependencias del frontend
bash
Copiar
Editar
cd ../frontend
npm install
⚙️ Variables de Entorno
Crear un archivo .env en ambas carpetas (/backend y /frontend) con las siguientes variables:

Backend (/backend/.env)
env
Copiar
Editar
PORT=5000
MONGODB_URI=tu_cadena_de_conexion
JWT_SECRET=tu_secreto_jwt
OPENAI_API_KEY=tu_api_key_ia
CORS_ORIGIN=http://localhost:5173
Frontend (/frontend/.env)
env
Copiar
Editar
VITE_API_URL=http://localhost:5000
▶️ Ejecución
Iniciar backend
bash
Copiar
Editar
cd backend
npm run dev
Iniciar frontend
bash
Copiar
Editar
cd ../frontend
npm run dev
La aplicación estará disponible en:
📍 http://localhost:5173

🧪 Pruebas
Puedes ejecutar pruebas utilizando:

bash
Copiar
Editar
npm test
Soporte para:

Pruebas unitarias

Pruebas de integración

Pruebas de interfaz (E2E)

📘 Documentación
La documentación técnica completa se encuentra en la carpeta /docs e incluye:

Diagramas de clases

Arquitectura del sistema

Diagramas de flujo

Informe final del proyecto

📈 Despliegue
GestIAPro fue desplegado usando Railway, conectando repositorios de GitHub para frontend y backend. MongoDB se aloja como servicio en la misma plataforma.

Accesos automáticos
Frontend: https://<subdominio>.up.railway.app
Backend: https://<subdominio>.up.railway.app/api

📞 Soporte y Contacto
Para reportar errores o sugerencias:

Abrir un issue en GitHub

Contactar al equipo de desarrollo vía correo institucional

🧾 Licencia
Este proyecto está bajo la licencia MIT.

🏫 Créditos
Desarrollado por estudiantes de Universidad Continental
Curso: Taller de Proyectos 2 – Ingeniería de Sistemas e Informática

✅ Recomendaciones
Estabilizar el despliegue en Railway revisando configuraciones

Ampliar cobertura de pruebas automatizadas

Considerar el uso de Docker para entornos portables

Evaluar rendimiento de modelos IA integrados

Mejorar la documentación técnica de API y uso