export const calculateGrowth = (data: any[]) => {
    if (data.length < 2) return 0;
    const oldValue = data[data.length - 2].count;
    const newValue = data[data.length - 1].count;
    return oldValue === 0 ? 100 : ((newValue - oldValue) / oldValue) * 100;
  };
  
  export const calculateRetention = (data: any[]) => {
    const activeUsers = data.filter(user => user.last_login_at).length;
    return data.length ? (activeUsers / data.length) * 100 : 0;
  };
  
  export const calculateConversionRate = (data: any[]) => {
    const successful = data.filter(ref => ref.status === 'COMPLETED').length;
    return data.length ? (successful / data.length) * 100 : 0;
  };
  
  export const calculateAverageCommission = (data: any[]) => {
    const total = data.reduce((sum, ref) => sum + (ref.commission || 0), 0);
    return data.length ? total / data.length : 0;
  };
  
  export const calculateSuccessRate = (data: any[]) => {
    const successful = data.filter(tx => tx.status === 'COMPLETED').length;
    return data.length ? (successful / data.length) * 100 : 0;
  };
  
  export const groupByTier = (data: any[]) => {
    return data.reduce((acc, ref) => {
      acc[ref.tier] = (acc[ref.tier] || 0) + 1;
      return acc;
    }, {});
  };
  
  export const groupByStatus = (data: any[]) => {
    return data.reduce((acc, tx) => {
      acc[tx.status] = (acc[tx.status] || 0) + 1;
      return acc;
    }, {});
  };
  
  export const getTopReferrers = (data: any[]) => {
    return [...data]
      .sort((a, b) => b.referral_count - a.referral_count)
      .slice(0, 5);
  };