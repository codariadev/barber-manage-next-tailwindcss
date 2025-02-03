import admin from 'firebase-admin';

// Inicializa Firebase Admin se ainda não estiver inicializado
if (!admin.apps.length) {
  const serviceAccount = require('../../functions/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { idToken } = req.body;

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email } = decodedToken;

      const user = await admin.auth().getUser(uid);
      const claims = user.customClaims || {};

      res.status(200).json({ uid, email, claims });
    } catch (error) {
      res.status(401).json({ error: 'Token inválido' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
