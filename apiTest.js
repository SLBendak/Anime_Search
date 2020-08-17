// require('dotenv').config();
// const express = require('express');
// const layouts = require('express-ejs-layouts');
// const app = express();

// const router = express.Router();

// const session = require('express-session');
// const SECRET_SESSION = process.env.SECRET_SESSION;
// const passport = require('./config/ppConfig');
// const flash = require('connect-flash');
// const axios = require('axios');
// const { json } = require('sequelize/types');


////////////////////////////////////////////////////////////////////// TITLE SEARCH
// let title = "full%20metal%20alchemist"

// let title = "cowboy bebop";
// let title = req.body.showTitle;
// let searchTitle = title.split(" ").join("%20")

// axios.get(`http://api.jikan.moe/v3/search/anime/?q=${title}&page=1`)
//   .then(response => {
//     console.log(response.data.results[0].title);
//   })
//   .catch(error => console.error(error));

//////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////// HOME PAGE 

// axios.get('https://api.jikan.moe/v3/genre/anime/27')
//   .then(response => {
//     console.log(response.data.anime);
//   })
//   .catch(error => console.log(error));

/////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////// GENRE SEARCH

// axios.get(`https://api.jikan.moe/v3/genre/anime/27${genre-id}`)
//   .then(response => {
//     console.log(response.data.anime);
//   })
//   .catch(error => console.log(error));


////////////////////////////////////////////////////////////////////

// const port = process.env.PORT || 3000;
// const server = app.listen(port, () => {
//   console.log(`🎧 You're listening to the smooth sounds of port ${port} 🎧`);
// });



// console.log('hey there');

// module.exports = router;
