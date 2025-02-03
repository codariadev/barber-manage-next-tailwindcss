import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = require('../../functions/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { uid, empresa, nivel } = req.body;

    try {
      await admin.auth().setCustomUserClaims(uid, { empresa, nivel });
      res.status(200).json({ message: 'Custom Claims definidas com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
