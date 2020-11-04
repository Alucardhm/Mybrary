const express = require('express')
const router = express.Router()
const Author = require('../models/author')

// All authors Route
router.get('/', async (req,res) => {
    let searchOptions = {}
    if(req.query.name !== null && req.query.name !== ''){  // "".get" sends the information through the url
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
  
    try {
        const authors = await Author.find(searchOptions) 
        res.render('authors/index',{
            authors,
            searchOptions: req.query,
        })
    } catch (error) {
        res.redirect('/')
    }
})

//New Author Route
router.get('/new',(req,res) => {
    res.render('authors/new', {author: new Author()}) 
    // o objeto é um placeHolder pra no authors/_form_fields eu conseguir salvar a info se der algum erro no post já que o author só vai existir se der um erro no post
})

// Create Author Route
router.post('/', async (req,res) => {  // Responder a uma solicitação POST na rota raiz do authors (POST ROUTE)
    const author = new Author({
        name: req.body.name
      })

      try {
          const newAuthor = await author.save() 
          //res.redirect(`authors/${newAuthor.id}`)
          res.redirect(`authors`)
      } catch (error) {
          res.render('authors/new', {
              author: author, // se der algum erro eu mando o author com as informações que ele digitou pra pessoa não precisar digitar novamente
              errorMessage: 'Error creating Author'
          })
      }
})

module.exports = router