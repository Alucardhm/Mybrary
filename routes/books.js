const express = require('express')
const router = express.Router() //  criar uma instancia de router pra poder usar no app use
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
   renderNewPage(res,new Book()) 
})

// Create Books Route   
router.post('/',  async (req,res) => {  // Responder a uma solicitação POST na rota raiz do authors (POST ROUTE)
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
       // coverImageName: fileName,
        description: req.body.description
    })
    saveCover(book,req.body.cover)
 
    try {
        const newBook = await book.save()
        res.redirect(`/books/${newBook.id}`)
    } catch (error) {
        console.log(error)
        renderNewPage(res,book,true)
    }

})

// Show Book Route
router.get('/:id', async(req,res) => {
    try {           
        const book = await Book.findById(req.params.id).populate('author').exec() // vai pegar a data "author" do book e popular ele com as info do author e não só com o id dele 
        res.render('books/show',{book})
    } catch (error) {
        res.redirect('/')
    }
})

// Edit Book Route
router.get('/:id/edit', async (req,res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res,book)
    } catch (error) {
        res.redirect('/')
    }
 })

 // Update Books Route   
router.put('/:id',  async (req,res) => {  // Responder a uma solicitação POST na rota raiz do authors (POST ROUTE)
    let book;

    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author // author is the <select> name
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if(req.body.cover != null && req.body.cover !== ''){
            saveCover(book,req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch (error) {
        console.log(error)
       if(book != null){
        renderEditPage(res,book,true)
       }else{
          res.redirect('/')
       }
    }

})

// Delete Book Page
router.delete('/:id', async(req,res) => {
    let book;
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch (error) {
        if(book !== null){
            res.render('books/show',{
                book,
                errorMessage: 'Could not remove book'
            })
        }else{
            res.redirect('/')
        }
    }
})

 
 async function renderNewPage(res,book,hasError = false){
     renderFormPage(res,book,'new',hasError)
 }

async function renderEditPage(res, book, hasError = false){ 
     renderFormPage(res,book,'edit',hasError)
}



async function renderFormPage(res, book, form, hasError = false){
    try {
        const authors = await Author.find({})
        const params = {
            authors,
            book
        }
        if(hasError){
            if(form == 'edit'){
                params.errorMessage = 'Error Updating book'
            }else{
                params.errorMessage = 'Error Creating book' 
            }
        }
        
        res.render(`books/${form}`,params)
    } catch (error) {
        console.log(error)
        res.redirect('/books')
    }
}



function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    try {
        const cover = JSON.parse(coverEncoded) // https://www.w3schools.com/js/js_json_parse.asp
        if(cover != null && imageMimeTypes.includes(cover.type)){
            book.coverImage = new Buffer.from(cover.data, 'base64') // cria um buffer com a data do tipo base64
            book.coverImageType = cover.type
        }
    } catch (error) {
       console.log(error)
    }
  }
  

module.exports = router

