import React, { useState, useEffect } from "react";
import { checkPerformanceBudgets } from "../PerformanceMonitor/PerformanceMonitor";

interface PerformanceMetrics {
  lcp: { value: number; budget: number; passed: boolean };
  inp: { value: number; budget: number; passed: boolean };
  cls: { value: number; budget: number; passed: boolean };
}

interface PerformanceDashboardProps {
  enabled?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  collapsed?: boolean;
}

/**
 * Performance Dashboard - Real-time Core Web Vitals monitoring
 * Only visible in development mode by default
 */
const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  enabled = process.env.NODE_ENV === "development",
  position = "bottom-right",
  collapsed = true,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const updateMetrics = async () => {
      setIsLoading(true);
      try {
        const budgetResults = await checkPerformanceBudgets();
        setMetrics(budgetResults);
      } catch (error) {
        console.error("Failed to check performance budgets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    updateMetrics();

    // Update metrics every 10 seconds
    const interval = setInterval(updateMetrics, 10000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  const getPositionStyles = () => {
    const base = {
      position: "fixed" as const,
      zIndex: 9999,
      fontSize: "12px",
      fontFamily: "monospace",
    };

    switch (position) {
      case "top-left":
        return { ...base, top: "20px", left: "20px" };
      case "top-right":
        return { ...base, top: "20px", right: "20px" };
      case "bottom-left":
        return { ...base, bottom: "20px", left: "20px" };
      case "bottom-right":
      default:
        return { ...base, bottom: "20px", right: "20px" };
    }
  };

  const getMetricColor = (passed: boolean) => passed ? "#22c55e" : "#ef4444";

  const formatValue = (metric: string, value: number) => {
    switch (metric) {
      case "lcp":
      case "inp":
        return `${Math.round(value)}ms`;
      case "cls":
        return value.toFixed(3);
      default:
        return value.toString();
    }
  };

  return (
    <div
      style={{
        ...getPositionStyles(),
        background: "rgba(0, 0, 0, 0.9)",
        color: "white",
        padding: isCollapsed ? "8px 12px" : "12px 16px",
        borderRadius: "6px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        minWidth: isCollapsed ? "auto" : "200px",
      }}
      onClick={() => setIsCollapsed(!isCollapsed)}
      title={
        isCollapsed
          ? "Click to expand performance metrics"
          : "Click to collapse"
      }
    >
      {isCollapsed ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: metrics
                ? metrics.lcp.passed && metrics.inp.passed && metrics.cls.passed
                  ? "#22c55e"
                  : "#ef4444"
                : "#6b7280",
            }}
          />
          <span>Perf</span>
          {isLoading && (
            <div
              style={{
                width: "12px",
                height: "12px",
                border: "2px solid transparent",
                borderTop: "2px solid white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          )}
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
              paddingBottom: "4px",
            }}
          >
            <strong>Core Web Vitals</strong>
            {isLoading && (
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  border: "2px solid transparent",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            )}
          </div>

          {metrics ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>LCP:</span>
                <span style={{ color: getMetricColor(metrics.lcp.passed) }}>
                  {formatValue("lcp", metrics.lcp.value)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>INP:</span>
                <span style={{ color: getMetricColor(metrics.inp.passed) }}>
                  {formatValue("inp", metrics.inp.value)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>CLS:</span>
                <span style={{ color: getMetricColor(metrics.cls.passed) }}>
                  {formatValue("cls", metrics.cls.value)}
                </span>
              </div>
              <div
                style={{
                  marginTop: "8px",
                  paddingTop: "4px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                  fontSize: "10px",
                  color: "#9ca3af",
                }}
              >
                Click to collapse
              </div>
            </div>
          ) : (
            <div style={{ color: "#9ca3af" }}>Loading metrics...</div>
          )}
        </div>
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default PerformanceDashboard;

// Hook for using performance metrics in other components
export const usePerformanceMetrics = (interval: number = 10000) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const updateMetrics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const budgetResults = await checkPerformanceBudgets();
        setMetrics(budgetResults);
      } catch (err) {
        setError(err as Error);
        console.error("Failed to check performance budgets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    updateMetrics();
    const intervalId = setInterval(updateMetrics, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return { metrics, isLoading, error };
};
