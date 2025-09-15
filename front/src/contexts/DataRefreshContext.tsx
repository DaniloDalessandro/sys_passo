"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

type RefreshFunction = () => void | Promise<void>

interface DataRefreshContextType {
  // Register refresh functions for different entity types
  registerRefresh: (entityType: string, refreshFn: RefreshFunction) => void
  // Trigger refresh for a specific entity type
  triggerRefresh: (entityType: string) => void
  // Clear refresh function when component unmounts
  unregisterRefresh: (entityType: string) => void
}

const DataRefreshContext = createContext<DataRefreshContextType | undefined>(undefined)

interface DataRefreshProviderProps {
  children: ReactNode
}

export function DataRefreshProvider({ children }: DataRefreshProviderProps) {
  const [refreshFunctions, setRefreshFunctions] = useState<Record<string, RefreshFunction>>({})

  const registerRefresh = React.useCallback((entityType: string, refreshFn: RefreshFunction) => {
    console.log(`🔄 Registering refresh function for: ${entityType}`)
    setRefreshFunctions(prev => ({
      ...prev,
      [entityType]: refreshFn
    }))
  }, [])

  const triggerRefresh = React.useCallback((entityType: string) => {
    setRefreshFunctions(prev => {
      const refreshFn = prev[entityType]
      if (refreshFn) {
        console.log(`🔄 Triggering refresh for: ${entityType}`)
        refreshFn()
      } else {
        console.log(`⚠️ No refresh function registered for: ${entityType}`)
      }
      return prev
    })
  }, [])

  const unregisterRefresh = React.useCallback((entityType: string) => {
    console.log(`🗑️ Unregistering refresh function for: ${entityType}`)
    setRefreshFunctions(prev => {
      const { [entityType]: _, ...rest } = prev
      return rest
    })
  }, [])

  const contextValue = React.useMemo(() => ({
    registerRefresh,
    triggerRefresh,
    unregisterRefresh
  }), [registerRefresh, triggerRefresh, unregisterRefresh])

  return (
    <DataRefreshContext.Provider value={contextValue}>
      {children}
    </DataRefreshContext.Provider>
  )
}

export function useDataRefresh() {
  const context = useContext(DataRefreshContext)
  if (context === undefined) {
    throw new Error('useDataRefresh must be used within a DataRefreshProvider')
  }
  return context
}

// Custom hook for pages to easily register their refresh function
export function useRegisterRefresh(entityType: string, refreshFn: RefreshFunction) {
  const { registerRefresh, unregisterRefresh } = useDataRefresh()
  
  React.useEffect(() => {
    registerRefresh(entityType, refreshFn)
    
    return () => {
      unregisterRefresh(entityType)
    }
  }, [entityType, registerRefresh, unregisterRefresh])
}