# ☕ LatteList – Front end (Angular 22)

Aplicación web para **descubrir cafés, reseñarlos y guardarlos en listas**.
Trabajo Práctico Final de Programación IV (2026).

Consume por HTTP real el back end Spring Boot del proyecto
([LatteList2026](https://github.com/CintiaSalazar1993/LatteList2026): JWT + roles + MySQL).
**No usa json-server ni mocks.**

> El diseño visual (paleta, tipografías, logo en taza, granos de puntuación, ruleta, modales) está adaptado del front de una compañera del equipo y combinado con la estructura de código vista en la materia.

## Equipo
- Cintia Salazar
- Avril Traverso

## Tecnologías
- **Angular 22**: componentes standalone, **signals** (`signal`, `computed`, `effect`, `input()`, `output()`, `viewChild`), control flow `@if / @for`
- **Guards** funcionales por rol e **interceptor** que agrega el JWT
- Formularios reactivos (`FormGroup`, `FormControl`, `Validators`) con `[ngClass]`, un `ControlValueAccessor` propio (selector de granos) y `ngModel` en los filtros
- `HttpClient` (GET, POST, PUT, DELETE) con `subscribe({ next, error })`
- **Chart.js** para los gráficos
- **Cloudinary** solo para guardar las imágenes de los logos (el resto de los datos vive en MySQL)
- HTML + CSS propio (sin framework), responsive, fuentes autoalojadas (`@fontsource`)

## Requisitos
- **Node.js ≥ 22.22.3** (o 24 LTS) y npm
- Back end corriendo en `http://localhost:8080` (ver su README). Si cambia la URL: `src/app/config.ts`

## Cómo correrlo
```bash
npm install
npm start          # http://localhost:4200
npm run build      # build de producción en dist/
```
Usuario ADMIN inicial: `admin@lattelist.com` / `Admin1234`.
Con los datos de demostración del back también hay clientes y dueños (`Demo1234`); si no, se crean desde **Crear cuenta**.

## Configuración de Cloudinary (logos de los cafés)
Los logos no se guardan en la base de datos: se suben a Cloudinary y MySQL guarda solamente el link (`logo`).

1. Crear una cuenta gratuita en Cloudinary.
2. Crear un *upload preset* en modo **Unsigned**.
3. Completar en `src/app/config.ts` con los datos propios:
```ts
export const CLOUDINARY_CLOUD_NAME = 'tu-cloud-name';
export const CLOUDINARY_PRESET = 'tu-preset';
```
No se usa ninguna clave privada en el front.

## Roles y qué puede hacer cada uno
El sistema tiene tres roles: **CLIENTE**, **DUENIO** y **ADMIN**.

| Rol | Rutas | Acciones |
|---|---|---|
| **CLIENTE** | `/cafes`, `/cafes/:id`, `/listas`, `/listas/:id`, `/mis-resenas`, `/perfil` | Buscar, filtrar y **ordenar** cafés, café sorpresa, reseñar, **editar** y borrar sus reseñas, **CRUD de listas**, ruleta sobre una lista |
| **DUENIO** | `/mis-cafes`, `/resenas-recibidas`, `/cafes/nuevo`, `/cafes/:id/editar` | **CRUD de cafés propios** (con logo), métricas y gráficos, ver las reseñas que reciben |
| **ADMIN** | `/dashboard`, `/admin/cafes`, `/admin/usuarios`, `/admin/resenas`, `/cafes/nuevo` | Métricas globales, **CRUD de usuarios**, alta de cafés a nombre de un dueño y baja, ver/filtrar/eliminar todas las reseñas |

Una persona **sin sesión iniciada** solo puede ver la página de inicio (`/`), registrarse (`/registro`) e iniciar sesión (`/login`).

## Seguridad (guards e interceptor)
Carpeta `src/app/guards/`:
- `auth-guard.ts` → `authGuard`: exige sesión y **valida el token contra el back** (`GET /api/usuarios/me`). Si el back lo rechaza, cierra la sesión y manda a `/login`.
- `invitado-guard.ts` → `invitadoGuard`: inicio, login y registro solo para quien no tiene sesión iniciada.
- `rol-guard.ts` → `rolGuard(...roles)`: exige uno de los roles; si no, avisa y redirige al inicio del rol.

`src/app/interceptors/auth.interceptor.ts` agrega `Authorization: Bearer <jwt>` a las peticiones que van **a la API propia** (no a servicios externos como Cloudinary) y cierra la sesión ante un `401`.

El back valida los permisos de verdad (`@PreAuthorize`); los guards del front son la capa de experiencia de usuario. Por ejemplo, un cliente que intenta modificar un café recibe `403` del back aunque se saltee el front.

## Estructura
```
src/app
├── models/         Usuario, Cafe, CafeResumen, Resena, Lista, Metricas, AuthResponse (interfaces)
├── services/       auth, usuario, cafe, resena, lista, metricas, imagen (Cloudinary),
│                   filtros-cafes, notificaciones, confirm (HttpClient + DI en el constructor)
├── guards/         auth-guard, invitado-guard, rol-guard
├── interceptors/   auth.interceptor (JWT en las peticiones a la API)
├── components/     header, footer, cafe-card, taza-logo, granos, selector-granos, costo, ruleta,
│                   grafico, modal, confirm-dialog, estado-vacio, toasts
├── pages/          home, login, registro, cafe-list, cafe-detalle, cafe-form, mis-cafes, listas,
│                   lista-detalle, mis-resenas, resenas-recibidas, perfil,
│                   dashboard, usuarios, admin-cafes, admin-resenas, errores
├── utils/          errores.ts (traduce errores del backend), etiquetas.ts (textos y grupos),
│                   formato.ts (fechas y números), imagen.ts (achica la imagen antes de subirla)
├── app.routes.ts   rutas (paramétricas, con guards)
└── config.ts       URL del backend y datos de Cloudinary
```

## Requisitos funcionales
- **RF1:** El sistema debe permitir al cliente, al dueño y al admin iniciar sesión.
- **RF2:** El sistema debe permitir al cliente, al dueño y al admin cerrar sesión.
- **RF3:** El sistema debe permitir al cliente, al dueño y al admin hacer un ABM de su cuenta.
- **RF4:** El sistema debe permitir al cliente, al dueño del café y al admin visualizar la ficha de un café, incluyendo su puntuación promedio general, de precio y de atención.
- **RF5:** El sistema debe permitir al cliente, al dueño y al admin visualizar todos los cafés.
- **RF6:** El sistema debe permitir al cliente, al dueño y al admin filtrar los cafés.
- **RF7:** El sistema debe permitir al cliente, al dueño y al admin ordenar los cafés por nombre, puntuación promedio o costo.
- **RF8:** El sistema debe permitir al cliente hacer un alta y baja de sus reseñas.
- **RF9:** El sistema debe permitir al cliente visualizar sus reseñas.
- **RF10:** El sistema debe permitir al cliente hacer listas personalizadas de cafés.
- **RF11:** El sistema debe permitir al cliente, al dueño y al admin visualizar todas las reseñas de un café.
- **RF12:** El sistema debe permitir al cliente visualizar sus listas personalizadas.
- **RF13:** El sistema debe permitir al cliente hacer un ABM de sus listas.
- **RF14:** El sistema debe permitir al cliente visualizar su perfil.
- **RF15:** El sistema debe permitir al dueño del café visualizar su perfil.
- **RF16:** El sistema debe permitir al admin hacer un AB de cafés.
- **RF17:** El sistema debe permitir al dueño del café visualizar sus cafés.
- **RF18:** El sistema debe permitir al dueño del café hacer un ABM de sus cafés.
- **RF19:** El sistema debe permitir al admin hacer un AB de usuarios.
- **RF20:** El sistema debe permitir al admin visualizar usuarios.
- **RF21:** El sistema debe permitir al admin filtrar usuarios.
- **RF22:** El sistema debe permitir al admin hacer una baja de reseñas.
- **RF23:** El sistema debe permitir al cliente editar una reseña que escribió.
- **RF24:** El sistema debe permitir sugerir un café aleatorio al cliente, pudiendo limitar el sorteo a los cafés que cumplan los filtros aplicados.
- **RF25:** El sistema debe permitir al dueño ver las métricas de sus cafés (cantidad de reseñas, puntuación promedio y ranking).
- **RF26:** El sistema debe permitir al dueño ver las reseñas recibidas en sus cafés.
- **RF27:** El sistema debe permitir al admin ver y filtrar todas las reseñas por café o por puntaje.
- **RF28:** El sistema debe permitir al admin ver métricas globales del sistema.
- **RF29:** El sistema debe permitir al cliente sortear un café al azar de una de sus listas.
- **RF30:** El sistema debe permitir al admin crear un café a nombre de un dueño.
- **RF31:** El sistema debe permitir al dueño del café y al admin subir una imagen como logo de un café.
- **RF32:** El sistema debe exigir al cliente, al dueño y al admin su contraseña actual para poder cambiarla.
- **RF33:** El sistema debe impedir que un cliente escriba más de una reseña sobre el mismo café.
- **RF34:** El sistema debe mostrar al admin y al dueño el ranking de cafés ordenado por puntuación promedio.

## Requisitos no funcionales
- **RNF1:** La búsqueda de cafés se actualiza mientras el usuario escribe, sin necesidad de confirmar.
- **RNF2:** Los filtros aplicados se conservan en la URL, para poder recargar o compartir la búsqueda.

## Temas de la cursada aplicados
| Tema | Dónde se ve |
|---|---|
| Componentes (.ts / .html / .css) | `components/` y `pages/` |
| Data binding (interpolación, property, event, `[(ngModel)]`) | filtros de `pages/cafe-list`, `pages/usuarios`, `pages/admin-resenas` |
| Directivas estructurales `@if` / `@for` | todas las vistas |
| Comunicación entre componentes (`input()` / `output()`) | `cafe-card`, `taza-logo`, `modal`, `ruleta` |
| Enrutamiento, `routerLink`, `router-outlet`, rutas paramétricas | `app.routes.ts`, `header`, `cafes/:id`, `listas/:id` |
| Models | `models/` |
| Formularios reactivos + Validators + `ngClass` | `login`, `registro`, `cafe-form`, `perfil`, `mis-resenas` |
| Servicios + Singleton + inyección de dependencias | `services/` |
| `ngOnInit` | páginas que cargan datos |
| `HttpClient`: GET / POST / PUT / DELETE | `services/` y `pages/` |
| Signals | `AuthService`, páginas y componentes |
| Guards e interceptor | `guards/`, `interceptors/`, `app.routes.ts` |

## CRUDs
1. **Cafés** (DUENIO/ADMIN): `/cafes/nuevo`, `/cafes/:id/editar`, `/mis-cafes`, `/admin/cafes`.
2. **Listas de cafés** (CLIENTE): crear, renombrar, eliminar, agregar y quitar cafés.
3. **Usuarios** (ADMIN): listar con filtros, ver detalle, crear, eliminar.
4. **Reseñas** (CLIENTE): crear, ver, editar y eliminar.

## Decisiones de diseño
- **Guards + back como autoridad:** los guards mejoran la experiencia (no mostrar pantallas que no corresponden), pero la seguridad real está en el back con JWT y `@PreAuthorize`.
- **El guard valida el token contra el back:** un token vencido o falso no alcanza para entrar a las pantallas protegidas.
- **Interceptor limitado a la API propia:** el token no viaja a servicios de terceros como Cloudinary.
- **Imágenes fuera de MySQL:** las imágenes pesan mucho para una base de datos. Se suben a Cloudinary y en MySQL queda solo el link.
- **Funciones y diccionarios simples:** el formato de fechas y números y los textos de las etiquetas se resuelven con funciones y diccionarios en `utils/`, y el estado con signals, para mantener el código simple y dentro de lo visto en la materia.
- **Filtros en la URL:** se pueden recargar o compartir las búsquedas.

## Flujo de trabajo en Git
Commits chicos y descriptivos por integrante, sobre la rama `master`.