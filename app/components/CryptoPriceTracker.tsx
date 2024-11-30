const fetchPrices = async () => {
  try {
    const response = await fetch('/api/crypto/prices?' + new URLSearchParams({
      endpoint: 'simple/price',
      ids: 'bitcoin,ethereum,cardano',
      vs_currencies: 'usd'
    }));
    
    if (!response.ok) throw new Error('Failed to fetch prices');
    const data = await response.json();
    setPrices(data);
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
  }
}; 

function setPrices(data: any) {
    throw new Error("Function not implemented.");
}
