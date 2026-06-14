// Router read-only de mercado: preço, ranking de entrada, ações, institucional, notícias.
const express = require('express');
const router = express.Router();
const binance = require('../market/binance');
const stocks = require('../market/stocks');
const institutional = require('../market/institutional');
const news = require('../market/news');

router.get('/price', async (req, res) => {
  try {
    const symbols = String(req.query.symbols || 'BTC').split(',').map(s => s.trim()).filter(Boolean);
    res.json(await binance.getPrices(symbols));
  } catch (e) { res.status(502).json({ message: e.message }); }
});

router.get('/usdt-brl', async (_req, res) => {
  try {
    res.json(await binance.getUsdtBrl());
  } catch (e) { res.status(502).json({ message: e.message }); }
});

router.get('/inflow-rank', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const scan = Math.min(parseInt(req.query.scan) || 150, 300);
    res.json(await binance.getInflowRank(limit, scan));
  } catch (e) { res.status(502).json({ message: e.message }); }
});

router.get('/stock', async (req, res) => {
  try {
    const symbol = String(req.query.symbol || '').trim();
    if (!symbol) return res.status(400).json({ message: 'symbol obrigatório' });
    res.json(await stocks.getStockQuote(symbol));
  } catch (e) { res.status(502).json({ message: e.message }); }
});

router.get('/institutional', async (req, res) => {
  try {
    const symbol = String(req.query.symbol || 'BTC').trim();
    res.json(await institutional.getInstitutional(symbol));
  } catch (e) { res.status(502).json({ message: e.message }); }
});

router.get('/news', async (req, res) => {
  try {
    const symbol = String(req.query.symbol || 'BTC').trim();
    res.json(await news.getCryptoNews(symbol));
  } catch (e) { res.status(502).json({ message: e.message }); }
});

module.exports = router;
