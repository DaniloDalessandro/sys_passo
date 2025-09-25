"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Enhanced useDebounce hook with advanced features
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @param options - Additional options
 */
export function useDebounce<T>(
  value: T, 
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastCallTime = useRef<number | null>(null)
  const lastInvokeTime = useRef<number>(0)

  const { leading = false, trailing = true, maxWait } = options

  useEffect(() => {
    const now = Date.now()
    lastCallTime.current = now

    const invokeValue = () => {
      setDebouncedValue(value)
      lastInvokeTime.current = now
    }

    const shouldInvokeLeading = () => {
      return leading && (lastInvokeTime.current === 0 || (now - lastInvokeTime.current) >= delay)
    }

    const remainingWait = () => {
      const timeSinceLastCall = now - (lastCallTime.current || 0)
      const timeSinceLastInvoke = now - lastInvokeTime.current
      const timeWaiting = delay - timeSinceLastCall

      return maxWait === undefined 
        ? timeWaiting
        : Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
    }

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current)
    }

    // Handle leading edge
    if (shouldInvokeLeading()) {
      invokeValue()
      return
    }

    // Handle trailing edge and maxWait
    const wait = remainingWait()
    
    if (wait <= 0 || wait === maxWait) {
      invokeValue()
      return
    }

    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        invokeValue()
      }
    }, wait)

    // Handle maxWait
    if (maxWait !== undefined && maxWait > 0) {
      const timeSinceLastInvoke = now - lastInvokeTime.current
      if (timeSinceLastInvoke < maxWait) {
        maxTimeoutRef.current = setTimeout(invokeValue, maxWait - timeSinceLastInvoke)
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current)
      }
    }
  }, [value, delay, leading, trailing, maxWait])

  return debouncedValue
}

/**
 * Hook for debouncing callbacks
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback
  }, [callback, ...deps])

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  ) as T

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * Hook for debouncing API calls with loading state
 */
export function useDebouncedApiCall<T, P extends any[]>(
  apiCall: (...args: P) => Promise<T>,
  delay: number = 300
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)
  
  const abortControllerRef = useRef<AbortController>()
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedCall = useCallback(
    async (...args: P) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setError(null)
      
      timeoutRef.current = setTimeout(async () => {
        setIsLoading(true)
        
        try {
          abortControllerRef.current = new AbortController()
          const result = await apiCall(...args)
          setData(result)
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            setError(err)
          }
        } finally {
          setIsLoading(false)
        }
      }, delay)
    },
    [apiCall, delay]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsLoading(false)
  }, [])

  return {
    call: debouncedCall,
    cancel,
    isLoading,
    error,
    data
  }
}