const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// 只要輸入網址，就一定會看到這個，用來測試
app.get('/', (req, res) => {
    res.send('股票 API 伺服器運作中！');
});

// 抓取股價的功能
app.get('/api/price/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
        // 加入 headers 防止被封鎖
        const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const price = response.data.chart.result[0].meta.regularMarketPrice;
        res.json({ price: price });
    } catch (error) {
        res.status(500).json({ error: '無法取得資料', message: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running`);
});
