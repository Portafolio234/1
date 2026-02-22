import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const yahooFinance = require('yahoo-finance2').default;

const yahoo = new yahooFinance();

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { symbol = 'BTC-USD', range = '1M' } = req.query;


        // Mapeo de rango a periodo y intervalo de Yahoo Finance
        const config = {
            '1D': { period1: daysAgo(1), interval: '15m' },
            '1W': { period1: daysAgo(7), interval: '1h' },
            '1M': { period1: daysAgo(30), interval: '1d' },
            '1Y': { period1: daysAgo(365), interval: '1d' },
            'ALL': { period1: daysAgo(1825), interval: '1wk' }
        };

        const { period1, interval } = config[range] || config['1M'];

        const result = await yahoo.chart(symbol, {
            period1,
            period2: new Date(),
            interval
        });

        if (!result || !result.quotes || result.quotes.length === 0) {
            return res.status(404).json({ error: 'No data found for symbol', symbol });
        }

        // Transformar al formato que espera el frontend (arrays planos)
        const quotes = result.quotes.filter(q => q.open !== null && q.close !== null);

        const data = {
            dates: quotes.map(q => q.date.toISOString()),
            open: quotes.map(q => parseFloat(q.open.toFixed(2))),
            high: quotes.map(q => parseFloat(q.high.toFixed(2))),
            low: quotes.map(q => parseFloat(q.low.toFixed(2))),
            close: quotes.map(q => parseFloat(q.close.toFixed(2))),
            volume: quotes.map(q => q.volume),
            meta: {
                symbol: result.meta?.symbol || symbol,
                currency: result.meta?.currency || 'USD',
                exchangeName: result.meta?.exchangeName || '',
                regularMarketPrice: result.meta?.regularMarketPrice || null
            }
        };

        return res.status(200).json(data);

    } catch (error) {
        console.error('Yahoo Finance Error:', error.message);
        return res.status(500).json({
            error: 'Failed to fetch market data',
            details: error.message
        });
    }
}

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}
