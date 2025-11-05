"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TreeView } from "@/components/tree-view";
import {
  Search,
  ArrowUpDown,
  Users,
  ChevronsDownUp,
  ChevronsUpDown,
  Star,
} from "lucide-react";
import type { OrgNode, SelectionMode } from "@/types/org-chart";
import { sampleOrgData } from "@/lib/sample-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface OrgChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrgChartModal({ open, onOpenChange }: OrgChartModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"label" | "favorites">("label");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("single");
  const [expandAll, setExpandAll] = useState<boolean | null>(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const countNodes = (
      node: OrgNode,
      level = 0
    ): { total: number; byLevel: Record<number, number> } => {
      const result = {
        total: 1,
        byLevel: { [level]: 1 } as Record<number, number>,
      };

      if (node.children) {
        node.children.forEach((child) => {
          const childStats = countNodes(child, level + 1);
          result.total += childStats.total;
          Object.entries(childStats.byLevel).forEach(([lvl, count]) => {
            result.byLevel[Number(lvl)] =
              (result.byLevel[Number(lvl)] || 0) + count;
          });
        });
      }

      return result;
    };

    const allStats = countNodes(sampleOrgData);
    return allStats;
  }, []);

  // Filter and search nodes
  const filteredStats = useMemo(() => {
    if (!searchQuery) return stats;

    const matchesSearch = (node: OrgNode): boolean => {
      if (node.label.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      return node.children?.some(matchesSearch) || false;
    };

    const countMatchingNodes = (
      node: OrgNode,
      level = 0
    ): { total: number; byLevel: Record<number, number> } => {
      const nodeMatches = node.label
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const childrenMatch = node.children?.some(matchesSearch) || false;

      if (!nodeMatches && !childrenMatch) {
        return { total: 0, byLevel: {} };
      }

      const result = {
        total: nodeMatches ? 1 : 0,
        byLevel: nodeMatches ? ({ [level]: 1 } as Record<number, number>) : {},
      };

      if (node.children) {
        node.children.forEach((child) => {
          const childStats = countMatchingNodes(child, level + 1);
          result.total += childStats.total;
          Object.entries(childStats.byLevel).forEach(([lvl, count]) => {
            result.byLevel[Number(lvl)] =
              (result.byLevel[Number(lvl)] || 0) + count;
          });
        });
      }

      return result;
    };

    return countMatchingNodes(sampleOrgData);
  }, [searchQuery, stats]);

  const displayStats = searchQuery ? filteredStats : stats;

  const handleSortChange = (
    newSortBy: "label" | "favorites",
    newDirection: "asc" | "desc"
  ) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  const toggleFavorite = (nodeId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(nodeId)) {
        newFavorites.delete(nodeId);
      } else {
        newFavorites.add(nodeId);
      }
      return newFavorites;
    });
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodes((prev) => {
      const newSelected = new Set(prev);
      if (selectionMode === "single") {
        newSelected.clear();
        newSelected.add(nodeId);
      } else {
        if (newSelected.has(nodeId)) {
          newSelected.delete(nodeId);
        } else {
          newSelected.add(nodeId);
        }
      }
      return newSelected;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Organization Chart
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-3 border-b flex-shrink-0 bg-muted/30">
          {/* Search Bar */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="gap-1.5">
                <span className="font-semibold">{displayStats.total}</span>
                <span className="text-muted-foreground">total</span>
              </Badge>
              {Object.entries(displayStats.byLevel).map(([level, count]) => (
                <Badge key={level} variant="outline" className="gap-1.5">
                  <span className="font-semibold">L{level}:</span>
                  <span>{count}</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Toolbar with grouped actions */}
          <div className="flex items-center gap-3">
            {/* Selection Mode Section */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Mode
              </span>
              <Tabs
                value={selectionMode}
                onValueChange={(v) => setSelectionMode(v as SelectionMode)}
              >
                <TabsList className="h-8">
                  <TabsTrigger value="single" className="text-xs">
                    Single
                  </TabsTrigger>
                  <TabsTrigger value="multiple" className="text-xs">
                    Multiple
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* View Controls Section */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                View
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 bg-background"
                onClick={() => setExpandAll(true)}
              >
                <ChevronsDownUp className="w-3.5 h-3.5" />
                <span className="text-xs">Expand</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 bg-background"
                onClick={() => setExpandAll(false)}
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
                <span className="text-xs">Collapse</span>
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Sort Section */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Sort
              </span>
              <div className="flex items-center gap-1 border rounded-lg p-1 bg-background">
                <Button
                  variant={sortBy === "label" ? "secondary" : "ghost"}
                  size="sm"
                  className={`gap-1.5 h-7 px-2.5 ${
                    sortBy === "label"
                      ? "bg-primary/10 text-primary shadow-sm"
                      : ""
                  }`}
                  onClick={() => handleSortChange("label", sortDirection)}
                >
                  <span className="text-xs font-medium">Name</span>
                </Button>
                <Button
                  variant={sortBy === "favorites" ? "secondary" : "ghost"}
                  size="sm"
                  className={`gap-1.5 h-7 px-2.5 ${
                    sortBy === "favorites"
                      ? "bg-primary/10 text-primary shadow-sm"
                      : ""
                  }`}
                  onClick={() => handleSortChange("favorites", sortDirection)}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Fav</span>
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bg-background"
                onClick={() =>
                  handleSortChange(
                    sortBy,
                    sortDirection === "asc" ? "desc" : "asc"
                  )
                }
                title={
                  sortDirection === "asc" ? "Sort Descending" : "Sort Ascending"
                }
              >
                <ArrowUpDown
                  className={`w-4 h-4 transition-transform ${
                    sortDirection === "desc" ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-6 py-4">
              {/* TreeView component with expandAll prop */}
              <TreeView
                data={sampleOrgData}
                searchQuery={searchQuery}
                selectedNodes={selectedNodes}
                favorites={favorites}
                sortBy={sortBy}
                sortDirection={sortDirection}
                selectionMode={selectionMode}
                expandAll={expandAll}
                onNodeSelect={handleNodeSelect}
                onToggleFavorite={toggleFavorite}
                onExpandAllComplete={() => setExpandAll(null)}
              />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
