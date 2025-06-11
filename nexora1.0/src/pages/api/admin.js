import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { collection, documentId, action, data } = req.body;

  if (!collection || !documentId || !action) {
    return res.status(400).json({ message: 'Collection, document ID, and action are required.' });
  }

  try {
    const docRef = doc(db, collection, documentId);

    if (action === 'delete') {
      await deleteDoc(docRef);
      return res.status(200).json({ message: `Deleted ${documentId} from ${collection} successfully!` });
    } else if (action === 'add') {
      await setDoc(docRef, data, { merge: true });
      return res.status(200).json({ message: `Updated ${documentId} in ${collection} successfully!` });
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "add" or "delete".' });
    }
  } catch (error) {
    console.error('Error updating database:', error);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
}