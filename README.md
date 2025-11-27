# Library
Proyecto del segundo cincuenta de Electiva II sobre una biblioteca comunitaria.

# 📚 Sistema de Biblioteca Comunitaria - Guía de Instalación

## 🚀 Instalación Rápida

### 1. Instalar dependencias en raíz del proyecto

```bash
npm install
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
cd ..
```

### 3. Instalar dependencias del frontend

```bash
cd frontend
npm install
cd ..
```

### 4. Configurar variables de entorno

Crear archivo `.env` en la carpeta `backend/` con:

```env
MONGO_URI=mongodb://localhost:27017/biblioteca
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_en_produccion
PORT=4000
```

### 5. Asegurarse de tener MongoDB corriendo

```bash
# Si usas MongoDB local
mongod

# O si usas MongoDB Atlas, usa tu connection string en MONGO_URI
```

### 6. Ejecutar el proyecto completo

```bash
npm run dev
```

Esto ejecutará simultáneamente:
- Backend en http://localhost:4000/graphql
- Frontend en http://localhost:5173

## 📝 Comandos Disponibles

```bash
# Ejecutar backend y frontend simultáneamente
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend
npm run dev:frontend

# Instalar todas las dependencias
npm run install:all

# Build para producción
npm run build
```

## 👥 Usuarios de Prueba

Para probar el sistema, puedes crear usuarios con diferentes roles:

### Crear Admin (usar GraphQL Playground)
```graphql
mutation {
  register(
    name: "Admin Principal"
    email: "admin@biblioteca.com"
    password: "admin123"
  ) {
    token
    user { id name role }
  }
}
```

Luego actualizar el rol en MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@biblioteca.com" },
  { $set: { role: "admin" } }
)
```

### Crear Bibliotecario
```graphql
mutation {
  register(
    name: "Bibliotecario Juan"
    email: "staff@biblioteca.com"
    password: "staff123"
  ) {
    token
    user { id name role }
  }
}
```

Actualizar rol:
```javascript
db.users.updateOne(
  { email: "staff@biblioteca.com" },
  { $set: { role: "staff" } }
)
```

### Usuario Normal
Los usuarios registrados normalmente ya tienen rol "user" por defecto.

## 🎯 Funcionalidades por Rol

### 🔴 Administrador
- Dashboard con estadísticas
- Gestión completa de libros (crear, editar, eliminar)
- Gestión de préstamos
- Gestión de eventos
- Gestión de usuarios
- Ver logs de auditoría

### 🔵 Bibliotecario (Staff)
- Ver catálogo
- Gestión de libros (crear, editar)
- Gestionar préstamos (crear, devolver)
- Gestionar eventos
- Ver estadísticas

### 🟢 Miembro (User)
- Ver catálogo y buscar libros
- Reservar libros no disponibles
- Ver mis préstamos activos
- Ver mis reservas
- Inscribirse en eventos

## 📊 Estructura del Proyecto

```
biblioteca-comunitaria/
├── backend/
│   ├── src/
│   │   ├── core/
│   │   │   ├── auth.ts
│   │   │   └── db.ts
│   │   ├── graphql/
│   │   │   ├── resolvers.ts
│   │   │   └── schema.ts
│   │   ├── models/
│   │   │   └── index.ts (todos los modelos)
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── core/
│   │   │   └── graphqlClient.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── books/
│   │   │   ├── loans/
│   │   │   ├── reservations/
│   │   │   ├── events/
│   │   │   ├── users/
│   │   │   ├── stats/
│   │   │   └── audit/
│   │   ├── views/
│   │   │   ├── AdminView.tsx
│   │   │   ├── StaffView.tsx
│   │   │   └── MemberView.tsx
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── package.json (root)
└── README.md
```

## 🔧 Solución de Problemas

### Error de conexión a MongoDB
```bash
# Verificar que MongoDB está corriendo
mongod --version

# Si usas MongoDB local, iniciar el servicio
sudo service mongod start  # Linux
brew services start mongodb-community  # macOS
```

### Puerto ya en uso
```bash
# Si el puerto 4000 está ocupado, cambiar en backend/.env
PORT=4001

# Si el puerto 5173 está ocupado, Vite automáticamente usará otro
```

### Problemas con dependencias
```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

npm run install:all
```

## 📱 Características Implementadas

✅ Autenticación con JWT
✅ Roles y permisos (Admin, Staff, User)
✅ Catálogo de libros con búsqueda y filtros
✅ Sistema de préstamos con fechas límite
✅ Sistema de reservas
✅ Gestión de eventos comunitarios
✅ Dashboard con estadísticas
✅ Logs de auditoría
✅ Interfaz responsive
✅ Gestión de usuarios (admin)

## 🚀 Próximas Mejoras Sugeridas

- [ ] Notificaciones por email
- [ ] Sistema de multas automático
- [ ] Reportes en PDF
- [ ] Subida de imágenes de libros
- [ ] Chat de soporte
- [ ] Historial detallado de préstamos
- [ ] Recomendaciones de libros

## 📞 Soporte

Si encuentras algún problema, verifica:
1. MongoDB está corriendo
2. Todas las dependencias están instaladas
3. El archivo .env está configurado correctamente
4. Los puertos 4000 y 5173 están disponibles