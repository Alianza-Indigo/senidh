# SENIDH — Vercel + Neon + Blob

Sitio institucional de la **Sede Nacional de Interventores para los Derechos Humanos**, construido con Next.js para ejecutarse completamente en Vercel.

## Arquitectura

- **Next.js 15 / React 19 / TypeScript**: sitio público y panel administrativo.
- **Neon PostgreSQL**: administradores, delegados, credenciales, contenido, ajustes y mensajes.
- **Vercel Blob**: fotografías de delegados y documentos públicos.
- **Drizzle ORM**: esquema y migraciones versionadas.
- **QR local**: cada credencial abre el perfil individual del delegado dentro de `/directorio`.

## Funciones

- Inicio, Donaciones, Reconocimientos, Convenios, Directorio, Eventos, Oficios, Donar, Identificaciones y Contacto.
- Alta y edición de delegados con fotografía, puesto o cargo, estado, municipio, folio y vigencia.
- Credencial imprimible, frente y reverso, en formato ID-1 con QR único.
- Estados: activa, vencida, suspendida y revocada.
- Directorio público con perfil individual verificable.
- Administración de eventos, convenios, reconocimientos, oficios y documentos.
- Fotografías y archivos almacenados en Vercel Blob.
- Formulario de contacto almacenado en Neon.
- Panel protegido con contraseña cifrada, sesión firmada, cookies seguras, verificación de origen y bloqueo temporal por intentos fallidos.
- Acceso de superadministrador mediante credenciales protegidas en variables de entorno.
- Creación de administradores adicionales desde una sección exclusiva del superadministrador.
- Instalación segura de la primera cuenta administrativa mediante `SETUP_SECRET`.

## Variables de entorno

Copie `.env.example` como `.env.local` para desarrollo y configure las mismas variables en Vercel:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
AUTH_SECRET=una-cadena-aleatoria-de-al-menos-32-caracteres
SETUP_SECRET=clave-temporal-para-crear-el-primer-administrador
SUPERADMIN_EMAIL=correo-del-superadministrador
SUPERADMIN_PASSWORD=contraseña-larga-y-aleatoria
NEXT_PUBLIC_SITE_URL=https://su-dominio.com
```

`AUTH_SECRET` puede generarse con `openssl rand -base64 48`.

## Despliegue en Vercel

1. Importe este repositorio en Vercel.
2. Cree o conecte una base Neon y copie su cadena en `DATABASE_URL`.
3. Cree un almacén Vercel Blob y confirme que `BLOB_READ_WRITE_TOKEN` esté disponible.
4. Configure `AUTH_SECRET`, `SETUP_SECRET`, `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD` y `NEXT_PUBLIC_SITE_URL`.
5. Instale dependencias localmente con `npm ci`.
6. Despliegue el proyecto. El comando de construcción ejecutará automáticamente las migraciones pendientes en Neon antes de compilar la aplicación.
7. Confirme que el despliegue terminó correctamente.
8. Use el botón **Acceso administrativo** o visite `/admin/login` e ingrese con `SUPERADMIN_EMAIL` y `SUPERADMIN_PASSWORD`.
9. Opcionalmente visite `/admin/setup`, capture `SETUP_SECRET` y cree administradores almacenados en Neon.
10. Entre a `/admin/ajustes` y sustituya correo, teléfono, domicilio y datos bancarios provisionales.

Los datos reales de contacto, credenciales, mensajes y delegados se almacenan en Neon y Blob. No los agregue al repositorio público ni a las migraciones.

Si necesita aplicar las migraciones manualmente, ejecute `npm run db:migrate` con `DATABASE_URL` configurada.

## Desarrollo

```bash
npm ci
npm run dev
```

Validación de producción:

```bash
npm run build:app
```

## Rutas administrativas

- `/admin`: resumen.
- `/admin/interventores`: delegados, fotografías, puestos y credenciales.
- `/admin/contenido`: publicaciones y documentos.
- `/admin/mensajes`: comunicaciones recibidas.
- `/admin/ajustes`: contacto, donaciones e identidad institucional.
- `/admin/administradores`: creación y consulta de administradores; acceso exclusivo del superadministrador.
- `/admin/credencial/[id]`: impresión de credencial y QR.

## Consideraciones operativas

- La URL definitiva debe estar configurada en `NEXT_PUBLIC_SITE_URL` antes de imprimir credenciales.
- El QR utiliza un código aleatorio no predecible y dirige al perfil individual del Directorio.
- Las credenciales revocadas se conservan para trazabilidad; no se eliminan.
- Configure copias de seguridad de Neon y políticas de retención de Blob.
- Sustituya el aviso de privacidad provisional antes del lanzamiento público.
