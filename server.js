require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session');
const SECRET_SESSION = process.env.SECRET_SESSION;
const passport = require('./config/ppConfig');
const flash = require('connect-flash');
const axios = require('axios');
////////////////////////////////////////////////////////////////////////
var db = require('./models');
//////////////////////////////////////////// METHOD OVERRIDE
const methodOverride = require('method-override');

// require the authorization middleware at the top of the page
const IsLoggedIn = require('./middleware/isLoggedIn');

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);
//////////////////////////////////////////// METHOD OVERRIDE
app.use(methodOverride('_method'));

// secret: what we actually giving the user to use our site // session cookie
// resave: save the session even if it's modified, make this false
// saveInitialized: if we have a session, we'll save it, therefore,
// setting this to true

app.use(session({
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized: true
}));

// initialize passport and run session as middleware
app.use(passport.initialize());
app.use(passport.session());

// flash for temporary message to the user
app.use(flash());

// middleware to have our messages accessible for every view
app.use((req, res, next) => {
  // before every route, we will attach our user to res.local
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

// app.get('/', (req, res) => {

//   res.render('index', { alerts: res.locals.alerts });
// });

///////////////////////////////////////////////////////////////////////////// home page shows
app.get('/', (req, res) => {
  
  axios.get('https://api.jikan.moe/v3/genre/anime/27')
  .then((response) => {
    let results = response.data.anime;
    console.log(response.data.anime)
    // setting variable to our data
    res.render('index', {shows: results});
    // render home with the data
  })
  .catch(err => {
    console.log("you done goofed", err)
  })
})

///////////////////////////////////////////////////////////////////////////// details page 

app.get('/details/:show_id', (req, res) => {
  let i = req.params.show_id;

  axios.get(`https://api.jikan.moe/v3/anime/${i}`)
  .then((response) => {
    let results = response.data;
    // console.log(response.data)
    res.render('details', {shows: results})
  })
  .catch(err => {
    console.log('err')
  })

})

//////////////////////////////////////////////////////////////////////////// Title search

app.get('/results', (req, res) => {
  let search = req.query.searchTitle;
  // const fixTitle = s.split(" ").join("%20")
  let qs = {
    params: {
      s: search
    }
  }
  console.log("test", search)
  axios.get(`http://api.jikan.moe/v3/search/anime/?q=${search}`, qs)
  .then((response) => {
      console.log("wrong route")
      let result = response.data.results;
      // setting variable to our data
      res.render('results', {shows: result});
      // render home with the data
  })
  .catch(err => {
      console.log("you done goofed", err)
  })
})

//////////////////////////////////////////////////////////////////////////// Genre search

app.get('/genreResults', (req, res) => {
  let search = req.query.genreTitle;
  
  let qs = {
    params: {
      s: search
    }
  }
  console.log("test", search)
  axios.get(`https://api.jikan.moe/v3/genre/anime/${search}`, qs)
  .then((response) => {
      console.log("correct route")
      let result = response.data.anime;
      // setting variable to our data
      res.render('genreResults', {shows: result});
      // render home with the data
  })
  .catch(err => {
      console.log("you done goofed", err)
  })
})

//////////////////////////////////////////////////////////////////////////// favorite shows


app.get('/profile', (req, res) => {
  // TODO: Get all records from the DB and render to view

  // db.users_shows.findAll()
  db.show.findAll()
    .then(favorites => {
      for (let i=0; i < favorites.length; i++){
        let eachFavorite = favorites[i];
        console.log(eachFavorite.get())
      }
      res.render('profile', {favorites: favorites});

    })
   .catch(error => {
    console.log("Not Found", error)
  })
});




  app.post('/profile', (req, res) => {
    // TODO: Get form data and add a new record to DB
      // console.log(req.body.title);
      db.show.findOrCreate({
        where: {
          title: req.body.title
        },
        defaults: {
          image: req.body.image
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
          res.redirect("/profile");
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

  
app.delete('/profile', (req, res) => {
  
  db.users_shows.destroy({
    where: {
      userId: req.user.id,
      titleId: req.eachFavorite
    }
    .then(([favorite, favoriteDeleted]) => {
      res.redirect("/profile");

    })
    .catch(error => {
      res.status(404).send("error", error)
    })
  })
  
});



////////////////////////////////////////
app.get('/profile', IsLoggedIn, (req, res) => {
  res.render('profile');
});

app.use('/auth', require('./routes/auth'));
// app.use('/shows', require('./routes/shows'));


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${port} 🎧`);
});

console.log('hey there');

module.exports = server;
