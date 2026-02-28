// Report Export Utilities
// Generate PDF and CSV reports for analytics and data

import { Product, Recommendation, Alert } from '@/api/client';

// Export data to CSV
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

// Export products to CSV
export function exportProductsToCSV(products: Product[]) {
  const data = products.map(p => ({
    SKU: p.sku,
    Name: p.name,
    Category: p.category,
    'Current Price (₹)': p.currentPrice,
    'Cost Price (₹)': p.costPrice,
    'Stock': p.stock,
    'Stock Days': p.stockDays,
    'Margin (%)': Math.round(((p.currentPrice - p.costPrice) / p.currentPrice) * 100),
    'Created': new Date(p.createdAt).toLocaleDateString('en-IN')
  }));

  exportToCSV(data, `products-${Date.now()}.csv`);
}

// Export recommendations to CSV
export function exportRecommendationsToCSV(recommendations: Recommendation[]) {
  const data = recommendations.map(r => ({
    Type: r.type,
    Product: r.product,
    Title: r.title,
    Reason: r.reason,
    'Current Price (₹)': r.currentPrice || 'N/A',
    'Suggested Price (₹)': r.suggestedPrice || 'N/A',
    Impact: r.impact,
    'Confidence (%)': r.confidence,
    Status: r.status,
    'Created': new Date(r.createdAt).toLocaleDateString('en-IN')
  }));

  exportToCSV(data, `recommendations-${Date.now()}.csv`);
}

// Export alerts to CSV
export function exportAlertsToCSV(alerts: Alert[]) {
  const data = alerts.map(a => ({
    Type: a.type,
    Severity: a.severity,
    Product: a.productName,
    Title: a.title,
    Description: a.description,
    Suggestion: a.suggestion,
    Acknowledged: a.acknowledged ? 'Yes' : 'No',
    'Created': new Date(a.createdAt).toLocaleDateString('en-IN')
  }));

  exportToCSV(data, `alerts-${Date.now()}.csv`);
}

// Generate PDF report (using browser print)
export function generatePDFReport(title: string, content: HTMLElement) {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('Please allow popups to generate PDF reports');
  }

  // Create styled HTML document
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
        }
        
        h1 {
          color: #2563eb;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        h2 {
          color: #1e40af;
          margin-top: 30px;
          margin-bottom: 15px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 14px;
        }
        
        th {
          background-color: #2563eb;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
        
        .metric {
          display: inline-block;
          margin: 10px 20px;
          padding: 15px;
          background: #f3f4f6;
          border-radius: 8px;
          min-width: 150px;
        }
        
        .metric-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>Generated on ${new Date().toLocaleString('en-IN', { 
          dateStyle: 'full', 
          timeStyle: 'short' 
        })}</p>
      </div>
      
      ${content.innerHTML}
      
      <div class="footer">
        <p>RetailMind AI - Market Intelligence Platform</p>
        <p>This report is confidential and intended for internal use only.</p>
      </div>
      
      <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
          Print / Save as PDF
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px;">
          Close
        </button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Auto-print after a short delay
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// Generate dashboard summary report
export function generateDashboardReport(data: {
  products: Product[];
  recommendations: Recommendation[];
  alerts: Alert[];
  stats: any;
}) {
  const reportContent = document.createElement('div');
  
  // Summary metrics
  const metricsHTML = `
    <h2>Summary Metrics</h2>
    <div style="text-align: center;">
      <div class="metric">
        <div class="metric-label">Total Products</div>
        <div class="metric-value">${data.products.length}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Active Alerts</div>
        <div class="metric-value">${data.alerts.filter(a => !a.acknowledged).length}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Pending Actions</div>
        <div class="metric-value">${data.recommendations.filter(r => r.status === 'pending').length}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Total Inventory Value</div>
        <div class="metric-value">₹${formatCurrency(
          data.products.reduce((sum, p) => sum + (p.currentPrice * p.stock), 0)
        )}</div>
      </div>
    </div>
  `;
  
  // Top products table
  const topProducts = data.products
    .sort((a, b) => (b.currentPrice * b.stock) - (a.currentPrice * a.stock))
    .slice(0, 10);
  
  const productsHTML = `
    <h2>Top 10 Products by Inventory Value</h2>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        ${topProducts.map(p => `
          <tr>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>₹${p.currentPrice.toLocaleString('en-IN')}</td>
            <td>${p.stock}</td>
            <td>₹${(p.currentPrice * p.stock).toLocaleString('en-IN')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  // Critical alerts
  const criticalAlerts = data.alerts.filter(a => a.severity === 'critical' && !a.acknowledged);
  const alertsHTML = criticalAlerts.length > 0 ? `
    <h2>Critical Alerts</h2>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Alert</th>
          <th>Suggestion</th>
        </tr>
      </thead>
      <tbody>
        ${criticalAlerts.map(a => `
          <tr>
            <td>${a.productName}</td>
            <td>${a.title}</td>
            <td>${a.suggestion}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '';
  
  reportContent.innerHTML = metricsHTML + productsHTML + alertsHTML;
  
  generatePDFReport('RetailMind AI - Dashboard Report', reportContent);
}

// Helper: Download blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper: Format currency
function formatCurrency(value: number): string {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toLocaleString('en-IN');
}
