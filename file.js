const fs = require('fs')
const readline = require('readline')

fs.readFile('./config/default_settings.js', 'utf-8', (err, data) => {
  if (err) console.log(err)
  console.log(typeof data)
})


const rl = readline.createInterface({
  input: fs.createReadStream('./config/default_settings.js', { encoding: 'utf8' }),
})

const writer = fs.createWriteStream('./config/default_settings.js', { defaultEncoding: 'utf8' })

rl.on('line', data => {
  if (data.includes('AUTHENTICATION')) {
    console.log(data)
  }
})
