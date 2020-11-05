const mongoose = require('mongoose')
const Book = require('./book')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
})


authorSchema.pre('remove',function(next){
    Book.find({author: this.id},(err,books) => {
        if (err){
            next(err)
        }else if(books.length > 0){
           // next(new Error('This author has books still'))
           try {
            books.forEach(book => book.remove()) // deletar os livros do author
            next()
           }catch{
               next(new Error('Failed to delete all books from the Author'))
           }
        }else{
            next()
        }
    })
})

module.exports = mongoose.model('Author',authorSchema)