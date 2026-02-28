// Firebase Admin SDK Configuration (Server-side only)
import * as admin from 'firebase-admin';

// Prevent multiple initializations
if (!admin.apps.length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-misrak-shemeta';
  const isEmulator = process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST;

  // For emulator mode, use minimal config without credentials
  if (isEmulator) {
    admin.initializeApp({
      projectId: projectId,
    });
  } else {
    // Production mode - require service account
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }

    const serviceAccount = JSON.parse(serviceAccountKey);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId,
    });
  }
}

// Export instances
// Note: Firebase Admin SDK automatically uses FIRESTORE_EMULATOR_HOST environment variable
// No need to call settings() manually - it's handled by the SDK
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
export const FieldValue = admin.firestore.FieldValue;
export const FieldPath = admin.firestore.FieldPath;

export default admin;
