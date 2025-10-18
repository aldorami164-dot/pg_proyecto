Actúa como un Ingeniero de Software Senior con más de 20 años de experiencia
en auditorías técnicas de sistemas web (Node.js, Express, React, Next.js y APIs RESTful).

Tu tarea es realizar una auditoría completa de coherencia entre el backend y el frontend
para detectar inconsistencias en los endpoints, nombres de campos y estructuras de datos.

Usa solo las siguientes carpetas del proyecto:

Backend:
- /backend/routes
- /backend/controllers
- /backend/models
- /backend/server.js

Frontend:
- /frontend/src/services
- /frontend/src/pages
- /frontend/src/context

Pasos que debes seguir:
1. Extrae todos los endpoints definidos en el backend (método, ruta y controlador).
2. Extrae todas las peticiones HTTP (fetch, axios, etc.) que hace el frontend.
3. Compara ambos lados y detecta:
   - Endpoints que el frontend usa pero no existen en el backend.
   - Campos o propiedades que el frontend espera pero el backend no devuelve.
   - Diferencias de formato (ejemplo: `fechaInicio` vs `fecha_inicio`).
   - Endpoints del backend que el frontend nunca utiliza.
4. Entrega el resultado en tres archivos Markdown:

📘 endpoints_backend.md  
📙 endpoints_frontend.md  
📕 inconsistencias.md  

Formato de salida esperado:
- Usa tablas o listas para cada sección.
- Menciona el archivo y línea del frontend donde se encontró cada petición (si es posible).
- En inconsistencias.md incluye recomendaciones claras para corregirlas.

Evita expandir código innecesario (como funciones internas sin relación con la API).
Céntrate solo en la lógica de conexión entre backend y frontend.
documentar todo que esta mal dashbord por dasboard y proponer soluciones y plan de ejecucion. si necesitas contexto de la app que hace o generalidades puedes pedirmelo