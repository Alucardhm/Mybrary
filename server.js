if(process.env.NODE_ENV !== "production"){ // usar a database local apenas se estivermos no nosso ambiente de desenvolvimento
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')



const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')
const methodOverride = require('method-override')





app.set('view engine', 'ejs')
app.set('views',__dirname + '/views')
app.set('layout','layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(express.urlencoded({limit: '10mb', extended: false }))





const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { //  no local queremos usar uma database local (LINHA 1 SERVER.JS)
    //mas já em um server a gente quer conectar com uma database que esta em algum servidor
    
    useNewUrlParser: true, // usar a nova forma de acessar data no mongodb 
    useUnifiedTopology: true
})
const db = mongoose.connection
db.on('error',error => console.log(error))
db.once('open',() => console.log('Connected to Mongoose'))

// cria funções que vao ser executadas  para qualquer tipo de solicitação HTTP no caminho dado
app.use('/',indexRouter)
app.use('/authors',authorRouter)
app.use('/books',bookRouter)

/*
app.use(function (req, res, next) { // passou por todos os app.use e parou nesse por isso que ele ta no final. Então ele seta o status como 400 e manda uma msg
    res.status(400).send('Not found')
})
*/

app.listen(process.env.PORT || 3000)