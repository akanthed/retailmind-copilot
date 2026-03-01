// Export utilities for CSV and PDF generation

import type { Product, Recommendation, Alert, DemandForecast, PriceHistory } from "@/api/client";

// CSV Export Functions

export function exportProductsToCSV(products: Product[]): void {
  const headers = ["SKU", "Name", "Category", "Current Price", "Cost Price", "Stock", "Stock Days", "Created At"];
  const rows = products.map(p => [
    p.sku,
    p.name,
    p.category,
    p.currentPrice,
    p.costPrice,
    p.stock,
    p.stockDays || 0,
    new Date(p.createdAt).toLocaleDateString()
  ]);

  downloadCSV("products", headers, rows);
}

export function exportRecommendationsToCSV(recommendations: Recommendation[]): void {
  const headers = ["Product", "Type", "Title", "Reason", "Current Price", "Suggested Price", "Impact", "Confidence", "Status", "Created At"];
  const rows = recommendations.map(r => [
    r.product,
    r.type,
    r.title,
    r.reason,
    r.currentPrice || "",
    r.suggestedPrice || "",
    r.impact || "",
    `${Math.round((r.confidence || 0) * 100)}%`,
    r.status || "pending",
    new Date(r.createdAt).toLocaleDateString()
  ]);

  downloadCSV("recommendations", headers, rows);
}

export function exportAlertsToCSV(alerts: Alert[]): void {
  const headers = ["Product", "Type", "Title", "Description", "Severity", "Acknowledged", "Created At"];
  const rows = alerts.map(a => [
    a.productName,
    a.type,
    a.title,
    a.description,
    a.severity,
    a.acknowledged ? "Yes" : "No",
    new Date(a.createdAt).toLocaleDateString()
  ]);

  downloadCSV("alerts", headers, rows);
}

export function exportForecastsToCSV(forecasts: DemandForecast[]): void {
  const headers = ["Product", "Date", "Predicted Demand", "Confidence", "Festival", "Festival Impact"];
  const rows: any[] = [];

  forecasts.forEach(forecast => {
    forecast.dailyForecasts.forEach(pred => {
      rows.push([
        forecast.productName,
        pred.date,
        pred.predictedDemand,
        `${Math.round(pred.confidence * 100)}%`,
        pred.festival || "",
        pred.festivalImpact ? `${Math.round((pred.festivalImpact - 1) * 100)}%` : ""
      ]);
    });
  });

  downloadCSV("demand-forecasts", headers, rows);
}

export function exportPriceHistoryToCSV(history: PriceHistory[]): void {
  const headers = ["Product", "Competitor", "Price", "In Stock", "Source", "Date"];
  const rows = history.map(h => [
    h.productName,
    h.competitorName,
    h.price,
    h.inStock ? "Yes" : "No",
    h.source,
    new Date(h.timestamp).toLocaleDateString()
  ]);

  downloadCSV("price-history", headers, rows);
}

function downloadCSV(filename: string, headers: string[], rows: any[][]): void {
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => {
      // Escape cells containing commas or quotes
      const cellStr = String(cell);
      if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// PDF Export Functions (using browser print)

export function exportRecommendationsToPDF(recommendations: Recommendation[]): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export PDF");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>RetailMind AI - Recommendations Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        h1 {
          color: #2D9B8E;
          border-bottom: 3px solid #2D9B8E;
          padding-bottom: 10px;
        }
        .meta {
          color: #666;
          margin-bottom: 30px;
        }
        .recommendation {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .recommendation h3 {
          margin-top: 0;
          color: #2D9B8E;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-right: 8px;
        }
        .badge-price_decrease { background: #dcfce7; color: #166534; }
        .badge-price_increase { background: #fef3c7; color: #92400e; }
        .badge-restock { background: #dbeafe; color: #1e40af; }
        .badge-promotion { background: #fce7f3; color: #9f1239; }
        .detail {
          margin: 10px 0;
        }
        .detail strong {
          color: #555;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <h1>RetailMind AI - Recommendations Report</h1>
      <div class="meta">
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Total Recommendations: ${recommendations.length}</p>
      </div>
      ${recommendations.map(r => `
        <div class="recommendation">
          <h3>${r.title}</h3>
          <div>
            <span class="badge badge-${r.type}">${r.type.replace(/_/g, " ").toUpperCase()}</span>
            <span class="badge" style="background: #f3f4f6; color: #374151;">
              ${Math.round((r.confidence || 0) * 100)}% Confidence
            </span>
          </div>
          <div class="detail"><strong>Product:</strong> ${r.product}</div>
          <div class="detail"><strong>Reason:</strong> ${r.reason}</div>
          ${r.currentPrice ? `<div class="detail"><strong>Current Price:</strong> ₹${r.currentPrice.toLocaleString()}</div>` : ""}
          ${r.suggestedPrice ? `<div class="detail"><strong>Suggested Price:</strong> ₹${r.suggestedPrice.toLocaleString()}</div>` : ""}
          ${r.impact ? `<div class="detail"><strong>Expected Impact:</strong> ${r.impact}</div>` : ""}
          ${r.suggestedAction ? `<div class="detail"><strong>Action:</strong> ${r.suggestedAction}</div>` : ""}
        </div>
      `).join("")}
      <script>
        window.onload = () => {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function exportAlertsToPDF(alerts: Alert[]): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export PDF");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>RetailMind AI - Alerts Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        h1 {
          color: #2D9B8E;
          border-bottom: 3px solid #2D9B8E;
          padding-bottom: 10px;
        }
        .meta {
          color: #666;
          margin-bottom: 30px;
        }
        .alert {
          border-left: 4px solid #ddd;
          padding: 15px 20px;
          margin-bottom: 15px;
          page-break-inside: avoid;
        }
        .alert.critical { border-left-color: #dc2626; background: #fef2f2; }
        .alert.warning { border-left-color: #f59e0b; background: #fffbeb; }
        .alert.info { border-left-color: #3b82f6; background: #eff6ff; }
        .alert h3 {
          margin-top: 0;
          font-size: 16px;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-right: 8px;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <h1>RetailMind AI - Alerts Report</h1>
      <div class="meta">
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Total Alerts: ${alerts.length}</p>
      </div>
      ${alerts.map(a => `
        <div class="alert ${a.severity}">
          <h3>${a.title}</h3>
          <p><strong>Product:</strong> ${a.productName}</p>
          <p>${a.description}</p>
          <p style="color: #666; font-size: 12px; margin-top: 10px;">
            ${new Date(a.createdAt).toLocaleString()} • ${a.type.replace(/_/g, " ")}
          </p>
        </div>
      `).join("")}
      <script>
        window.onload = () => {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
