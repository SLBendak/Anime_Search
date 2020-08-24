# Anime Plug

## Technologies used

- HTML5
- CSS
- Javascript
- Node.js
- Express.js
- EJS
- Materialize
- PostgreSQL
- Passport
- Store Session

## Use & User Stories

Nani Anime is a app developed to keep track of the the shows you love and the ones you want to see. 

> Users sign up to keep track of their shows.

> Users can search by genre or title to find shows of interest.

> Users can then save those shows to favorites or put them on a watch list which keeps track of if they watched or havent gotten around to it.

> Users can remove shows from either list if they want to free up space or change their mind about a show.

> Users can leave comments about a show if they want to recommend or leave an opinion about the show for other users to see.


## Heroku Url

Start keeping track here: [Anime Plug](https://shanes-anime-search.herokuapp.com/)


## Installation Instructions

1. Fork and clone [Anime_Search](https://github.com/SLBendak/Anime_Search) repo

2. Run `npm install`

3. Update the config.json file dialect to `postgres`

4. Run `sequelize db:create`

5. Run `sequelize db:migrate`

6. Create your .env file and fill in: 

    SECRET_SESSION = 'RANDOMstringHERE'

7. Run `nodemon` and open your browser to localhost:3000

## ERD

![ERD](https://i.imgur.com/gzZKM1O.png)

## Wireframe

#### LOGIN PAGE
![LOGIN Page](https://i.imgur.com/YqcsCBls.png)
#### SIGNUP PAGE
![SIGNUP Page](https://i.imgur.com/i0bnbwps.png)
#### INDEX PAGE
![INDEX Page](https://i.imgur.com/op289Lqs.png)
#### RESULT PAGE
![RESULT Page](https://i.imgur.com/t6arm8Ts.png)
#### DETAILS PAGE
![DETAILS Page](https://i.imgur.com/ot7aIPgs.png)


---

## Code Snippets

One of the things i was most proud of was my details route. 
which required: 
- finding the current user
- making the api call
- using an if statement to find the show to display its details
    - if the did not exist in the table creating that instance
        - then starting the get route over so its details could be found and displayed

```
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

```

### Unsolved problems
No problems were left unsolved, however i can say this last route was an exciting challenge to overcome.