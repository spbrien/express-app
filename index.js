'use strict'
const app = require('express')()
const morgan = require('morgan')

app.use(morgan('dev'))

app.use((req, res) => {
  res.send("Hello World!")
})

const port = 8080
app.listen(port, () => console.log(`Running on port ${port}\n`))
