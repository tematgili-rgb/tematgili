import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'
import { isFirebaseConfigured } from './firebase'

function ensureStorage() {
  if (!isFirebaseConfigured || !storage) throw new Error('Firebase storage is not configured')
  return storage
}

export async function uploadFile(file: File, path: string): Promise<string> {
  const s = ensureStorage()
  const storageRef = ref(s, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function deleteFile(url: string): Promise<void> {
  const s = ensureStorage()
  const storageRef = ref(s, url)
  await deleteObject(storageRef)
}
