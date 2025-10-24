"use client"

import { useState, useEffect } from "react"
import { ComplaintDataTable } from "@/components/complaints/ComplaintDataTable"
import { useComplaints, Complaint } from "@/hooks/useComplaints"
import { toast } from "sonner"

export default function DenunciasPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [filters, setFilters] = useState<Record<string, any>>({})

  const {
    complaints,
    totalCount,
    isLoading,
    fetchComplaints,
  } = useComplaints()

  // Fetch data when pagination or filters change
  useEffect(() => {
    const fetchParams = {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      filters: filters,
    }
    fetchComplaints(fetchParams)
  }, [pagination, filters, fetchComplaints])

  const handleRefreshData = () => {
    const fetchParams = {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      filters: filters,
    }
    fetchComplaints(fetchParams)
  }

  const handleFilterChange = (columnId: string, value: any) => {
    setFilters(prev => ({ ...prev, [columnId]: value }))
  }

  const handleViewDetails = (complaint: Complaint) => {
    if (!complaint || !complaint.id) {
      toast.error('Erro: ID da denúncia não encontrado')
      return
    }
    const url = `/denuncias/${complaint.id}/details`
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col h-full p-4 pt-0 w-full overflow-hidden">
      <div className="flex flex-col gap-6 w-full overflow-hidden">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Denúncias</h1>
            <p className="text-gray-500 mt-1">Gerenciar denúncias de veículos</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 w-full overflow-hidden">
          <ComplaintDataTable
            complaints={complaints}
            totalCount={totalCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            filters={filters}
            onFilterChange={handleFilterChange}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
