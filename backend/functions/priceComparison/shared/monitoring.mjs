import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

const REGION = process.env.AWS_REGION || "us-east-1";
const METRIC_NAMESPACE = process.env.METRIC_NAMESPACE || "RetailMind";

const cloudWatch = new CloudWatchClient({ region: REGION });

export async function trackMetric(metricName, value, unit = "Count", dimensions = []) {
  const command = new PutMetricDataCommand({
    Namespace: METRIC_NAMESPACE,
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date(),
        Dimensions: dimensions,
      },
    ],
  });

  try {
    await cloudWatch.send(command);
  } catch (error) {
    console.warn("[MONITORING] Failed to publish metric", {
      metricName,
      message: error?.message,
    });
  }
}
