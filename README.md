# ✦ Yaiki Accesorios V2 — Documentación del Proyecto

## 📱 Descripción
App móvil moderna desarrollada con **Expo Managed Workflow**, **Expo Router (v4)**, **TypeScript**, y conectada a **Firebase (Authentication, Firestore & Storage)**.

---

## 🔐 Acceso Secreto al Panel Administrador

Para garantizar seguridad y discreción, **el acceso de administrador no es visible públicamente en los menús de la tienda para los clientes**.

### Pasos para ingresar como Administrador:
1. Abre la aplicación e ingresa a la pantalla de **Inicio (Home)**.
2. Toca rápidamente **5 veces seguidas** el logo principal **`✦ YAIKI`** ubicado en la esquina superior izquierda.
3. Se abrirá la ventana modal modal de **Login Administrador (Panel Administrativo)**.
4. Ingresa con tu correo y contraseña configurados.

---

## 🛠️ Configuración Inicial de Administrador en Firebase

Para crear tu primer usuario Administrador:

### Opción A — Desde la Consola de Firebase (Recomendado)
1. Entra a [Firebase Console](https://console.firebase.google.com) -> Tu proyecto `yaikiapp`.
2. Ve a **Authentication** -> **Users** -> Haz clic en **Add User** (Ingresa correo y contraseña). Copia el `User UID`.
3. Ve a **Firestore Database** -> Crea una colección llamada `admins`.
4. Agrega un documento cuyo ID sea exactamente el `User UID` que copiaste.
5. Dentro del documento agrega el campo `isAdmin: true` (boolean) y `email: "tu-correo@..."` (string).

### Opción B — Crear Firestore y Storage Rules
Asegúrate de permitir lectura a todos en `products` y `categories`, pero escritura solo si está en la colección `admins`:

#### Reglas de Firestore recomendadas:
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    match /categories/{category} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /products/{product} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /admins/{adminId} {
      allow read, write: if request.auth != null && request.auth.uid == adminId;
    }
  }
}
```

---

## 🚀 Cómo Ejecutar la App

En la carpeta del proyecto `c:\Users\DimeloFlow07\Downloads\yaiki-v2`:

```bash
# Iniciar Metro Bundler
npx expo start

# Ejecutar en Android (Emulador o celular mediante Expo Go)
npx expo start --android

# Ejecutar en Web
npx expo start --web
```
