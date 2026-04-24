const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. 連線到 MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ 雲端資料庫連線成功'))
    .catch(err => console.error('❌ 資料庫連線失敗:', err));

// 2. 定義股票持倉 Schema (新增了 trades 陣列)
const stockSchema = new mongoose.Schema({
    symbol: String,
    name: String,
    market: String, // 'TW' 或 'US'
    shares: Number, // 為了相容舊版
    avgCost: Number, // 為了相容舊版
    trades: [{
        date: String,
        shares: Number,
        price: Number
    }]
});
const Stock = mongoose.model('Stock', stockSchema);

// 3. 定義已實現損益 Schema (修正前端報錯)
const realizedSchema = new mongoose.Schema({
    date: String,
    name: String,
    symbol: String,
    shares: Number,
    buyPrice: Number,
    sellPrice: Number
});
const Realized = mongoose.model('Realized', realizedSchema);

// --- API 路由 ---

// A. 抓取即時股價 (Yahoo Finance)
app.get('/api/quote/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol;
        const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' } // 增加 User-Agent 避免被擋
        });
        const data = response.data.chart.result[0].meta;
        res.json({ price: data.regularMarketPrice });
    } catch (error) {
        console.error(`無法獲取 ${req.params.symbol} 股價`);
        res.status(500).json({ price: 0, error: '無法獲取股價' });
    }
});

// B. 讀取持倉清單
app.get('/api/stocks', async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ error: '無法讀取持倉' });
    }
});

// C. 讀取已實現紀錄 (修正原本會 404 的問題)
app.get('/api/realized', async (req, res) => {
    try {
        const history = await Realized.find().sort({ date: -1 });
        res.json(history);
    } catch (error) {
        res.json([]); // 出錯回傳空陣列，防止前端噴 alert
    }
});

// D. 儲存新股票
app.post('/api/stocks', async (req, res) => {
    try {
        const newStock = new Stock(req.body);
        await newStock.save();
        res.json({ message: '儲存成功' });
    } catch (error) {
        res.status(500).json({ error: '儲存失敗' });
    }
});

// E. 刪除股票 (修正為用 _id 刪除)
app.delete('/api/stocks/:id', async (req, res) => {
    try {
        await Stock.findByIdAndDelete(req.params.id);
        res.json({ message: '刪除成功' });
    } catch (error) {
        res.status(500).json({ error: '刪除失敗' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
