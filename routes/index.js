const express = require('express')
const book = require('../models/book')
const Book = require('../models/book')
const router = express.Router() //  criar uma instancia de router pra poder usar no app use



router.get('/', async(req,res) => {
    let books
    try {                                       //ordem decrescente(pegar os mais recentes) e createdAt é o nome da data do book que tem como default o date.now
        books = await Book.find().sort({createdAt: 'desc'}).limit(10).exec()
    } catch (error) {
        books = []
    }
    res.render('index',{books: books})
})

module.exports = router