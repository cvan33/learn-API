const app = require ('express') ();
const PORT = 8080;

app.get('/', (req, res) => {
    res.status(200).send({
        name: 'root',
        Size: 'large'
    })
});


app.get('/intro', (req, res) => {
    res.status(200).send({
        name: 'dog',
        Size: 'large'
    })
});

app.listen(
    PORT,
    () => console.log("running..........")
)