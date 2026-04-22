const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// 1. 測試根目錄 (這你說對了)
app.get('/', (req, res) => {
    res.send('股票 API 伺服器運作中！');
});

// 2. 修正後的 API 路徑 (拿掉所有多餘邏輯，確保路徑最單純)
app.get('/api/price/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    console.log(`正在查詢: ${symbol}`); // 這會在 Render Logs 顯示
    
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
        const response = await axios.get(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0' } 
        });
        
        if (response.data && response.data.chart && response.data.chart.result) {
            const price = response.data.chart.result[0].meta.regularMarketPrice;
            res.json({ price: price });
        } else {
            res.status(404).json({ error: '找不到該股票數據' });
        }
    } catch (error) {
        console.error("抓取失敗:", error.message);
        res.status(500).json({ error: '伺服器抓取錯誤' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
