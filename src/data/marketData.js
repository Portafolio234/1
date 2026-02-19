
// Generador de datos financieros realistas (Fractal/Random Walk con Tendencia)
const generateData = (startPrice, days, volatility, trendBias) => {
    let price = startPrice;
    const data = {
        dates: [],
        open: [],
        high: [],
        low: [],
        close: [],
        volume: []
    };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        data.dates.push(date.toISOString().split('T')[0]);

        const open = price;
        // Cambio porcentual diario aleatorio + tendencia
        const change = (Math.random() - 0.5 + trendBias) * volatility;
        const close = open * (1 + change);

        // High y Low basados en open/close con "ruido"
        const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
        const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);

        data.open.push(parseFloat(open.toFixed(2)));
        data.high.push(parseFloat(high.toFixed(2)));
        data.low.push(parseFloat(low.toFixed(2)));
        data.close.push(parseFloat(close.toFixed(2)));
        data.volume.push(Math.floor(Math.random() * 1000000) + 50000);

        price = close;
    }
    return data;
};

// Generamos 5 años de datos (aprox 1825 días)
const DAYS_HISTORY = 1825;

export const marketData = {
    BTC: {
        name: "Bitcoin USD",
        symbol: "BTC-USD",
        ...generateData(35000, DAYS_HISTORY, 0.04, 0.0002), // Alta volatilidad, tendencia alcista leve
        currentPrice: 0, // Se actualizará al final
        change: "+2.4%" // Dummy
    },
    AAPL: {
        name: "Apple Inc.",
        symbol: "AAPL",
        ...generateData(130, DAYS_HISTORY, 0.015, 0.0003), // Baja volatilidad, crecimiento constante
        currentPrice: 0,
        change: "+1.2%"
    },
    TSLA: {
        name: "Tesla Inc.",
        symbol: "TSLA",
        ...generateData(200, DAYS_HISTORY, 0.03, 0.0001), // Media-Alta volatilidad
        currentPrice: 0,
        change: "-0.5%"
    }
};

// Ajustar precios actuales y cambios basados en la simulación
Object.keys(marketData).forEach(key => {
    const asset = marketData[key];
    const lastClose = asset.close[asset.close.length - 1];
    const prevClose = asset.close[asset.close.length - 2];
    asset.currentPrice = lastClose;
    const changePercent = ((lastClose - prevClose) / prevClose) * 100;
    asset.change = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
});

export const getTechnicalSummary = (symbol, timeframe = 30) => {
    const data = marketData[symbol];
    if (!data) return "Datos no disponibles";

    // Cortar datos según timeframe (últimos X días)
    const sliceIndex = Math.max(0, data.close.length - timeframe);
    const closeSlice = data.close.slice(sliceIndex);
    const highSlice = data.high.slice(sliceIndex);
    const lowSlice = data.low.slice(sliceIndex);

    const currentPrice = closeSlice[closeSlice.length - 1];
    const startPrice = closeSlice[0];
    const performance = ((currentPrice - startPrice) / startPrice) * 100;

    const maxHigh = Math.max(...highSlice);
    const minLow = Math.min(...lowSlice);
    const volatility = ((maxHigh - minLow) / minLow) * 100;

    // RSI Simple (14 periodos) - Aproximación
    let gains = 0;
    let losses = 0;
    for (let i = 1; i < 15 && i < closeSlice.length; i++) {
        const diff = closeSlice[closeSlice.length - i] - closeSlice[closeSlice.length - i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }
    const rs = gains / (losses || 1);
    const rsi = 100 - (100 / (1 + rs));

    return `
    REPORTE TÉCNICO (${timeframe} Días):
    Activo: ${data.name} (${data.symbol})
    Precio Actual: $${currentPrice.toLocaleString()}
    Rendimiento Periodo: ${performance > 0 ? '+' : ''}${performance.toFixed(2)}%
    Rango: $${minLow.toLocaleString()} - $${maxHigh.toLocaleString()}
    Volatilidad: ${volatility.toFixed(2)}%
    RSI (14d aprox): ${rsi.toFixed(1)}
    Tendencia: ${performance > 5 ? "FUERTE ALCISTA" : performance > 0 ? "ALCISTA" : performance > -5 ? "BAJISTA" : "FUERTE BAJISTA"}
    `;
};
