const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose'); // 新增 mongoose 模組
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. 連線到 MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ 雲端資料庫連線成功'))
    .catch(err => console.error('❌ 資料庫連線失敗:', err));

// 2. 定義股票資料結構 (Schema)
const stockSchema = new mongoose.Schema({
    id: String,
    name: String,
    symbol: String,
    shares: Number,
    avgCost: Number,
    type: String // 'tw' 或 'us'
});
const Stock = mongoose.model('Stock', stockSchema);

// 3. 原有的抓取報價 API
app.get('/api/quote/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol;
        const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
        const data = response.data.chart.result[0].meta;
        res.json({ price: data.regularMarketPrice });
    } catch (error) {
        res.status(500).json({ error: '無法獲取股價' });
    }
});

// 4. 新增：獲取雲端股票清單
app.get('/api/stocks', async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ error: '無法讀取清單' });
    }
});

// 5. 新增：儲存股票到雲端
app.post('/api/stocks', async (req, res) => {
    try {
        const newStock = new Stock(req.body);
        await newStock.save();
        res.json({ message: '儲存成功' });
    } catch (error) {
        res.status(500).json({ error: '儲存失敗' });
    }
});

// 6. 新增：從雲端刪除股票
app.delete('/api/stocks/:id', async (req, res) => {
    try {
        await Stock.deleteOne({ id: req.params.id });
        res.json({ message: '刪除成功' });
    } catch (error) {
        res.status(500).json({ error: '刪除失敗' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
