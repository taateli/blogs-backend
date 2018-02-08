const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { initialBlogs, nonExistingId, blogsInDb } = require('./test_helper')

describe('when there is initially some blogs saved', async () => {
  beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = initialBlogs.map(b => new Blog(b))
    await Promise.all(blogObjects.map(b => b.save()))
  })

  test('all blogs are returned as json by GET /api/notes', async () => {
    const blogsInDatabase = await blogsInDb()

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(blogsInDatabase.length)

    const returnedTitles = response.body.map(b => b.title)
    blogsInDatabase.forEach(blog => {
      expect(returnedTitles).toContain(blog.title)
    })
  })

  test.skip('individual blogs are returned as json by GET /api/notes/:id', async () => {
    const blogsInDatabase = await blogsInDb()
    const aBlog = blogsInDatabase[0]

    const response = await api
      .get(`/api/notes/${aBlog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.content).toBe(aBlog.content)
  })

  test.skip('404 returned by GET /api/blogs/:id with nonexisting valid id', async () => {
    const validNonexistingId = await nonExistingId()

    const response = await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test.skip('400 is returned by GET /api/blogs/:id with invalid id', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    const response = await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })

  describe('addition of a new blog', async () => {

    test('POST /api/blogs succeeds with valid data', async () => {
      const blogsAtStart = await blogsInDb()

      const newBlog =  {
        _id: '5a422bc61b54a676234d17fc',
        title: 'Scrum Wars',
        author: 'Robert B. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/ScrumWars.html',
        likes: 3,
        __v: 0
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAfterOperation = await blogsInDb()

      expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)

      const titles = blogsAfterOperation.map(r => r.title)
      expect(titles).toContain('Scrum Wars')
    })

    test('POST /api/blogs fails with proper statuscode if title is missing', async () => {
      const newBlog =   {
        _id: '5a422bc61b54a676234d17fb',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 2,
        __v: 0
      }

      const blogsAtStart = await blogsInDb()

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAfterOperation = await blogsInDb()

      expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
    })
  })

  test('POST /api/blogs fails with proper statuscode if url is missing', async () => {
    const newBlog =   {
      _id: '5a422bc61b54a676234d17fd',
      author: 'Robert C. Martin',
      title: 'Scrum',
      likes: 2,
      __v: 0
    }

    const blogsAtStart = await blogsInDb()

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAfterOperation = await blogsInDb()

    expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
  })
})

describe('deletion of a blog', async () => {
  let addedBlog

  beforeAll(async () => {
    addedBlog = new Blog({
      _id: '5a422bc61b54a676234d17fe',
      title: 'Scrum Wars',
      author: 'Robert B. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/ScrumWars.html',
      likes: 3,
      __v: 0
    })
    await addedBlog.save()
  })

  test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
    const blogsAtStart = await blogsInDb()

    await api
      .delete(`/api/blogs/${addedBlog._id}`)
      .expect(204)

    const blogsAfterOperation = await blogsInDb()

    const titles = blogsAfterOperation.map(r => r._id)

    expect(titles).not.toContain(addedBlog._id)
    expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1)
  })
})

describe('blog can be edited', async () => {
  let addedBlog

  beforeAll(async () => {
    addedBlog = new Blog({
      _id: '5a422bc61b54a676234d17fe',
      title: 'Scrum Wars',
      author: 'Robert B. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/ScrumWars.html',
      likes: 3,
      __v: 0
    })
    await addedBlog.save()
  })

  test('PUT edits the blog', async () => {
    const blogsAtStart = await blogsInDb()

    const editedBlog = {
      title: 'Scrum Wars',
      author: 'Robert B. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/ScrumWars.html',
      likes: 10
    }


    await api
      .put(`/api/blogs/${addedBlog._id}`)
      .send(editedBlog)
      .expect(200)

    const blogsAfterOperation = await blogsInDb()

    const titles = blogsAfterOperation.map(r => r.title)

    expect(titles).toContain(addedBlog.title)
    expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
  })

})

afterAll(() => {
  server.close()
})
