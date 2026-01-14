// Vercel Serverless Function: Get Gumroad Lifetime Sales Count
// Endpoint: /api/lifetime-remaining

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600'); // Cache 5 min

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GUMROAD_TOKEN = process.env.GUMROAD_ACCESS_TOKEN;
  const PRODUCT_ID = 'vwesbz'; // Lifetime product
  const TOTAL_SLOTS = 100;

  if (!GUMROAD_TOKEN) {
    console.error('GUMROAD_ACCESS_TOKEN not configured');
    return res.status(500).json({
      error: 'API not configured',
      sold: 1,
      remaining: 99
    });
  }

  try {
    // Fetch product info from Gumroad
    const response = await fetch(`https://api.gumroad.com/v2/products/${PRODUCT_ID}`, {
      headers: {
        'Authorization': `Bearer ${GUMROAD_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gumroad API error:', response.status, errorText);
      throw new Error(`Gumroad API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Gumroad API returned success: false');
    }

    const product = data.product;

    // Gumroad provides sales_count for the product
    const sold = product.sales_count || 0;
    const remaining = Math.max(0, TOTAL_SLOTS - sold);

    return res.status(200).json({
      success: true,
      sold,
      remaining,
      total: TOTAL_SLOTS,
      product_name: product.name,
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching from Gumroad:', error.message);

    // Return fallback values on error
    return res.status(200).json({
      success: false,
      error: error.message,
      sold: 1,
      remaining: 99,
      total: TOTAL_SLOTS,
      fallback: true
    });
  }
}
