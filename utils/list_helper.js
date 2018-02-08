const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  var likes = 0

  blogs.forEach(function(element) {
    likes = likes + element.likes
  })

  return likes
}

const favoriteBlog = (blogs) => {
  var favorite
  var temp = 0

  blogs.forEach(function(element) {
    if (element.likes > temp) {
      favorite = element
      temp = element.likes
    }
  })

  return favorite
}

const mostBlogs = (blogs) => {
  const writers = []

  blogs.forEach(function(element) {
    if (writers[element.author] > 0) {
      writers[element.author] = writers[element.author] + 1
    } else {
      writers[element.author] = 1
    }
  })

  var most
  var temp = 0

  for (var w in writers) {
    if (writers[w] > temp) {
      most =  { 'author': w,
        'blogs': writers[w] }
      temp = writers[w]
    }
    console.log(most)
    return most
  }


}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}