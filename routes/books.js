const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const imageMimeTypes = ['image/jpge','image/png','image/gif']
const Author = require('../models/author')


// All Books Route
router.get('/', async (req,res) => {
    let query = Book.find()

    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate',req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate',req.query.publishedAfter)
    }

    try {
        const books = await query.exec()
        res.render('books/index',{
            books,
            searchOptions: req.query // salvar as opções de pesquisa pra quando ele pesquisar
        })
    } catch (error) {
        res.redirect('/')
    }
})

//New Books  Route
router.get('/new', async (req,res) => {
   renderNewPage(res,new Book()) // mesma logica do /new do author
})

// Create Books Route    //single file and cover is the name of the upload file input
router.post('/',  async (req,res) => {  // Responder a uma solicitação POST na rota raiz do authors (POST ROUTE)
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })
    saveCover(book,req.body.cover)
 
    try {
        const newBook =  await book.save()    
        // res.redirect(`books/${newBook.id}`)
        res.redirect('books')
    } catch (error) {
        console.log(error)
        renderNewPage(res,book,true)
    }

})



async function renderNewPage(res, book, hasError = false){
    try {
        const authors = await Author.find({})
        const params = {
            authors,
            book
        }
        if(hasError) params.errorMessage = 'Error Creating Book'
        res.render('books/new',params)
    } catch (error) {
        console.log(error)
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded) {
    try {
        const cover = JSON.parse(coverEncoded)
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    } catch (error) {
       console.log(error)
    }
  }
  

module.exports = router