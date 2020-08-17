const express = require('express');
const router = express.Router();
const db = require('../models')
const passport = require('../config/ppConfig')

router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.post('/signup', (req, res) => {
  console.log(req.body);
  db.user.findOrCreate({
    where: {
      email: req.body.email
    },
    defaults: {
      name: req.body.name,
      password: req.body.password
    }
  })
  .then(([user, created]) => {
    if(created){
      // if created, success and redirect
      console.log(`${user.name} was created`)
      // FLASH MESSAGE
      passport.authenticate('local', {
        successRedirect: '/',
        successFlash: 'Account created and logging in'
      })(req, res);
      // res.redirect('/');
    } else {
      // Email already exists
      console.log('Email already exists');
      // FLASH MESSAGE
      req.flash('error', 'Email already exists. Please try again.')
      res.redirect('/auth/signup');
    }
  })
  .catch(err => {
    console.log('error', err);
    req.flash('error', `Error, unfortunately... ${err}`);
    res.redirect('/auth/signup');
  });

});
// FLASH MESSAGE
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  successFlash: 'Welcome back.',
  failureFlash: 'Email or password incorrect, please try again.'
}));

// router.post('/login', (req, res) => {

// })

router.get('/logout', (req, res) => {
  req.logOut();
  // FLASH MESSAGE
  req.flash('success', 'See you soon. Logging out.');
  res.redirect('/');
})

module.exports = router;
