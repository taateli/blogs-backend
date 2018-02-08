const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1 , name: 1 })

  response.json(blogs.map(Blog.format))

})

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}


blogsRouter.post( '/', async (request, response) => {
  const body = request.body

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if (body.title === undefined || body.url === undefined) {
      return response.status(400).json({ error: 'some fields are undefined' })
    }

    if (body.likes === undefined) {
      body.likes = 0
    }


    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
    })

    user.blogs = user.blogs.concat(blog._id)
    await user.save()

    const savedBlog = await blog.save()
    response.json(Blog.format(savedBlog))


  } catch(exception) {
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'something went wrong...' })
    }

  }
})

blogsRouter.put('/:id', async (request, response) => {

  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }


  const changedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true } )

  response.json(changedBlog)

})


blogsRouter.delete('/:id', async (request, response) => {
  console.log('delete')

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)


    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const blog = await Blog.findById(request.params.id)

    console.log(decodedToken.id.toString())
    console.log(blog.user.toString())
    if ( blog.user.toString() === decodedToken.id.toString() ) {

      await Blog.findByIdAndRemove(request.params.id)
      response.status(204).end()
    } else {
      return response.status(401).json({ error: 'token doesnt match blogs creator' })
    }

  } catch (exception) {
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    }
    else {
      console.log(exception)
      response.status(400).send({ error: 'malformatted id' })
    }}

})



module.exports = blogsRouter