export default async function handler(req, res) {
    // Habilitamos los permisos para que tu app pueda leer esto
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');

    // Función maestra para raspar la data de Binance P2P.
    // Retorna null en vez de lanzar, así una moneda caída no tumba la otra.
    const fetchBinanceP2P = async (fiatCode) => {
        try {
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
            const price = data && data.data && data.data[0] && data.data[0].adv && data.data[0].adv.price;
            return price ? parseFloat(price) : null;
        } catch (error) {
            console.error(`Error obteniendo P2P ${fiatCode}:`, error);
            return null;
        }
    };

    // Buscamos ambas monedas al mismo tiempo, cada una con su propio manejo de fallo
    const [copPrice, clpPrice] = await Promise.all([
        fetchBinanceP2P('COP'),
        fetchBinanceP2P('CLP')
    ]);

    if (copPrice === null && clpPrice === null) {
        res.status(502).json({ error: 'Falla de conexión con el servidor P2P' });
        return;
    }

    // Enviamos la respuesta limpia a tu aplicación ByMO Tech
    res.status(200).json({
        cop: copPrice,
        clp: clpPrice
    });
}
