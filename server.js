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
  
    db.user.findOne({
      where: {
        id: req.user.id
      }
    })
    .then((user) => {

      axios.get(`https://api.jikan.moe/v3/anime/${i}`)
      .then((response) => {
        let results = response.data;
        
        db.show.findOne({
          where: {
            apiId: i
          },
          include: [db.comment]
        })
        .then((show) => {
          if(show){
            console.log("show found!!!")
            res.render('details', {show: results, sComments: show, user: user})
            return
          }
          db.show.create({
            apiId: i,
            image: results.image_url,
            title: results.title
          })
          .then((newShow) => {
            console.log("NO show found!!!")
            res.redirect(`/details/${i}`)
            return
          })
          .catch(err => {
            console.log(err)
          })
        })
        .catch(err => {
          console.log(err)
        })
      })
      .catch(err => {
        console.log(err)
      })
    })
    .catch(err => {
      console.log(err)
    })
  })

//////////////////////////////////////////////////////////////////////////// Comment post route 
///////////////////

app.post('/details/:show_id', (req, res) => {
  let i = req.params.show_id;

    db.show.findOrCreate({
      where: {
        apiId: i
      },
      defaults: {
        image: req.body.image,
        title: req.body.title
      }
    })
    .then(([show, showCreated]) => {
      db.comment.create({

          userId: req.user.id,
          name: req.user.name,
          showId: show.id,
          content: req.body.content
        
      })
      .then((comment) => {
        res.redirect('/details/' + req.params.show_id);
      })
      .then(([comment, favoriteCreated]) => {
        console.log(comment.get())
        res.redirect("back");
      })
      .catch(err => {
        console.log("you done goofed", err)
      })
      .catch(err => {
        console.log("you done goofed", err)
      })

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
      if(!response){
        req.flash('failure', 'Sorry not found.');
        res.redirect('/');
      }
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
  axios.get(`https://api.jikan.moe/v3/genre/anime/${search}`)
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
////////////////////////////////////
app.use('/auth', require('./routes/auth'));
app.use('/watch_list', require('./routes/watch_list.js'));
app.use('/favorites', require('./routes/favorites'));
///////////////////////////////////////// failed route

app.get('*', function(req, res){
  res.render('fail');
});
//////////////////////////////////////////
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${port} 🎧`);
});

module.exports = server;
