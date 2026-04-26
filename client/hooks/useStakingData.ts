import { useEffect, useState, useCallback, useRef } from "react";
import {
  getStakerInfo,
  getGlobalStats,
} from "@/hooks/contract";

export interface StakerInfo {
  staked: string;
  pending_rewards: string;
  last_reward_per_token: string;
}

export interface GlobalStats {
  total_staked: string;
  staker_count: string;
  reward_rate: string;
}

interface AutoRefreshConfig {
  interval?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: { staker: StakerInfo | null; global: GlobalStats | null }) => void;
}

/**
 * Custom hook for auto-refreshing staking data
 * Handles polling, error recovery, and state management
 */
export function useStakingData(
  walletAddress: string | null,
  config: AutoRefreshConfig = {}
) {
  const { interval = 10000, onError, onSuccess } = config;

  const [stakerInfo, setStakerInfo] = useState<StakerInfo | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!walletAddress || !autoRefreshEnabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const [staker, global] = await Promise.all([
        getStakerInfo(walletAddress),
        getGlobalStats(),
      ]);

      setStakerInfo(staker || null);
      setGlobalStats(global || null);
      setLastUpdated(new Date());
      onSuccess?.({ staker: staker || null, global: global || null });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, autoRefreshEnabled, onError, onSuccess]);

  // Initial fetch
  useEffect(() => {
    if (walletAddress) {
      fetchData();
    }
  }, [walletAddress]); // Only depend on walletAddress to avoid cascading renders

  // Auto-refresh
  useEffect(() => {
    if (!walletAddress || !autoRefreshEnabled) return;

    intervalRef.current = setInterval(() => {
      fetchData();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [walletAddress, interval, autoRefreshEnabled, fetchData]);

  const manualRefresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled((prev) => !prev);
  }, []);

  return {
    stakerInfo,
    globalStats,
    isLoading,
    error,
    lastUpdated,
    autoRefreshEnabled,
    refresh: manualRefresh,
    toggleAutoRefresh,
  };
}

/**
 * Hook for calculating APY and reward metrics
 */
export function useRewardMetrics(globalStats: GlobalStats | null) {
  const [metrics, setMetrics] = useState({
    apy: "0.00",
    rewardRate: "0",
    secondlyReward: "0",
    dailyReward: "0",
    monthlyReward: "0",
  });

  useEffect(() => {
    if (!globalStats) return;

    const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60; // 31,536,000
    const rewardRate = BigInt(globalStats.reward_rate);
    const totalStaked = BigInt(globalStats.total_staked);

    // Avoid division by zero
    if (totalStaked === BigInt(0)) {
      setMetrics({ // eslint-disable-line react-hooks/exhaustive-deps
        apy: "0.00",
        rewardRate: (Number(rewardRate) / 1000000000).toFixed(8),
        secondlyReward: "0",
        dailyReward: "0",
        monthlyReward: "0",
      });
      return;
    }

    // Calculate APY
    const yearlyRewards = Number(rewardRate) * SECONDS_PER_YEAR;
    const apy = (yearlyRewards / Number(totalStaked)) * 100;

    // Calculate various reward periods
    const secondlyReward = Number(rewardRate) / 1000000000;
    const dailyReward = secondlyReward * 86400;
    const monthlyReward = dailyReward * 30;

    setMetrics({
      apy: apy.toFixed(2),
      rewardRate: (Number(rewardRate) / 1000000000).toFixed(8),
      secondlyReward: secondlyReward.toFixed(8),
      dailyReward: dailyReward.toFixed(8),
      monthlyReward: monthlyReward.toFixed(6),
    });
  }, [globalStats]);

  return metrics;
}

/**
 * Hook for transaction state management
 */
export type TransactionState = "idle" | "signing" | "pending" | "confirmed" | "failed" | "error";

interface TransactionRecord {
  type: "stake" | "unstake" | "claim" | "compound";
  amount?: string;
  timestamp: Date;
  hash?: string;
  status: TransactionState;
  error?: string;
}

export function useTransactionHistory(maxRecords: number = 10) {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  const addTransaction = useCallback(
    (record: Omit<TransactionRecord, "timestamp">) => {
      setTransactions((prev) => [
        { ...record, timestamp: new Date() },
        ...prev.slice(0, maxRecords - 1),
      ]);
    },
    [maxRecords]
  );

  const updateTransaction = useCallback(
    (index: number, updates: Partial<TransactionRecord>) => {
      setTransactions((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...updates };
        return updated;
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    setTransactions([]);
  }, []);

  return {
    transactions,
    addTransaction,
    updateTransaction,
    clearHistory,
  };
}

/**
 * Hook for debouncing refresh operations
 */
export function useDebouncedRefresh(
  refreshFn: () => Promise<void>,
  delayMs: number = 1000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const debouncedRefresh = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsRefreshing(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        await refreshFn();
      } finally {
        setIsRefreshing(false);
      }
    }, delayMs);
  }, [refreshFn, delayMs]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedRefresh, isRefreshing, cancel };
}

/**
 * Hook for error classification and user messaging
 */
export enum ErrorType {
  INSUFFICIENT_BALANCE = "insufficient_balance",
  INSUFFICIENT_STAKE = "insufficient_stake",
  INVALID_AMOUNT = "invalid_amount",
  NETWORK_ERROR = "network_error",
  SIGNATURE_REJECTED = "signature_rejected",
  CONTRACT_ERROR = "contract_error",
  TIMEOUT = "timeout",
  UNKNOWN = "unknown",
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  userMessage: string;
  recoverable: boolean;
}

export function useErrorHandler() {
  const classifyError = useCallback((error: Error | string): ErrorInfo => {
    const message = (typeof error === "string" ? error : error.message).toLowerCase();

    let type = ErrorType.UNKNOWN;
    let userMessage = "An error occurred. Please try again.";
    let recoverable = false;

    if (message.includes("insufficient balance")) {
      type = ErrorType.INSUFFICIENT_BALANCE;
      userMessage = "You don't have enough tokens to complete this operation.";
      recoverable = true;
    } else if (message.includes("insufficient staked")) {
      type = ErrorType.INSUFFICIENT_STAKE;
      userMessage = "You don't have enough staked tokens for this operation.";
      recoverable = true;
    } else if (message.includes("invalid amount")) {
      type = ErrorType.INVALID_AMOUNT;
      userMessage = "Please enter a valid amount.";
      recoverable = true;
    } else if (message.includes("network") || message.includes("timeout")) {
      type = ErrorType.NETWORK_ERROR;
      userMessage = "Network error. Please check your connection and try again.";
      recoverable = true;
    } else if (message.includes("rejected") || message.includes("denied")) {
      type = ErrorType.SIGNATURE_REJECTED;
      userMessage = "You rejected the transaction. No changes were made.";
      recoverable = true;
    } else if (message.includes("contract")) {
      type = ErrorType.CONTRACT_ERROR;
      userMessage = "Smart contract error. Please try again later.";
      recoverable = false;
    }

    return {
      type,
      message: typeof error === "string" ? error : error.message,
      userMessage,
      recoverable,
    };
  }, []);

  return { classifyError };
}
