const Sauce = require('../models/sauce');
const fs = require('fs'); // donne accès aux différentes opérations lié au système de fichier 


exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce); // On obtient un objet utilisable grace à JSON.parse()
    delete sauceObject._id; //Avant de copier l'objet on retire l'id provenant du front-end
    const sauce = new Sauce({ //nouvelle instance de notre modéle "Sauce"
        ...sauceObject,
        // opérateur spread "..." utilisé pour copier tous les éléments du body de notre requête 
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        // On récupére les segments de l'image modifié précédemment par multer
    });
    sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) =>{
    const sauceObject = req.file ? // Si req.file existe alors
    { //On récupére les infos comme pour post 
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { // sinon on prend simplement le corps de la requête
        ...req.body};
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject,  _id: req.params.id })
    /*Mise à jour la sauce dans notre base de donnée, le premier argument est l'objet de comparaison,
    et le second c'est le nouvel objet en utilisant le spread pour récup la sauce dans le corps de la requete. */
    .then(() => res.status(200).json({ message: 'Sauce modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) // on trouve le fichier avec son id
      .then(sauce => {  // récupération du nom du fichier précis
        const filename = sauce.imageUrl.split('/images/')[1]; // on split pour retrouver le bon nom
        fs.unlink(`images/${filename}`, () => { //fs.unlink nous permet de le supprimer du système
            Sauce.deleteOne({ _id: req.params.id })
            // On passe un objet (id) correspondant au fichier à supprimer de la base
            .then(() => res.status(200).json({ message: 'Sauce supprimé !'}))
            .catch(error => res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }))
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find() 
    //methode "find()" renvoie le tableau contenant toutes les sauces
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }))
};