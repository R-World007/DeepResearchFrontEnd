import { FirebaseError, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  initializeAuth,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const getAuthErrorMessage = (error: unknown) => {
  if (!(error instanceof FirebaseError)) {
    return 'Google sign-in failed. Please try again.';
  }

  switch (error.code) {
    case 'auth/unauthorized-domain':
      return `This app's current domain (${window.location.origin}) is not authorized in Firebase Authentication. Add it under Authentication > Settings > Authorized domains.`;
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in popup was closed before finishing. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'A previous sign-in popup is still in progress. Please try again.';
    case 'auth/account-exists-with-different-credential':
      return 'That email is already linked to a different sign-in method.';
    default:
      return error.message || 'Google sign-in failed. Please try again.';
  }
};

export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/web-storage-unsupported' ||
        error.code === 'auth/operation-not-supported-in-this-environment'
      )
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    throw new Error(getAuthErrorMessage(error));
  }
};

export const logout = () => signOut(auth);
