import app from './src/app'
import Log from './src/log'

Log.initialize({
  logger: console,
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
