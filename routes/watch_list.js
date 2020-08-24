const express = require('express');
const router = express.Router();
const db = require('../models');


/////////////////////////////////////////////////////////////////////////////////// pin shows

//////////////////////////////////////////////////////////// pin Get Route
router.get('/', (req, res) => {
    // TODO: Get all records from the DB and render to view
    // If there is no user redirect to index
    if(!req.user) {
      res.redirect('/')
      return
    }
    
    const userId = req.user.dataValues.id;
  
    db.user.findByPk(userId, {
      include: [{
        model: db.pin
      }]
    })
    .then(user => {
      res.render('watch_list', {pins: user.pins})
    })
    .catch(error => {
      console.log("Not Found", error)
      res.sendStatus(500)
    })
  });
  //////////////////////////////////////////////////////////// pin Post Route
  // TODO: Get form data and add a new record to DB
  router.post('/', (req, res) => {
      
      db.pin.findOrCreate({
        where: {
          title: req.body.title
        },
        defaults: {
          image: req.body.image,
          seen: "no"
        }
      })
      .then(([show, showCreated]) =>{
        db.users_pins.findOrCreate({
          where: {
            userId: req.user.id,
            pinId: show.id
          }
        })
        .then(([pin, pinCreated]) => {
          console.log(pin.get())
          res.redirect("/watch_list");
        })
        .catch(error => {
          res.status(404).send("error", error)
          
        }) 
      })
      .catch(error => {
        res.status(404).send("error", error)
        
      })
  
  });
  //////////////////////////////////////////////////////////////////////////// delete pin shows
  router.delete('/:id', (req, res) => {
    
    db.users_pins.destroy({
      where: {
        userId: req.user.dataValues.id,
        pinId: req.params.id
      }
    })
    .then(() => {
      res.redirect("/watch_list");
    })
    .catch(error => {
      res.status(404).send(error)
    })
  })
  //////////////////////////////////////////////////////////////////////////// update pin showSeen
  router.put('/:id', (req,res) => {
    
    db.pin.update({
      seen: req.body.showSeen
    },{
      where: {
        id: req.params.id
      }
    })
    .then(response => {
      console.log(response)
      res.redirect("/watch_list");
    })
    .catch(error => {
      console.log("error: ", error)
    })
  })

module.exports = router;