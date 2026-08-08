# Plan de Desarrollo - Liahona App

## Stack Tecnológico
- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4
- **Íconos:** lucide-react
- **Fechas:** date-fns
- **Gráficos:** recharts
- **Base de datos (futuro):** Supabase (PostgreSQL)

## Arquitectura de Archivos

```
liahona-app/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx           # Login (Inicio de sesión)
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Layout con Sidebar y Header común
│   │   ├── page.tsx               # Dashboard (Panel principal)
│   │   ├── estudiantes/
│   │   │   └── page.tsx           # Vista de Estudiantes
│   │   ├── calendario/
│   │   │   └── page.tsx           # Vista de Calendario
│   │   └── pagos/
│   │       └── page.tsx           # Vista de Pagos
│   ├── globals.css
│   └── layout.tsx                 # Root layout con AuthProvider
├── components/
│   ├── ui/                        # Componentes UI reutilizables (Button, Input, Select, Modal, Badge, Table, Card)
│   ├── shared/                    # Sidebar, Header, AuthGuard
│   ├── auth/                      # LoginForm
│   ├── dashboard/                 # Componentes del dashboard
│   ├── estudiantes/               # Componentes de estudiantes
│   ├── calendario/                # Componentes de calendario
│   └── pagos/                     # Componentes de pagos
├── context/
│   └── auth-context.tsx           # Proveedor de autenticación (Mock -> Supabase Auth)
├── hooks/                         # Hooks personalizados (use-students, use-payments, use-events)
├── lib/
│   └── utils.ts                   # Utilidades (cn, fechas, monedas)
├── services/
│   ├── mock-data.ts               # Datos iniciales para pruebas
│   └── index.ts                   # CRUD (Mock -> Supabase)
└── types/
    └── index.ts                   # Tipados (Student, Payment, CalendarEvent)
```

## Diseño de Base de Datos (Supabase - Futuro)

### Tablas
- **profiles** (id, email, full_name, role, created_at)
- **students** (id, first_name, last_name, email, phone, birth_date, group_or_grade, status, created_at, created_by)
- **payments** (id, student_id, amount, due_date, payment_date, status, payment_method, invoice_number, notes, created_at)
- **events** (id, title, description, start_time, end_time, type, color_theme, created_by, created_at)

### Políticas RLS
- profiles: Lectura/escritura según rol
- students: Lectura/escritura autenticada
- payments: Lectura/escritura autenticada
- events: Lectura/escritura autenticada

---

## Fases de Desarrollo

### ✅ Fase 1: Configuración & UI Base (COMPLETADO - Dia 1-2)
- [x] Configurar paleta de colores en Tailwind CSS v4
- [x] Instalar dependencias (lucide-react, date-fns, recharts, clsx, tailwind-merge)
- [x] Crear estructura de carpetas completa
- [x] Crear componentes UI reutilizables (Button, Input, Select, Modal, Badge, Table, Card)
- [x] Crear tipos TypeScript (Student, Payment, CalendarEvent)
- [x] Crear utilidades (cn, formateo de fechas y monedas)

### ✅ Fase 2: Autenticación & Dashboard (COMPLETADO - Dia 2-3)
- [x] Crear AuthContext para autenticación mock (admin@liahona.edu / admin123)
- [x] Pantalla de inicio de sesión con diseño responsive (2 columnas)
- [x] Sidebar y Header globales con navegación
- [x] Dashboard con tarjetas de métricas (Estudiantes activos, Ingresos, Eventos, Pagos pendientes)
- [x] Lista de últimos pagos y próximos eventos en el dashboard
- [x] Protección de rutas (redirección a /login si no hay sesión)

### ✅ Fase 3: Módulo Estudiantes (COMPLETADO - Dia 4-6)
- [x] Tabla de estudiantes con columnas: Nombre, Grado, Teléfono, Estado, Acciones
- [x] Búsqueda por nombre
- [x] Filtro por grado
- [x] Modal para crear nuevo estudiante
- [x] Modal para editar estudiante existente
- [x] Estados de estudiante: Activo, Inactivo, Suspendido

### ✅ Fase 4: Módulo Pagos (COMPLETADO - Dia 7-9)
- [x] Tabla de pagos con columnas: Estudiante, Grado, Monto, Vencimiento, Estado, Acciones
- [x] Filtros por estudiante y estado (Pagado, Pendiente, Atrasado)
- [x] Tarjetas de resumen financiero (Ingresos totales, Pendientes mensuales, Atrasados)
- [x] Modal para registrar pago (monto, método, fecha)
- [x] Generación mock de número de recibo
- [x] Actualización en tiempo real del estado de pago

### ✅ Fase 5: Módulo Calendario (COMPLETADO - Dia 10-12)
- [x] Grilla de calendario mensual (Lunes-Domingo)
- [x] Navegación entre meses (Anterior/Siguiente)
- [x] Visualización de eventos por día con colores por tipo
- [x] Modal para crear evento (título, descripción, tipo, fecha/hora, color)
- [x] Modal de detalle de evento con opción de eliminar
- [x] Widget de próximos eventos en el dashboard

---

## Pendiente

### 📅 Fase 6: Integración Supabase (Estimado: 4-5 días)
- [ ] Crear proyecto en Supabase Console
- [ ] Configurar variables de entorno (.env.local)
- [ ] Ejecutar migración SQL (crear tablas profiles, students, payments, events)
- [ ] Habilitar Row Level Security (RLS)
- [ ] Conectar AuthContext con Supabase Auth (signInWithPassword)
- [ ] Reemplazar servicios mock con queries reales de Supabase
- [ ] Probar persistencia de datos y flujo completo
- [ ] Despliegue en Vercel

### 🎨 Mejoras Futuras
- [ ] Modo oscuro
- [ ] Notificaciones de pagos pendientes
- [ ] Reportes PDF de pagos
- [ ] Dashboard con gráficos interactivos (recharts)
- [ ] Módulo de asistencias
- [ ] Roles y permisos avanzados (admin, teacher, staff)
- [ ] Drag & drop en calendario
- [ ] PWA para acceso móvil offline

---

## Progreso Actual

**Completado:** 5/6 fases (83%)
**Pendiente:** Integración con Supabase

---

## Credenciales de Prueba

- **Email:** admin@liahona.edu
- **Contraseña:** admin123

## Comandos

```bash
pnpm dev      # Iniciar servidor de desarrollo
pnpm build    # Construir para producción
pnpm lint     # Ejecutar linter
```