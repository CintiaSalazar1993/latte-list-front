# ☕ LatteList – Front end (Angular 22)

Aplicación web para **descubrir cafés, reseñarlos y guardarlos en listas**. Trabajo Práctico Final – UTN Mar del Plata.
Consume por HTTP real el back end Spring Boot del proyecto (JWT + roles + MySQL). **No usa json-server ni mocks.**

> El diseño visual (paleta, tipografías, logo en taza, granos de puntuación, ruleta, modales) está adaptado del front de una compañera del equipo y combinado con la estructura de código vista en la materia.

## Tecnologías
- Angular 22: componentes standalone, **signals** (`signal`, `computed`, `effect`, `input()`, `output()`, `viewChild`), control flow `@if / @for`
- **Guards** funcionales por rol e **interceptor** que agrega el JWT
- Formularios reactivos (`FormGroup`, `FormControl`, `Validators`) con `[ngClass]`, un `ControlValueAccessor` propio (selector de granos) y `ngModel` en los filtros
- `HttpClient` (GET, POST, PUT, DELETE) con `subscribe({ next, error })`
- Chart.js para los gráficos · HTML + CSS propio (sin framework), responsive, fuentes autoalojadas (`@fontsource`)

## Requisitos
- **Node.js ≥ 22.22.3** (o 24 LTS) y npm
- Back end corriendo en `http://localhost:8080` (ver su README). Si cambia la URL: `src/app/config.ts`

## Cómo correrlo
```bash
npm install
npm start          # http://localhost:4200
npm run build      # build de producción en dist/
```
Usuario ADMIN inicial: `admin@lattelist.com` / `Admin1234`. Con `DatosDemo` también hay clientes y dueños (`Demo1234`); si no, se crean desde **Crear cuenta**.

## Roles y qué puede hacer cada uno
| Rol | Rutas | Acciones |
|---|---|---|
| **Invitado** | `/`, `/login`, `/registro` | Ver la landing, registrarse, iniciar sesión |
| **CLIENTE** | `/cafes`, `/cafes/:id`, `/listas`, `/listas/:id`, `/mis-resenas`, `/perfil` | Buscar, filtrar y **ordenar** cafés, café sorpresa, reseñar, **editar** y borrar sus reseñas, **CRUD de listas**, ruleta sobre una lista |
| **DUENIO** | `/mis-cafes`, `/resenas-recibidas`, `/cafes/nuevo`, `/cafes/:id/editar` | **CRUD de cafés propios**, métricas y gráficos, ver las reseñas que reciben |
| **ADMIN** | `/dashboard`, `/admin/cafes`, `/admin/usuarios`, `/admin/resenas`, `/cafes/nuevo` | Métricas globales, **CRUD de usuarios**, alta de cafés a nombre de un dueño y baja, ver/filtrar/eliminar todas las reseñas |

## Seguridad (guards)
`src/app/guards/guards.ts`
- `authGuard`: exige sesión.
- `invitadoGuard`: landing, login y registro solo sin sesión.
- `rolGuard(...roles)`: exige uno de los roles; si no, avisa y redirige al inicio del rol.

`auth.interceptor.ts` agrega `Authorization: Bearer <jwt>` a cada request y cierra la sesión ante un `401`.
El back valida los permisos de verdad (`@PreAuthorize`); los guards del front son la capa de experiencia de usuario.

## Estructura
```
src/app
├── models/         Usuario, Cafe, CafeResumen, Resena, Lista, AuthResponse (interfaces)
├── services/       auth, usuario, cafe, resena, lista, notificaciones, confirm (HttpClient + DI en el constructor)
├── guards/         authGuard, invitadoGuard, rolGuard(...roles)
├── interceptors/   auth.interceptor (JWT en cada petición)
├── components/     navbar, cafe-card, taza-logo, granos, selector-granos, costo, ruleta, grafico,
│                   modal, confirm-dialog, estado-vacio, toasts
├── pipes/          etiqueta, costo, rol
├── pages/          landing, login, registro, cafes, cafe-detalle, cafe-form, mis-cafes, listas,
│                   lista-detalle, mis-resenas, resenas-recibidas, perfil,
│                   dashboard, usuarios, admin-cafes, admin-resenas, errores
├── utils/          errores.ts (traduce errores del backend), etiquetas.ts (textos y grupos)
├── app.routes.ts   rutas (paramétricas, con guards)
└── config.ts       URL base del backend
```

## Requisitos funcionales cubiertos
RF1–RF6 (sesión, cuenta, cafés) · **RF7** ordenar cafés · RF8–RF13 (reseñas y listas) · RF14–RF15 (perfil) · RF16–RF18 (cafés de admin y dueño) · RF19–RF21 (usuarios) · RF22 (baja de reseñas) · **RF23** editar reseña · RF24 café aleatorio · RF25 métricas del dueño · **RF26** reseñas recibidas · **RF27** reseñas del admin con filtros · RF28 métricas globales · RF29 ruleta de lista · RF30 admin crea café para un dueño.

## Temas de la cursada aplicados
| Tema | Dónde se ve |
|---|---|
| Componentes (.ts / .html / .css) | `components/` y `pages/` |
| Data binding (interpolación, property, event, `[(ngModel)]`) | filtros de `pages/cafes`, `pages/usuarios`, `pages/admin-resenas` |
| Directivas estructurales `@if` / `@for` | todas las vistas |
| Comunicación entre componentes (`input()` / `output()`) | `cafe-card`, `taza-logo`, `modal`, `ruleta` |
| Enrutamiento, `routerLink`, `router-outlet`, rutas paramétricas | `app.routes.ts`, `navbar`, `cafes/:id`, `listas/:id` |
| Models | `models/` |
| Formularios reactivos + Validators + `ngClass` | `login`, `registro`, `cafe-form`, `perfil`, `mis-resenas` |
| Servicios + Singleton + inyección de dependencias | `services/` |
| `ngOnInit` | páginas que cargan datos |
| `HttpClient`: GET / POST / PUT / DELETE | `services/` y `pages/` |
| Signals y guards | `AuthService`, `guards/guards.ts`, `app.routes.ts` |

## CRUDs
1. **Cafés** (DUENIO/ADMIN): `/cafes/nuevo`, `/cafes/:id/editar`, `/mis-cafes`, `/admin/cafes`.
2. **Listas de cafés** (CLIENTE): crear, renombrar, eliminar, agregar y quitar cafés.
3. **Usuarios** (ADMIN): listar con filtros, ver detalle, crear, eliminar.
4. **Reseñas** (CLIENTE): crear, ver, editar y eliminar.

## Flujo de trabajo en Git (sugerido)
Una rama por funcionalidad (`feature/login`, `feature/cafes-crud`, …), commits chicos y descriptivos por integrante, y Pull Request hacia `main`.
