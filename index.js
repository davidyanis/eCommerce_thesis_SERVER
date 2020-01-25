const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
const port = 3000;
const path = require("path");
const router = require("./routes/routes");


app.use('/api', cors());
app.use('/api', bodyParser.json());
app.use('/api', bodyParser.urlencoded({ extended: true }));

app.use('/api', router)

app.use(express.static('public'))

app.get('/', (req, res) => res.sendFile(path.join(__dirname+'/index.html')))


app.listen(port, () => console.log(`Server listening on port ${port}!`));
