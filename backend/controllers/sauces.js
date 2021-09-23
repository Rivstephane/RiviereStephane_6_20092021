const Sauce = require('../models/sauce');
const fs = require('fs'); //      donne accès aux différentes opérations lié au système de fichier
const xss = require('xss');


exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce); //      On obtient un objet utilisable grace à JSON.parse()
    delete sauceObject._id; //      Avant de copier l'objet on retire l'id provenant du front-end
    const sauce = new Sauce({ //      nouvelle instance de notre modéle "Sauce"
        ...sauceObject,
        //      opérateur spread "..." utilisé pour copier tous les éléments du body de notre requête 
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        //      filtrer les entrées des utilisateurs afin d'empêcher les attaques XSS
        name: xss(sauceObject.name),
        manufacturer: xss(sauceObject.manufacturer),
        description: xss(sauceObject.description),
        mainPepper: xss(sauceObject.mainPepper),
        //        On récupére les segments de l'image modifié précédemment par multer
    });
    sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
      {
        ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
//          Mise a jours de la bdd et supression de l'ancienne images si il y en as une
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        if (req.file){
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet modifié !'}))
            .catch(error => res.status(400).json({ error }));
          });
          
        }else{
          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié !'}))
          .catch(error => res.status(400).json({ error }));
        }
      })
      .catch(error => res.status(500).json({ error }));
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
exports.addLike = (req, res, next) => {
  const userLike = req.body.like;
  const userId = req.body.userId;

  Sauce.findOne({ _id: req.params.id })
  .then((sauce) => {
    const usersLiked = sauce.usersLiked
    const usersDisliked = sauce.usersDisliked
    if (userLike == 0) {
      //        recherche de L'utilisateur
      const foundUserLiked = usersLiked.find(usersId => usersId == userId);
      const foundUserDisliked = usersDisliked.find(usersId => usersId == userId);
      //        trouver dans liked suppression dans Usersliked et -1 dans likes
      if (foundUserLiked) {
        Sauce.updateOne({ _id: req.params.id },
        { $pull: { usersLiked: userId }, $inc : {likes: -1}})
        .then(() => res.status(200).json({ message: "L'utilisateur n'aime plus"}))
        .catch(error => res.status(400).json({ error }));
      }
      //      trouver dans dislikedsuppression dans Usersdisliked et -1 dans dislikes
      if (foundUserDisliked){
        Sauce.updateOne({ _id: req.params.id },
        { $pull: { usersDisliked: userId }, $inc : {dislikes: -1}})
        .then(() => res.status(200).json({ message: "L'utilisateur ne déteste plus"}))
        .catch(error => res.status(400).json({ error }));
      }
    }
    //      ajout dans Usersliked et +1 dans likes
    if (userLike == 1) {
      Sauce.updateOne({ _id: req.params.id },
      { $push: { usersLiked: userId }, $inc : {likes: 1}})
      .then(() => res.status(200).json({ message: "L'utilisateur aime"}))
      .catch(error => res.status(400).json({ error }));
    }
    //      ajout dans Usersdisliked et +1 dans dislikes
    if (userLike == -1){
      Sauce.updateOne({ _id: req.params.id },
      { $push: { usersDisliked: userId }, $inc : {dislikes: 1}})
      .then(() => res.status(200).json({ message: "L'utilisateur n'aime pas"}))
      .catch(error => res.status(400).json({ error }));
    }
  })
  .catch((error) => {res.status(404).json({error: error})});
};