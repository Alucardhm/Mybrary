const express = require('express')
const router = express.Router() //  criar uma instancia de router pra poder usar no app use
const Author = require('../models/author')
const Book = require('../models/book')

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
})

// Create Author Route
router.post('/', async (req,res) => {  // Responder a uma solicitação POST na rota raiz do authors (POST ROUTE)
    const author = new Author({
        name: req.body.name
      })

      try {
          const newAuthor = await author.save() 
          res.redirect(`authors/${newAuthor.id}`)
      } catch (error) {
          res.render('authors/new', {
              author: author, // se der algum erro eu mando o author com as informações que ele digitou pra pessoa não precisar digitar novamente
              errorMessage: 'Error creating Author'
          })
      }
})




router.get('/:id', async(req,res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({author: author.id}).limit(6).exec()
        res.render('authors/show',{
            author,
            booksByAuthor: books  
        })
    } catch{
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req,res) => {
    try {
        const author = await Author.findById(req.params.id) // id é como a gente chamou a variavel no ":id/edit"
        res.render('authors/edit', {author}) 
    } catch (error) {
        res.redirect('/authors')   
    }
})

router.put('/:id', async (req,res) => {
    let author; // definir fora pra poder acessar a variavel no "catch" tbm
      try {
          author = await Author.findById(req.params.id)
          author.name = req.body.name
          await author.save() 
          res.redirect(`/authors/${author.id}`)
      } catch (error) {
          if(author == null){ // ele pode falhar tanto pra achar o author ou pra salvar ele por isso desse check
              res.redirect('/')
          }
          res.render('authors/new', {
              author: author, // se der algum erro eu mando o author com as informações que ele digitou pra pessoa não precisar digitar novamente
              errorMessage: 'Error updating Author'
          })
      }
})

// no  model do book ele checa pra ver se o author ainda tem livros e se tiver ele vai deletar todos os livros
router.delete('/:id', async(req,res) => {
    let author; // definir fora pra poder acessar a variavel no "catch" tbm
    try {
        author = await Author.findById(req.params.id)
        await author.remove() 
        res.redirect(`/authors`)
    } catch{ 
        if(author == null){ // ele pode falhar tanto pra achar o author ou pra salvar ele por isso desse check
            res.redirect('/')
        }else{
            res.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router