require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session');
const SECRET_SESSION = process.env.SECRET_SESSION;
const passport = require('./config/ppConfig');
const flash = require('connect-flash');
const axios = require('axios');
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

///////////////////////////////////////////////////////////////////////////// userInfo


app.get("/userInfo")



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
app.post('/details/:show_id', (req, res) => {
  let i = req.params.show_id;

  db.show.findOrCreate({
    where: {
      title: req.body.title
    },
    defaults: {
      image: req.body.image,
      apiId: i
    }
  })
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
//////////////////////////////////////////////////////////////////////////// Comment post route

app.post('/details/:show_id', (req, res) => {
  db.show.findOne({
    where: {
      apiId: req.params.show_id
    },
    defaults: {
      title: req.body.title,
      image: req.body.image
    }
    
  })
  .then((show) =>{
    db.comment.create({
      where: {
        userId: req.user.id,
        showId: show.id,
        content: req.body.content
      }
      
    })
    .then((response) => {
      let results = response.data.anime;
      console.log(response.data.anime)
      // setting variable to our data
      res.render('details/:show_id', {comment: results});
      // render home with the data
    })
    .catch(err => {
      console.log("you done goofed", err)
    })
    .then(([comment, favoriteCreated]) => {
      console.log(comment.get())
      res.redirect("back");
    })
    .catch(error => {
      res.status(404).send("error", error)
    })
  })
  .catch(error => {
    res.status(404).send("error", error)
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
/////////////////////////////////////////////////////////////////////////////////// favorite shows

//////////////////////////////////////////////////////////// Favorite Get Route
app.get('/favorites', (req, res) => {
  // TODO: Get all records from the DB and render to view
  // If there is no user redirect to index
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
  app.post('/favorites', (req, res) => {
    // TODO: Get form data and add a new record to DB
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
app.delete('/favorites/:id', (req, res) => {
  
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
/////////////////////////////////////////////////////////////////////////////////// pin shows

//////////////////////////////////////////////////////////// pin Get Route
app.get('/watch_list', (req, res) => {
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
app.post('/watch_list', (req, res) => {
    
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
app.delete('/watch_list/:id', (req, res) => {
  
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
app.put('/watch_list/:id', (req,res) => {
  
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
////////////////////////////////////////
app.get('/favorites', IsLoggedIn, (req, res) => {
  res.render('favorites');
});

app.use('/auth', require('./routes/auth'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${port} 🎧`);
});

module.exports = server;
