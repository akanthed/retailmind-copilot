// Utility functions to generate chart data from real product data
import { Product } from "@/api/client";

export function generateRevenueData(products: Product[]) {
  const currentRevenue = products.reduce((sum, p) => sum + (p.currentPrice * p.stock), 0);
  const avgRevenue = currentRevenue / 6; // Spread across 6 months
  
  // Generate last 6 months with some variation
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => {
    const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
    const revenue = Math.round(avgRevenue * (1 + variation));
    const target = Math.round(avgRevenue * 0.9); // Target is 90% of average
    
    return { month, revenue, target };
  });
}

export function generateCategoryData(products: Product[]) {
  const categoryMap = new Map<string, number>();
  
  products.forEach(product => {
    const category = product.category || 'Others';
    const value = product.currentPrice * product.stock;
    categoryMap.set(category, (categoryMap.get(category) || 0) + value);
  });
  
  const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
  
  return Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value: total > 0 ? Math.round((value / total) * 100) : 0
  }));
}

export function generateCompetitorComparisonData(products: Product[]) {
  // Take top 3 products by revenue
  const topProducts = products
    .sort((a, b) => (b.currentPrice * b.stock) - (a.currentPrice * a.stock))
    .slice(0, 3);
  
  return topProducts.map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    yourPrice: product.currentPrice,
    // Simulate competitor price (±10% of your price)
    theirPrice: Math.round(product.currentPrice * (0.9 + Math.random() * 0.2))
  }));
}

export function generatePerformanceIndicators(products: Product[]) {
  if (products.length === 0) {
    return {
      bestPerformer: { category: 'N/A', growth: 0 },
      needsAttention: { category: 'N/A', decline: 0 },
      avgOrderValue: 0
    };
  }

  // Group by category
  const categoryRevenue = new Map<string, number>();
  products.forEach(p => {
    const category = p.category || 'Others';
    const revenue = p.currentPrice * p.stock;
    categoryRevenue.set(category, (categoryRevenue.get(category) || 0) + revenue);
  });

  // Find best and worst
  const sorted = Array.from(categoryRevenue.entries()).sort((a, b) => b[1] - a[1]);
  const bestPerformer = sorted[0] || ['N/A', 0];
  const needsAttention = sorted[sorted.length - 1] || ['N/A', 0];

  // Calculate average order value
  const totalRevenue = products.reduce((sum, p) => sum + (p.currentPrice * p.stock), 0);
  const avgOrderValue = products.length > 0 ? Math.round(totalRevenue / products.length) : 0;

  return {
    bestPerformer: {
      category: bestPerformer[0],
      growth: 24 // Mock growth percentage
    },
    needsAttention: {
      category: needsAttention[0],
      decline: 8 // Mock decline percentage
    },
    avgOrderValue
  };
}
