# Guía de Despliegue en Netlify

## 🚀 Configuración de Variables de Entorno

Para que la aplicación funcione correctamente en Netlify, debes configurar las variables de entorno de Supabase.

### Paso 1: Acceder a la Configuración de Netlify

1. Ve a tu sitio en Netlify: https://app.netlify.com
2. Selecciona tu proyecto "Gestion Avicola"
3. Haz clic en **Site configuration** en el menú lateral
4. Haz clic en **Environment variables** en el menú de configuración

### Paso 2: Agregar las Variables de Entorno

Agrega las siguientes variables una por una:

#### Variable 1: VITE_SUPABASE_URL
```
Key: VITE_SUPABASE_URL
Value: https://ezekogicyqinqxrctmyu.supabase.co
```

#### Variable 2: VITE_SUPABASE_ANON_KEY
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZWtvZ2ljeXFpbnF4cmN0bXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjIzNTgsImV4cCI6MjA3Njk5ODM1OH0.3YuRE9vc5ofG9yAwehgvCcLaX5LHuXzQpUgLtnOUp2s
```

### Paso 3: Guardar y Redesplegar

1. Haz clic en **Save** después de agregar cada variable
2. Ve a **Deploys** en el menú lateral
3. Haz clic en **Trigger deploy** → **Deploy site**
4. Espera a que termine el despliegue (usualmente 1-2 minutos)

---

## 📋 Método Alternativo: Por Línea de Comandos

Si prefieres usar la CLI de Netlify:

```bash
# Instalar Netlify CLI (si no lo tienes)
npm install -g netlify-cli

# Hacer login
netlify login

# Ir al directorio del proyecto
cd Gestion_Avicola

# Configurar las variables de entorno
netlify env:set VITE_SUPABASE_URL "https://ezekogicyqinqxrctmyu.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZWtvZ2ljeXFpbnF4cmN0bXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjIzNTgsImV4cCI6MjA3Njk5ODM1OH0.3YuRE9vc5ofG9yAwehgvCcLaX5LHuXzQpUgLtnOUp2s"

# Redesplegar
netlify deploy --prod
```

---

## 🔍 Verificar la Configuración

Después de agregar las variables y redesplegar:

1. Abre tu sitio en Netlify
2. Abre las **Herramientas de Desarrollador** (F12)
3. Ve a la pestaña **Console**
4. Si NO ves el error "Faltan las variables de entorno de Supabase", ¡está funcionando! ✅

---

## ⚠️ Solución de Problemas

### El error persiste después de agregar las variables

1. **Verifica que las variables están bien escritas:**
   - Los nombres deben ser EXACTAMENTE: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
   - NO debe haber espacios extras antes o después
   - Distinguen entre mayúsculas y minúsculas

2. **Limpia el caché de Netlify:**
   - Ve a **Site configuration** → **Build & deploy**
   - Haz clic en **Clear cache and retry build**

3. **Verifica el comando de build:**
   - En **Site configuration** → **Build & deploy** → **Build settings**
   - El comando de build debe ser: `npm run build`
   - El directorio de publicación debe ser: `dist`

### La página se ve en blanco

1. Verifica que `netlify.toml` esté en la raíz del proyecto
2. Asegúrate de que el redirect SPA esté configurado (ya está en el archivo)

---

## 📁 Archivos de Configuración

### netlify.toml
Este archivo (ya creado) configura:
- Comando de build: `npm run build`
- Directorio de publicación: `dist`
- Redirects para SPA (React Router)
- Headers de seguridad
- Cache para assets

### .env.example
Archivo de ejemplo con las variables necesarias (NO contiene valores reales)

---

## 🔐 Seguridad

**IMPORTANTE:**
- Las variables `VITE_SUPABASE_ANON_KEY` son seguras para exponerse públicamente
- Supabase usa Row Level Security (RLS) para proteger los datos
- NUNCA expongas la `service_role` key en el frontend

---

## 📞 Soporte

Si después de seguir estos pasos sigues teniendo problemas:

1. Revisa los logs de build en Netlify: **Deploys** → Click en el último deploy → **Deploy log**
2. Verifica que las migraciones de Supabase se hayan ejecutado correctamente
3. Comprueba que las tablas existan en tu base de datos de Supabase

---

## ✅ Checklist de Despliegue

- [ ] Variables de entorno agregadas en Netlify
- [ ] Build exitoso (sin errores en el log)
- [ ] Sitio carga sin error de "Faltan las variables de entorno"
- [ ] Puedes crear/ver lotes en la aplicación
- [ ] Las migraciones de Supabase están aplicadas
- [ ] Row Level Security configurado en Supabase

¡Listo! Tu aplicación debería estar funcionando correctamente en Netlify. 🎉
