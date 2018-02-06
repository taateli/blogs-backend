const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const Blog = require('./models/blog')
const blogsRouter = require('./controllers/blogs')

app.use('/api/blogs', blogsRouter)
app.use(cors())
app.use(bodyParser.json())

if ( process.env.NODE_ENV !== 'production' ) {
    require('dotenv').config()
  }
  
  const url = process.env.MONGODB_URI
  
  mongoose.connect(url)
  mongoose.Promise = global.Promise
  
const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})