const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/price/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
        const response = await axios.get(url);
        const price = response.data.chart.result[0].meta.regularMarketPrice;
        res.json({ price: price });
    } catch (error) {
        res.status(500).json({ error: '無法取得資料' });
    }
});

app.get('/', (req, res) => {
    res.send('股票 API 伺服器運作中！');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
