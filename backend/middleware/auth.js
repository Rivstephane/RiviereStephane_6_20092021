const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1]; 
        // on récupére les différentes données après le bearer 
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); 
        // On utilise la fonc verify pour décoder le token si pas valide => erreur
        const userId = decodedToken.userId; // extraction de l'id user du token
        if(req.body.userId && req.body.userId != userId) { // on compare id user à celle du token
            throw 'User ID non valable !'; // Si différentes, on génére erreur
        }else{
            next(); // Sinon tout fonctionne et on passe la requête au prochain middleware
        }
    } catch (error){
        res.status(401).json({ error: error | 'Requête non authentifié !'})
    }
};