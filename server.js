const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('測試成功！看到這行字代表路徑對了');
});

app.get('/test', (req, res) => {
    res.send('測試路徑 /test 也通了');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log('Server is active');
});
