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

    // Parse the service account key
    // The key might have escaped newlines (\n) that need to be converted to actual newlines
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (parseError) {
      // If parsing fails, try replacing escaped newlines with actual newlines
      try {
        const fixedKey = serviceAccountKey.replace(/\\n/g, '\n');
        serviceAccount = JSON.parse(fixedKey);
      } catch (secondError) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
        console.error('Original error:', parseError);
        console.error('Second attempt error:', secondError);
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format');
      }
    }

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
