/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog'
import type { FreeTokenSite, FreeTokenSitesDialogType } from './types'

type FreeTokenSitesContextType = {
  open: FreeTokenSitesDialogType | null
  setOpen: (value: FreeTokenSitesDialogType | null) => void
  currentRow: FreeTokenSite | null
  setCurrentRow: React.Dispatch<React.SetStateAction<FreeTokenSite | null>>
  refreshTrigger: number
  triggerRefresh: () => void
}

const FreeTokenSitesContext =
  React.createContext<FreeTokenSitesContextType | null>(null)

export function FreeTokenSitesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<FreeTokenSitesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<FreeTokenSite | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1)

  return (
    <FreeTokenSitesContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </FreeTokenSitesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFreeTokenSitesContext() {
  const context = React.useContext(FreeTokenSitesContext)
  if (!context) {
    throw new Error(
      'useFreeTokenSitesContext must be used within FreeTokenSitesProvider'
    )
  }
  return context
}
