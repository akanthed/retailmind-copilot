// Report generation utilities for PDF and CSV exports

import { apiClient } from '@/api/client';

interface ReportData {
  title: string;
  period: string;
  generatedAt: string;
  data: any[];
}

// Generate CSV from data
export function generateCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
}

// Generate simple PDF using HTML canvas
export function generatePDF(reportData: ReportData, filename: string) {
  const { title, period, generatedAt, data } = reportData;
  
  // Create a simple HTML representation
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        .header {
          border-bottom: 3px solid #2D9B8E;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        h1 {
          color: #2D9B8E;
          margin: 0 0 10px 0;
        }
        .meta {
          color: #666;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #2D9B8E;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #ddd;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <div class="meta">
          <div>Period: ${period}</div>
          <div>Generated: ${generatedAt}</div>
        </div>
      </div>
      ${generateTableHTML(data)}
      <div class="footer">
        <p>RetailMind AI - Market Intelligence Platform</p>
        <p>This report was automatically generated. All data is subject to change.</p>
      </div>
    </body>
    </html>
  `;

  // Convert HTML to blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  
  // For actual PDF, we'll use print functionality
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}

function generateTableHTML(data: any[]): string {
  if (!data || data.length === 0) {
    return '<p>No data available</p>';
  }

  const headers = Object.keys(data[0]);
  
  return `
    <table>
      <thead>
        <tr>
          ${headers.map(h => `<th>${formatHeader(h)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            ${headers.map(h => `<td>${formatValue(row[h])}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function formatHeader(header: string): string {
  // Convert camelCase to Title Case
  return header
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    // Format currency if it looks like a price
    if (value > 100) {
      return `₹${value.toLocaleString('en-IN')}`;
    }
    return value.toLocaleString('en-IN');
  }
  return String(value);
}

function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Sample data generators for different report types
export async function getPricingPerformanceData(period: string) {
  try {
    const response = await apiClient.getProducts();
    if (!response.success || !response.data) {
      return getFallbackPricingData();
    }

    const products = response.data.products;
    
    return products.map(product => ({
      product: product.name,
      sku: product.sku,
      currentPrice: product.currentPrice,
      costPrice: product.costPrice,
      margin: ((product.currentPrice - product.costPrice) / product.currentPrice * 100).toFixed(1) + '%',
      stock: product.stock,
      category: product.category,
    }));
  } catch (error) {
    console.error('Error fetching pricing data:', error);
    return getFallbackPricingData();
  }
}

function getFallbackPricingData() {
  return [
    { product: 'No products found', sku: '-', currentPrice: 0, costPrice: 0, margin: '0%', stock: 0, category: '-' },
  ];
}

export async function getCompetitorAnalysisData(period: string) {
  try {
    const response = await apiClient.getProducts();
    if (!response.success || !response.data) {
      return getFallbackCompetitorData();
    }

    const products = response.data.products;
    const analysisData = [];

    for (const product of products.slice(0, 10)) {
      try {
        const priceResponse = await apiClient.getProductPriceComparison(product.id);
        
        if (priceResponse.success && priceResponse.data?.comparisons?.length > 0) {
          const comparisons = priceResponse.data.comparisons;
          const avgCompetitorPrice = comparisons.reduce((sum, c) => sum + c.price, 0) / comparisons.length;
          const minCompetitorPrice = Math.min(...comparisons.map(c => c.price));
          const maxCompetitorPrice = Math.max(...comparisons.map(c => c.price));
          
          analysisData.push({
            product: product.name,
            yourPrice: product.currentPrice,
            avgCompetitor: Math.round(avgCompetitorPrice),
            minCompetitor: minCompetitorPrice,
            maxCompetitor: maxCompetitorPrice,
            position: product.currentPrice <= avgCompetitorPrice ? 'Competitive' : 'Above Market',
            competitors: comparisons.length,
          });
        } else {
          analysisData.push({
            product: product.name,
            yourPrice: product.currentPrice,
            avgCompetitor: '-',
            minCompetitor: '-',
            maxCompetitor: '-',
            position: 'No Data',
            competitors: 0,
          });
        }
      } catch (err) {
        console.error(`Error fetching comparison for ${product.name}:`, err);
      }
    }

    return analysisData.length > 0 ? analysisData : getFallbackCompetitorData();
  } catch (error) {
    console.error('Error fetching competitor data:', error);
    return getFallbackCompetitorData();
  }
}

function getFallbackCompetitorData() {
  return [
    { product: 'No products found', yourPrice: 0, avgCompetitor: '-', minCompetitor: '-', maxCompetitor: '-', position: '-', competitors: 0 },
  ];
}

export async function getDemandForecastData(period: string) {
  try {
    const response = await apiClient.getForecasts();
    if (!response.success || !response.data?.forecasts) {
      return getFallbackForecastData();
    }

    const forecasts = response.data.forecasts;
    
    return forecasts.map(forecast => ({
      product: forecast.productName,
      sku: forecast.sku,
      currentStock: forecast.currentStock,
      avgDailyDemand: forecast.summary.avgDailyDemand.toFixed(1),
      predictedDemand: forecast.summary.totalPredictedDemand,
      confidence: (forecast.confidence * 100).toFixed(0) + '%',
      trend: forecast.summary.totalPredictedDemand > forecast.currentStock ? 'Growing' : 'Stable',
    }));
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return getFallbackForecastData();
  }
}

function getFallbackForecastData() {
  return [
    { product: 'No forecasts available', sku: '-', currentStock: 0, avgDailyDemand: '0', predictedDemand: 0, confidence: '0%', trend: '-' },
  ];
}

export async function getInventoryRiskData(period: string) {
  try {
    const [productsResponse, alertsResponse] = await Promise.all([
      apiClient.getProducts(),
      apiClient.getAlerts(),
    ]);

    if (!productsResponse.success || !productsResponse.data) {
      return getFallbackInventoryData();
    }

    const products = productsResponse.data.products;
    const alerts = alertsResponse.success ? alertsResponse.data?.alerts || [] : [];
    
    return products.map(product => {
      const productAlerts = alerts.filter(a => a.productId === product.id && a.type === 'stock_risk');
      const hasStockAlert = productAlerts.length > 0;
      
      let risk = 'Low';
      let action = 'Monitor';
      
      if (product.stockDays <= 3) {
        risk = 'Critical';
        action = 'Urgent Reorder';
      } else if (product.stockDays <= 7) {
        risk = 'High';
        action = 'Reorder Soon';
      } else if (product.stockDays > 30) {
        risk = 'Overstock';
        action = 'Promote';
      }
      
      return {
        product: product.name,
        sku: product.sku,
        stock: product.stock,
        daysLeft: product.stockDays,
        risk,
        action,
        alerts: hasStockAlert ? 'Yes' : 'No',
      };
    });
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    return getFallbackInventoryData();
  }
}

function getFallbackInventoryData() {
  return [
    { product: 'No products found', sku: '-', stock: 0, daysLeft: 0, risk: '-', action: '-', alerts: 'No' },
  ];
}
