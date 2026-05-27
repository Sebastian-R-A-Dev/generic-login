# generic-login

Frontend minimal para gestión de autenticación (login / register) construido con Next.js + TypeScript.

Descripción
- Proyecto cliente que ofrece formularios de inicio de sesión, registro y cambio obligatorio de contraseña.
- Se integra con un backend (ArcadeCore) mediante llamadas HTTP (axios) y gestiona redirecciones post-login.

Estructura y archivos clave
- `app/` — App Router de Next.js; la entrada principal redirige a `/login`.
- `app/login/page.tsx`, `app/register/page.tsx` — páginas públicas para autenticación.
- `components/LoginForm.tsx`, `components/RegisterForm.tsx`, `components/MandatoryPasswordChange.tsx` — UI y lógica de formularios.
- `services/login/` — llamadas HTTP y lógica de autenticación (`http.ts`, `login.service.ts`, `register.service.ts`, `complete-password-change.service.ts`).
- `lib/` — utilidades para handling de redirecciones, apps registradas, iniciales y parsing de respuestas.

Funcionamiento resumido
- El formulario envía credenciales a la API definida por `NEXT_PUBLIC_ARCADECORE_API_BASE_URL`.
- La API debe devolver `redirect_url` y `access_token` en respuestas exitosas; el cliente decide la redirección final.
- Si el backend indica `pendingPasswordChange`, la UI muestra el flujo para forzar cambio de contraseña.

Requisitos y dependencias
- Node >= 18 compatible con Next.js 15
- Dependencias principales: `next`, `react`, `axios`, `tailwindcss`.

Variables de entorno recomendadas
- `NEXT_PUBLIC_ARCADECORE_API_BASE_URL` — origen del backend (ej. https://api.example.com)
- `NEXT_PUBLIC_SUPPORT_EMAIL` — correo de soporte mostrado en UI (opcional)

Ejecutar localmente
```bash
npm install
npm run dev
```

Rutas importantes
- `/login` — iniciar sesión
- `/register` — crear cuenta

Notas
- La configuración de redirecciones y aplicaciones registradas se maneja desde `lib/registered-apps` y parámetros de query `redirect-to` / `redirect_url`.
- Revisa `services/login/http.ts` para ajustar `withCredentials` o el tiempo de espera según tu backend.

Contacto
- Soporte: variable `NEXT_PUBLIC_SUPPORT_EMAIL` o `support@example.com` por defecto.
