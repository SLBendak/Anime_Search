const express = require('express');
const router = express.Router();
const db = require('../models');




/////////////////////////////////////////////////////////////////////////////////// favorite shows

//////////////////////////////////////////////////////////// Favorite Get Route
router.get('/', (req, res) => {
    if(!req.user) {
      res.redirect('/')
      return
    }
    
    const userId = req.user.dataValues.id;
  
    db.user.findByPk(userId, {
      include: [{
        model: db.show
      }]
    })
    .then(user => {
      res.render('favorites', {favorites: user.shows})
    })
    .catch(error => {
      console.log("Not Found", error)
      res.sendStatus(500)
    })
  });
  //////////////////////////////////////////////////////////// Favorite Post Route
    router.post('/', (req, res) => {
        db.show.findOrCreate({
          where: {
            title: req.body.title
          },
          defaults: {
            image: req.body.image,
            apiId: req.body.mal_id
          }
        })
        .then(([show, showCreated]) =>{
          db.users_shows.findOrCreate({
            where: {
              userId: req.user.id,
              showId: show.id
            }
          })
          .then(([favorite, favoriteCreated]) => {
            console.log(favorite.get())
            res.redirect("/favorites");
          })
          .catch(error => {
            res.status(404).send("error", error)
          })
        })
        .catch(error => {
          res.status(404).send("error", error)
        })
    });
  //////////////////////////////////////////////////////////////////////////// delete favorite shows
  router.delete('/:id', (req, res) => {
    
    db.users_shows.destroy({
      where: {
        userId: req.user.dataValues.id,
        showId: req.params.id
      }
    })
    .then(() => {
      res.redirect("/favorites");
    })
    .catch(error => {
      res.status(404).send(error)
    })
  })




module.exports = router;