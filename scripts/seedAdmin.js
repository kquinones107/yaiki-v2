import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Script para crear el usuario administrador en Firebase Auth y Firestore
const admin = require('firebase-admin');

// ⚠️ DESCARGA TU SERVICE ACCOUNT KEY DESDE FIREBASE CONSOLE Y COLÓCALO AQUÍ O USA VARIABLES DE ENTORNO
// Firebase Console -> Configuración del proyecto -> Cuentas de servicio -> Generar nueva clave privada
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = getAuth();
const db = getFirestore();

async function createAdminUser(email, password) {
  try {
    // 1. Crear usuario en Auth
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log('El usuario ya existe en Auth:', user.uid);
    } catch {
      user = await auth.createUser({
        email,
        password,
        emailVerified: true,
      });
      console.log('Usuario creado exitosamente en Firebase Auth con UID:', user.uid);
    }

    // 2. Registrar como Admin en Firestore (colección "admins")
    await db.collection('admins').doc(user.uid).set({
      email: email,
      isAdmin: true,
      createdAt: new Date(),
    });

    console.log('✅ El usuario', email, 'ha sido registrado correctamente como Administrador.');
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error);
  }
}

// Ejecutar con el correo y clave deseados
const emailAdmin = process.argv[2] || 'admin@yaiki.com';
const passAdmin = process.argv[3] || 'YaikiAdmin2026!';

createAdminUser(emailAdmin, passAdmin);
