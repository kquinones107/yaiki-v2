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

## 🛍️ Qué puede hacer una clienta dentro de la app

Esta versión responde al rechazo de Apple por la guía **4.2.2 (Minimum Functionality)**:
el pedido ya **no sale de la app** y hay funciones que no existen en el sitio web.

| Función | Pantalla |
| --- | --- |
| Diseñar su propia pulsera pieza por pieza, con precio y largo en vivo | `app/(tabs)/crear.tsx` |
| Guardar diseños y volver a pedirlos | `app/mis-disenos.tsx` |
| Cuenta propia (registro / login con Firebase Auth) | `app/(tabs)/cuenta.tsx` |
| Checkout completo dentro de la app | `app/checkout.tsx` |
| Seguimiento del pedido (Recibido → Preparación → Enviado → Entregado) | `app/order/[id].tsx` |
| Historial de pedidos y repetir pedido | `app/orders.tsx` |
| Favoritos sincronizados con la cuenta | `app/favoritos.tsx` |
| Talla de muñeca guardada en el perfil | `app/(tabs)/cuenta.tsx` |
| Gestión de pedidos y cambio de estado | `app/admin/pedidos.tsx` |

WhatsApp quedó **solo como soporte**, nunca como checkout.

### 💵 Pago contra entrega

El único método de pago es **contra entrega**. La app **no recibe dinero, no procesa pagos y
no pide datos de tarjetas**: la clienta paga en efectivo cuando recibe el pedido. Esto se dice
de forma explícita en el carrito, en el checkout y en el detalle del pedido
(`PAYMENT_NOTICE` en `types/index.ts`).

---

## 🧺 Catálogo base (contenido inicial)

Para que la tienda nunca se vea vacía (ni para el revisor de Apple ni para las primeras
clientas), `constants/seedCatalog.ts` trae **6 categorías y 18 productos reales** con nombres,
precios en COP, descripciones y tags.

- Si Firestore todavía no tiene contenido, la app sirve ese catálogo base automáticamente
  (`orSeed` en `services/productService.ts`).
- Las fotos de respaldo salen de `assets/images/` según la categoría; Yaiki las reemplaza
  subiendo las fotos reales desde el panel.
- En el panel admin, **Acciones Rápidas → Cargar Catálogo Base** copia esos productos a
  Firestore (ids `seed-*`, con `merge`, así que no se duplican) para poder editarlos ahí:
  precios, stock, fotos y disponibilidad.

Los precios y las piezas del diseñador están en `constants/beads.ts`
(`BRACELET_BASE_PRICE`, `BEADS`, `WRIST_SIZES`) y se pueden cambiar sin tocar las pantallas.

---

## 🔒 Reglas de Firestore (actualizar antes de publicar)

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
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
      allow read, write: if isOwner(adminId);
    }

    // Perfil de la clienta + sus favoritos y diseños
    match /customers/{uid} {
      allow read, write: if isOwner(uid) || isAdmin();
      match /{sub=**} {
        allow read, write: if isOwner(uid) || isAdmin();
      }
    }

    // Pedidos: la clienta crea y lee los suyos; el admin ve y actualiza todos
    match /orders/{orderId} {
      allow create: if request.auth != null
        && request.resource.data.customerId == request.auth.uid;
      allow read: if isAdmin()
        || (request.auth != null && resource.data.customerId == request.auth.uid);
      allow update, delete: if isAdmin();
    }
  }
}
```

---

## 🍏 Notas para App Review (pegar en App Store Connect)

Guideline 4.2.2. Sin estas notas el revisor repite la revisión anterior.

```text
Demo account:
  Email: <crear una cuenta de prueba y ponerla aquí>
  Password: <...>

La app NO procesa pagos: el único método es pago contra entrega (efectivo al recibir).
No se piden datos de tarjetas en ningún momento.

Recorrido sugerido:
1. Pestaña "Crear": arma una pulsera tocando piedras, letras y charms. El precio y el
   largo se recalculan en vivo según la talla de muñeca. Toca una pieza del cordón para
   quitarla. Pulsa "Agregar al carrito".
2. Pestaña "Cuenta": crea una cuenta o entra con la cuenta demo. Guarda tu talla de muñeca.
3. Pestaña "Catálogo": abre una pieza, tócale el corazón para guardarla en favoritos.
4. Pestaña "Carrito" → "Finalizar pedido": completa los datos de envío y confirma.
   El pedido se crea DENTRO de la app y recibe un número (YK-XXXXXX-XXXX).
5. "Mis pedidos" → abre el pedido para ver el seguimiento de estado.
6. "Mis diseños": los diseños guardados se pueden volver a pedir con un toque.

Panel de administración (acceso del comercio, no del cliente): en la pantalla de Inicio,
toca 5 veces el logo "✦ YAIKI" de la esquina superior izquierda para abrir el login de
administrador. Desde ahí se gestionan productos, categorías y el estado de los pedidos.
```

> ⚠️ Antes de resubir: crear la cuenta demo en Firebase Auth, actualizar las reglas de
> Firestore de arriba y cargar el catálogo base desde el panel admin.

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
