export async function getNGNRate(): Promise<number> {
  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/USD`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data = await response.json();
    return data.rates.NGN;
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    return 1550; // Fallback rate if API fails
  }
}