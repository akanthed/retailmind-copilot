// Revenue Calculator Lambda Function
// Calculates revenue impact metrics, competitive scores, and alert response rates

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, QueryCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const PRODUCTS_TABLE = "RetailMind-Products";
const PRICE_HISTORY_TABLE = "RetailMind-PriceHistory";
const ALERTS_TABLE = "RetailMind-Alerts";
const REVENUE_IMPACT_TABLE = "RetailMind-RevenueImpact";

export const handler = async (event) => {
  console.log("Revenue Calculator invoked:", JSON.stringify(event));

  const httpMethod = event.httpMethod;
  const path = event.path;

  try {
    let response;

    if (httpMethod === "GET" && path.includes("/summary")) {
      response = await getRevenueSummary(event);
    } else if (httpMethod === "GET" && path.includes("/history")) {
      response = await getRevenueHistory(event);
    } else if (httpMethod === "POST" && path.includes("/calculate")) {
      response = await calculateRevenueImpact(event);
    } else {
      response = {
        statusCode: 404,
        body: { error: "Not found" },
      };
    }

    return {
      statusCode: response.statusCode || 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(response.body || response),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};

// Get revenue summary for a date range
async function getRevenueSummary(event) {
  const queryParams = event.queryStringParameters || {};
  
  // Default to current month if no dates provided
  const now = new Date();
  const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const defaultEndDate = now.toISOString().split("T")[0];
  
  const startDate = queryParams.startDate || defaultStartDate;
  const endDate = queryParams.endDate || defaultEndDate;

  // Validate date format
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return {
      statusCode: 400,
      body: {
        error: "Invalid date format",
        message: "Dates must be in YYYY-MM-DD format",
      },
    };
  }

  // Query revenue impact table for the date range
  const metrics = await queryMetricsInDateRange(startDate, endDate);

  // Aggregate metrics
  const revenueProtected = metrics
    .filter((m) => m.metric_type === "revenue_protected")
    .reduce((sum, m) => sum + m.value, 0);

  const competitiveScores = metrics.filter((m) => m.metric_type === "competitive_score");
  const avgCompetitiveScore =
    competitiveScores.length > 0
      ? competitiveScores.reduce((sum, m) => sum + m.value, 0) / competitiveScores.length
      : 0;

  const responseRates = metrics.filter((m) => m.metric_type === "response_rate");
  const avgResponseRate =
    responseRates.length > 0
      ? responseRates.reduce((sum, m) => sum + m.value, 0) / responseRates.length
      : 0;

  // Get alert statistics
  const alertStats = await getAlertStatistics(startDate, endDate);

  return {
    statusCode: 200,
    body: {
      revenue_protected: Math.round(revenueProtected),
      alert_response_rate: Math.round(avgResponseRate * 10) / 10,
      competitive_score: Math.round(avgCompetitiveScore * 10) / 10,
      period: {
        start: startDate,
        end: endDate,
      },
      alerts_responded: alertStats.responded,
      alerts_total: alertStats.total,
    },
  };
}

// Get revenue history for the last N days
async function getRevenueHistory(event) {
  const queryParams = event.queryStringParameters || {};
  const days = Math.min(parseInt(queryParams.days || "30"), 90);

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  // Query metrics
  const metrics = await queryMetricsInDateRange(startDateStr, endDateStr);

  // Group by date
  const dailyMetrics = {};
  metrics.forEach((metric) => {
    if (!dailyMetrics[metric.date]) {
      dailyMetrics[metric.date] = {
        date: metric.date,
        revenue_protected: 0,
        competitive_score: 0,
      };
    }

    if (metric.metric_type === "revenue_protected") {
      dailyMetrics[metric.date].revenue_protected = metric.value;
    } else if (metric.metric_type === "competitive_score") {
      dailyMetrics[metric.date].competitive_score = metric.value;
    }
  });

  // Convert to array and sort chronologically
  const history = Object.values(dailyMetrics).sort((a, b) => a.date.localeCompare(b.date));

  return {
    statusCode: 200,
    body: {
      history: history,
      count: history.length,
    },
  };
}

// Calculate revenue impact (triggered manually or by schedule)
async function calculateRevenueImpact(event) {
  console.log("Calculating revenue impact...");

  const today = new Date().toISOString().split("T")[0];

  // Get all products
  const products = await getAllProducts();
  
  // Get all alerts from last 30 days
  const alerts = await getRecentAlerts(30);
  
  // Get price history
  const priceHistory = await getAllPriceHistory();

  // Calculate revenue from alert responses
  let totalRevenue = 0;
  for (const alert of alerts) {
    if (alert.responseAction) {
      const product = products.find((p) => p.id === alert.productId);
      if (product) {
        const revenue = await attributeRevenueToAlert(alert, product);
        totalRevenue += revenue;
      }
    }
  }

  // Calculate competitive score
  const competitiveScore = await calculateCompetitiveScore(products, priceHistory, alerts);

  // Calculate response rate
  const responseRate = calculateResponseRate(alerts);

  // Store metrics
  await storeRevenueMetric(today, "revenue_protected", totalRevenue);
  await storeRevenueMetric(today, "competitive_score", competitiveScore);
  await storeRevenueMetric(today, "response_rate", responseRate);

  return {
    statusCode: 200,
    body: {
      message: "Revenue impact calculated successfully",
      date: today,
      revenue_protected: Math.round(totalRevenue),
      competitive_score: Math.round(competitiveScore * 10) / 10,
      response_rate: Math.round(responseRate * 10) / 10,
    },
  };
}

// Helper: Query metrics in date range
async function queryMetricsInDateRange(startDate, endDate) {
  const command = new ScanCommand({
    TableName: REVENUE_IMPACT_TABLE,
    FilterExpression: "#date BETWEEN :start AND :end",
    ExpressionAttributeNames: {
      "#date": "date",
    },
    ExpressionAttributeValues: {
      ":start": startDate,
      ":end": endDate,
    },
  });

  try {
    const result = await docClient.send(command);
    return result.Items || [];
  } catch (error) {
    console.error("Error querying metrics:", error);
    return [];
  }
}

// Helper: Get alert statistics
async function getAlertStatistics(startDate, endDate) {
  const command = new ScanCommand({
    TableName: ALERTS_TABLE,
  });

  try {
    const result = await docClient.send(command);
    const alerts = result.Items || [];

    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();

    const relevantAlerts = alerts.filter((a) => {
      const alertTime = a.createdAt;
      return alertTime >= startTime && alertTime <= endTime;
    });

    const respondedAlerts = relevantAlerts.filter((a) => a.responseAction);

    return {
      total: relevantAlerts.length,
      responded: respondedAlerts.length,
    };
  } catch (error) {
    console.error("Error getting alert statistics:", error);
    return { total: 0, responded: 0 };
  }
}

// Helper: Get all products
async function getAllProducts() {
  const command = new ScanCommand({
    TableName: PRODUCTS_TABLE,
  });

  try {
    const result = await docClient.send(command);
    return result.Items || [];
  } catch (error) {
    console.error("Error getting products:", error);
    return [];
  }
}

// Helper: Get recent alerts
async function getRecentAlerts(days) {
  const command = new ScanCommand({
    TableName: ALERTS_TABLE,
  });

  try {
    const result = await docClient.send(command);
    const alerts = result.Items || [];

    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    return alerts.filter((a) => a.createdAt >= cutoffTime);
  } catch (error) {
    console.error("Error getting alerts:", error);
    return [];
  }
}

// Helper: Get all price history
async function getAllPriceHistory() {
  const command = new ScanCommand({
    TableName: PRICE_HISTORY_TABLE,
  });

  try {
    const result = await docClient.send(command);
    return result.Items || [];
  } catch (error) {
    console.error("Error getting price history:", error);
    return [];
  }
}

// Helper: Store revenue metric
async function storeRevenueMetric(date, metricType, value, metadata = {}) {
  const calculatedAt = Date.now();
  const ttl = Math.floor(calculatedAt / 1000) + 365 * 24 * 60 * 60; // 365 days

  const command = new PutCommand({
    TableName: REVENUE_IMPACT_TABLE,
    Item: {
      date: date,
      metric_type: metricType,
      value: value,
      calculated_at: calculatedAt,
      ttl: ttl,
      metadata: metadata,
    },
  });

  try {
    await docClient.send(command);
    console.log(`Stored metric: ${date} - ${metricType} = ${value}`);
  } catch (error) {
    console.error("Error storing metric:", error);
    throw error;
  }
}

// Helper: Validate date format
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Calculate revenue from price adjustment alert
function calculatePriceAdjustmentRevenue(alert, product) {
  if (alert.responseAction !== "price_adjusted") return 0;
  if (!alert.data || !alert.responseTime) return 0;

  const priceDifference = alert.data.yourPrice - alert.data.competitorPrice;
  
  // Estimate daily sales from stock velocity
  const estimatedDailySales = product.stockDays > 0 ? product.stock / product.stockDays : 0;
  
  // Calculate days since adjustment
  const daysSinceAdjustment = (Date.now() - alert.responseTime) / (1000 * 60 * 60 * 24);
  
  // Revenue protected = price difference × daily sales × days active × 0.2
  // Assumes matching competitor price prevented 20% sales loss
  const revenueProtected = priceDifference * estimatedDailySales * daysSinceAdjustment * 0.2;
  
  return Math.max(0, Math.round(revenueProtected));
}

// Calculate revenue from restocking alert
function calculateRestockRevenue(alert, product) {
  if (alert.responseAction !== "restocked") return 0;
  if (!product.currentPrice || !product.stock || !product.stockDays) return 0;

  // Prevented stockout loss = product value × estimated lost sales
  const dailySales = product.stockDays > 0 ? product.stock / product.stockDays : 0;
  const stockoutDays = Math.max(0, 7 - product.stockDays); // Would have been out for ~7 days
  const lostSalesValue = product.currentPrice * dailySales * stockoutDays;
  
  return Math.round(lostSalesValue);
}

// Attribute revenue to alert based on response action
async function attributeRevenueToAlert(alert, product) {
  if (!alert.responseAction) return 0;

  switch (alert.responseAction) {
    case "price_adjusted":
      return calculatePriceAdjustmentRevenue(alert, product);
    case "restocked":
      return calculateRestockRevenue(alert, product);
    case "acknowledged":
    case "dismissed":
    default:
      return 0;
  }
}

// Calculate competitive score (0.0 - 10.0)
async function calculateCompetitiveScore(products, priceHistory, alerts) {
  if (products.length === 0) return 0.0;

  let priceScore = 0;
  let stockScore = 0;
  let responseScore = 0;

  // Price Competitiveness (40%)
  products.forEach((product) => {
    const competitorPrices = priceHistory.filter(
      (p) => p.productId === product.id && p.price > 0
    );

    if (competitorPrices.length > 0) {
      const lowestCompetitorPrice = Math.min(...competitorPrices.map((p) => p.price));
      const priceDiff = ((product.currentPrice - lowestCompetitorPrice) / lowestCompetitorPrice) * 100;

      if (priceDiff <= 5) {
        priceScore += 10; // Within 5% = max points
      } else if (priceDiff <= 10) {
        priceScore += 7;
      } else if (priceDiff <= 15) {
        priceScore += 4;
      } else {
        priceScore += 1;
      }
    } else {
      priceScore += 5; // No competitor data = neutral score
    }
  });
  priceScore = (priceScore / products.length) * 0.4;

  // Stock Availability (30%)
  const inStockCount = products.filter((p) => p.stock > 0).length;
  stockScore = (inStockCount / products.length) * 10 * 0.3;

  // Alert Response Rate (30%)
  const recentAlerts = alerts.filter((a) => a.createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000);
  const respondedAlerts = recentAlerts.filter((a) => {
    if (!a.responseAction || !a.responseTime) return false;
    return a.responseTime - a.createdAt < 24 * 60 * 60 * 1000; // 24 hours
  });
  const responseRate = recentAlerts.length > 0 ? respondedAlerts.length / recentAlerts.length : 0;
  responseScore = responseRate * 10 * 0.3;

  const finalScore = priceScore + stockScore + responseScore;
  return Math.round(finalScore * 10) / 10;
}

function calculateResponseRate(alerts) {
  if (alerts.length === 0) return 0;
  
  const respondedAlerts = alerts.filter((a) => {
    if (!a.responseAction || !a.responseTime) return false;
    const responseDelay = a.responseTime - a.createdAt;
    return responseDelay < 24 * 60 * 60 * 1000; // 24 hours
  });

  return (respondedAlerts.length / alerts.length) * 100;
}

// Generate demo revenue data for hackathon/demo purposes
function generateDemoRevenueData(days = 30) {
  const baseRevenue = 40000; // Monthly base (₹40,000)
  const dailyBase = baseRevenue / 30;
  
  const history = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add realistic variation (±20%)
    const variation = (Math.random() - 0.5) * 0.4;
    const revenue = Math.round(dailyBase * (1 + variation));
    
    // Competitive score with slight upward trend
    const scoreBase = 7.0 + (days - i) * 0.02;
    const scoreVariation = (Math.random() - 0.5) * 0.6;
    const score = Math.max(6.5, Math.min(8.5, scoreBase + scoreVariation));
    
    history.push({
      date: date.toISOString().split("T")[0],
      revenue_protected: revenue,
      competitive_score: Math.round(score * 10) / 10,
    });
  }
  
  return history;
}

// Export functions for testing
export {
  calculatePriceAdjustmentRevenue,
  calculateRestockRevenue,
  calculateCompetitiveScore,
  calculateResponseRate,
  generateDemoRevenueData,
};
