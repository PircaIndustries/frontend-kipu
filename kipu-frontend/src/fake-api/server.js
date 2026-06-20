import jsonServer from 'json-server';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'kipudb.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(express.json({ limit: '50mb' }));
server.use(express.urlencoded({ limit: '50mb', extended: true }));

// Custom Route para Autenticación
server.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Obtenemos la instancia de base de datos
    const db = router.db; 
    const users = db.get('team-users').value();
    
    let user = null;
    if (users && users.length > 0) {
        user = users.find(u => u.email === email);
    }
    
    if (user) {
        // Retornamos el usuario encontrado agregándole un token falso
        res.status(200).json({
            ...user,
            token: 'mock-jwt-token-123'
        });
    } else {
        // Fallback: Si no se encuentra en db.json pero ingresa cualquier otro correo local
        res.status(200).json({
            id: 'mock-local-user',
            email: email || 'invitado@local.com',
            fullName: 'Usuario Invitado Local',
            role: 'Gestor Operativo',
            token: 'mock-jwt-token-123'
        });
    }
});

// Puedes añadir cualquier otra ruta personalizada aquí en el futuro

server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`JSON Server con Auth está corriendo en http://localhost:${PORT}`);
});
