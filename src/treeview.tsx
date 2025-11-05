"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { ChevronRight, Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { OrgNode, SelectionMode } from "@/types/org-chart"

interface TreeViewProps {
  data: OrgNode
  searchQuery: string
  selectedNodes: Set<string>
  favorites: Set<string>
  sortBy: "label" | "favorites"
  sortDirection: "asc" | "desc"
  selectionMode: SelectionMode
  expandAll: boolean | null
  onNodeSelect: (nodeId: string) => void
  onToggleFavorite: (nodeId: string) => void
  onExpandAllComplete: () => void
}

export function TreeView({
  data,
  searchQuery,
  selectedNodes,
  favorites,
  sortBy,
  sortDirection,
  selectionMode,
  expandAll,
  onNodeSelect,
  onToggleFavorite,
  onExpandAllComplete,
}: TreeViewProps) {
  return (
    <div className="space-y-1">
      <TreeNode
        node={data}
        level={0}
        searchQuery={searchQuery}
        selectedNodes={selectedNodes}
        favorites={favorites}
        sortBy={sortBy}
        sortDirection={sortDirection}
        selectionMode={selectionMode}
        expandAll={expandAll}
        onNodeSelect={onNodeSelect}
        onToggleFavorite={onToggleFavorite}
        onExpandAllComplete={onExpandAllComplete}
      />
    </div>
  )
}

interface TreeNodeProps {
  node: OrgNode
  level: number
  searchQuery: string
  selectedNodes: Set<string>
  favorites: Set<string>
  sortBy: "label" | "favorites"
  sortDirection: "asc" | "desc"
  selectionMode: SelectionMode
  expandAll: boolean | null
  onNodeSelect: (nodeId: string) => void
  onToggleFavorite: (nodeId: string) => void
  onExpandAllComplete: () => void
}

function TreeNode({
  node,
  level,
  searchQuery,
  selectedNodes,
  favorites,
  sortBy,
  sortDirection,
  selectionMode,
  expandAll,
  onNodeSelect,
  onToggleFavorite,
  onExpandAllComplete,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const childrenRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (expandAll !== null) {
      setIsExpanded(expandAll)
      if (level === 0) {
        onExpandAllComplete()
      }
    }
  }, [expandAll, level, onExpandAllComplete])

  useEffect(() => {
    if (childrenRef.current) {
      setHeight(isExpanded ? childrenRef.current.scrollHeight : 0)
    }
  }, [isExpanded, node.children])

  const matchesSearch = useMemo(() => {
    const checkMatch = (n: OrgNode): boolean => {
      if (n.label.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true
      }
      return n.children?.some(checkMatch) || false
    }
    return searchQuery === "" || checkMatch(node)
  }, [node, searchQuery])

  const nodeMatches = node.label.toLowerCase().includes(searchQuery.toLowerCase())

  const sortedChildren = useMemo(() => {
    if (!node.children) return []

    const children = [...node.children]
    const multiplier = sortDirection === "asc" ? 1 : -1

    if (sortBy === "favorites") {
      return children.sort((a, b) => {
        const aFav = favorites.has(a.id)
        const bFav = favorites.has(b.id)

        if (aFav && !bFav) return -1 * multiplier
        if (!aFav && bFav) return 1 * multiplier

        return a.label.localeCompare(b.label) * multiplier
      })
    }

    return children.sort((a, b) => a.label.localeCompare(b.label) * multiplier)
  }, [node.children, sortBy, sortDirection, favorites])

  if (!matchesSearch) return null

  const isSelected = selectedNodes.has(node.id)
  const isFavorite = favorites.has(node.id)
  const hasChildren = node.children && node.children.length > 0

  const highlightText = (text: string) => {
    if (!searchQuery || !nodeMatches) return text

    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"))
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={i} className="bg-accent/30 text-accent-foreground font-semibold rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    )
  }

  const levelColors = [
    "bg-primary/10 hover:bg-primary/20 border-primary/20",
    "bg-secondary/10 hover:bg-secondary/20 border-secondary/20",
    "bg-accent/10 hover:bg-accent/20 border-accent/20",
    "bg-chart-4/10 hover:bg-chart-4/20 border-chart-4/20",
  ]

  const colorClass = levelColors[level % levelColors.length]

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg border transition-all",
          colorClass,
          isSelected && "ring-2 ring-primary shadow-sm",
          "group",
        )}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 hover:bg-transparent"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronRight
              className={cn("h-4 w-4 transition-transform duration-200 ease-in-out", isExpanded && "rotate-90")}
            />
          </Button>
        ) : (
          <div className="w-5" />
        )}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0",
              level === 0 && "bg-primary text-primary-foreground",
              level === 1 && "bg-secondary text-secondary-foreground",
              level === 2 && "bg-accent text-accent-foreground",
              level >= 3 && "bg-muted text-muted-foreground",
            )}
          >
            <User className="w-4 h-4" />
          </div>

          <button
            onClick={() => onNodeSelect(node.id)}
            className="flex-1 text-left font-medium text-sm hover:underline min-w-0 truncate"
          >
            {highlightText(node.label)}
          </button>

          {node.role && <span className="text-xs text-muted-foreground hidden sm:inline">{node.role}</span>}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(node.id)
          }}
        >
          <Star className={cn("h-4 w-4", isFavorite && "fill-accent text-accent")} />
        </Button>
      </div>

      {hasChildren && (
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ height: isExpanded ? height : 0 }}
        >
          <div ref={childrenRef} className="mt-1 space-y-1">
            {sortedChildren.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                searchQuery={searchQuery}
                selectedNodes={selectedNodes}
                favorites={favorites}
                sortBy={sortBy}
                sortDirection={sortDirection}
                selectionMode={selectionMode}
                expandAll={expandAll}
                onNodeSelect={onNodeSelect}
                onToggleFavorite={onToggleFavorite}
                onExpandAllComplete={onExpandAllComplete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
