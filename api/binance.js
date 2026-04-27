export default async function handler(req, res) {
    // Habilitamos los permisos para que tu app pueda leer esto
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');

    try {
        // Función maestra para raspar la data de Binance P2P
        const fetchBinanceP2P = async (fiatCode) => {
            const response = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                },
                body: JSON.stringify({
                    fiat: fiatCode,
                    page: 1,
                    rows: 1,
                    tradeType: "BUY",
                    asset: "USDT",
                    merchantCheck: false,
                    payTypes: []
                })
            });
            const data = await response.json();
            // Retorna el precio del primer anuncio (el mejor precio del mercado)
            return data.data[0].adv.price;
        };

        // Buscamos ambas monedas al mismo tiempo
        const copPrice = await fetchBinanceP2P('COP');
        const clpPrice = await fetchBinanceP2P('CLP');

        // Enviamos la respuesta limpia a tu aplicación ByMO Tech
        res.status(200).json({
            cop: parseFloat(copPrice),
            clp: parseFloat(clpPrice)
        });

    } catch (error) {
        console.error("Error en la API de Binance:", error);
        res.status(500).json({ error: 'Falla de conexión con el servidor P2P' });
    }
}
