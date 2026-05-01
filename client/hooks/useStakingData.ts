import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { getStakerInfo, getGlobalStats } from "@/hooks/contract";

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

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface AutoRefreshConfig {
  interval?: number;
  cacheTtl?: number;
  backgroundRefresh?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: { staker: StakerInfo | null; global: GlobalStats | null }) => void;
}

class DataCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttl: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  getEntry(key: string): CacheEntry<T> | null {
    return this.cache.get(key) ?? null;
  }

  getFresh(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      return null;
    }

    return entry.data;
  }

  hasStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

const stakerCache = new DataCache<StakerInfo>();
const globalStatsCache = new DataCache<GlobalStats>();

let activeHookInstances = 0;

export function useStakingData(
  walletAddress: string | null,
  config: AutoRefreshConfig = {}
) {
  const {
    interval = 10000,
    cacheTtl = 30000,
    backgroundRefresh = true,
    onError,
    onSuccess,
  } = config;

  const [stakerInfo, setStakerInfo] = useState<StakerInfo | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [cacheHits, setCacheHits] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundRefreshRef = useRef<NodeJS.Timeout | null>(null);

  const stakerCacheKey = useMemo(
    () => (walletAddress ? `staker_${walletAddress}` : null),
    [walletAddress]
  );

  const globalCacheKey = "global_stats";

  useEffect(() => {
    activeHookInstances += 1;

    return () => {
      activeHookInstances -= 1;

      if (intervalRef.current) clearInterval(intervalRef.current);
      if (backgroundRefreshRef.current) clearTimeout(backgroundRefreshRef.current);

      if (activeHookInstances === 0) {
        stakerCache.clear();
        globalStatsCache.clear();
      }
    };
  }, []);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!walletAddress && !forceRefresh) return;

      setIsLoading(true);
      setError(null);

      try {
        let stakerData: StakerInfo | null = null;
        let globalData: GlobalStats | null = null;
        let cacheUsed = false;
        let usedStaleCache = false;

        if (!forceRefresh) {
          if (stakerCacheKey) {
            const stakerEntry = stakerCache.getEntry(stakerCacheKey);
            if (stakerEntry) {
              stakerData = stakerEntry.data;
              cacheUsed = true;
              if (Date.now() - stakerEntry.timestamp > stakerEntry.ttl) {
                usedStaleCache = true;
              }
            }
          }

          const globalEntry = globalStatsCache.getEntry(globalCacheKey);
          if (globalEntry) {
            globalData = globalEntry.data;
            cacheUsed = true;
            if (Date.now() - globalEntry.timestamp > globalEntry.ttl) {
              usedStaleCache = true;
            }
          }

          if (cacheUsed) {
            setCacheHits((prev) => prev + 1);
          }
        }

        if (!stakerData && walletAddress) {
          stakerData = await getStakerInfo(walletAddress);
          if (stakerData && stakerCacheKey) {
            stakerCache.set(stakerCacheKey, stakerData, cacheTtl);
          }
        }

        if (!globalData) {
          globalData = await getGlobalStats();
          if (globalData) {
            globalStatsCache.set(globalCacheKey, globalData, cacheTtl);
          }
        }

        setStakerInfo(stakerData);
        setGlobalStats(globalData);
        setLastUpdated(new Date());

        if (onSuccess) {
          onSuccess({ staker: stakerData, global: globalData });
        }

        if (backgroundRefresh && cacheUsed && !forceRefresh && !usedStaleCache) {
          if (backgroundRefreshRef.current) clearTimeout(backgroundRefreshRef.current);

          backgroundRefreshRef.current = setTimeout(async () => {
            try {
              const [freshStaker, freshGlobal] = await Promise.all([
                walletAddress ? getStakerInfo(walletAddress) : Promise.resolve(null),
                getGlobalStats(),
              ]);

              if (freshStaker && stakerCacheKey) {
                stakerCache.set(stakerCacheKey, freshStaker, cacheTtl);
                setStakerInfo(freshStaker);
              }

              if (freshGlobal) {
                globalStatsCache.set(globalCacheKey, freshGlobal, cacheTtl);
                setGlobalStats(freshGlobal);
              }

              setLastUpdated(new Date());
            } catch {
              // Silent background refresh failure
            }
          }, 1000);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch data";
        setError(errorMessage);

        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, stakerCacheKey, cacheTtl, backgroundRefresh, onError, onSuccess]
  );

  useEffect(() => {
    if (!walletAddress) {
      setStakerInfo(null);
      setGlobalStats(null);
      setLastUpdated(null);
      setError(null);
      return;
    }

    void fetchData(false);
  }, [walletAddress, fetchData]);

  useEffect(() => {
    if (!autoRefreshEnabled || !walletAddress) return;

    intervalRef.current = setInterval(() => {
      void fetchData(true);
    }, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [walletAddress, interval, autoRefreshEnabled, fetchData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isStale = useMemo(() => {
    if (!lastUpdated) return false;
    return currentTime - lastUpdated.getTime() > cacheTtl;
  }, [lastUpdated, cacheTtl, currentTime]);

  const timeSinceUpdate = useMemo(() => {
    if (!lastUpdated) return null;
    return Math.floor((currentTime - lastUpdated.getTime()) / 1000);
  }, [lastUpdated, currentTime]);

  const clearCache = useCallback(() => {
    stakerCache.clear();
    globalStatsCache.clear();
    setCacheHits(0);
  }, []);

  return {
    stakerInfo,
    globalStats,
    isLoading,
    error,
    lastUpdated,
    isStale,
    timeSinceUpdate,
    cacheHits,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    refresh: () => fetchData(false),
    clearCache,
  };
}

export function useRewardMetrics(globalStats: GlobalStats | null) {
  const metrics = useMemo(() => {
    if (!globalStats) {
      return {
        apy: "0.00",
        rewardRate: "0.00000000",
        secondlyReward: "0",
        dailyReward: "0",
        monthlyReward: "0",
      };
    }

    const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60;
    const rewardRate = BigInt(globalStats.reward_rate);
    const totalStaked = BigInt(globalStats.total_staked);

    if (totalStaked === BigInt(0)) {
      return {
        apy: "0.00",
        rewardRate: (Number(rewardRate) / 1000000000).toFixed(8),
        secondlyReward: "0",
        dailyReward: "0",
        monthlyReward: "0",
      };
    }

    const yearlyRewards = Number(rewardRate) * SECONDS_PER_YEAR;
    const apy = (yearlyRewards / Number(totalStaked)) * 100;

    const secondlyReward = Number(rewardRate) / 1000000000;
    const dailyReward = secondlyReward * 86400;
    const monthlyReward = dailyReward * 30;

    return {
      apy: apy.toFixed(2),
      rewardRate: (Number(rewardRate) / 1000000000).toFixed(8),
      secondlyReward: secondlyReward.toFixed(8),
      dailyReward: dailyReward.toFixed(8),
      monthlyReward: monthlyReward.toFixed(6),
    };
  }, [globalStats]);

  return metrics;
}

export type TransactionState =
  | "idle"
  | "signing"
  | "pending"
  | "confirmed"
  | "failed"
  | "error";

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