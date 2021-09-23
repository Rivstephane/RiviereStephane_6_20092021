const emailValidator = require('validator'); 

module.exports = (req, res, next) =>{
    if (!emailValidator.isEmail(req.body.email)){
        return res.status(400).json({error: "email pas valide: exemple@domaine.fr"})
    } else{
        next();
    }
};