# Seguridad operativa

## Controles incluidos

- Contraseñas con `bcrypt` y costo 12.
- Sesiones JWT firmadas con expiración de ocho horas.
- Cookies `HttpOnly`, `SameSite=Strict` y `Secure` en producción.
- Verificación de origen en todas las mutaciones.
- Bloqueo de cinco minutos después de cinco intentos fallidos.
- Validación de tipo y tamaño antes de subir archivos a Blob.
- Notas internas excluidas del sitio público.
- Revocación lógica de credenciales para conservar trazabilidad.

## Antes de producción

- Use secretos aleatorios distintos para `AUTH_SECRET` y `SETUP_SECRET`.
- Elimine o cambie `SETUP_SECRET` después de crear el primer administrador.
- Limite el acceso al proyecto Vercel, Neon y Blob a personal autorizado.
- Active copias de seguridad y revise periódicamente los registros publicados.
- No cargue documentos con datos personales sin base legal y autorización.
- Revise el aviso de privacidad conforme a la operación real de SENIDH.
