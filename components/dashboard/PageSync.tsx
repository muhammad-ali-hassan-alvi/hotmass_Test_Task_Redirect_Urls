"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

interface PageSyncProps {
  userId: string
  sheetId: string
  hubspotToken: string
  onSyncComplete: () => void
}

interface HubSpotPage {
  id: string
  name: string
  slug: string
  url: string
  language: string
  domain: string
  updatedAt: string
}

export default function PageSync({ userId, sheetId, hubspotToken, onSyncComplete }: PageSyncProps) {
  const [pages, setPages] = useState<HubSpotPage[]>([])
  const [filteredPages, setFilteredPages] = useState<HubSpotPage[]>([])
  const [languageFilter, setLanguageFilter] = useState("all")
  const [domainFilter, setDomainFilter] = useState("all")
  const [tabName, setTabName] = useState("HubSpot Pages")
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const { toast } = useToast()

  const fetchPages = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/hubspot/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: hubspotToken }),
      })

      const data = await response.json()

      if (data.success) {
        setPages(data.pages)
        setFilteredPages(data.pages)
        toast({
          title: "Success",
          description: `Fetched ${data.pages.length} pages from HubSpot`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch pages",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pages from HubSpot",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = pages

    if (languageFilter !== "all") {
      filtered = filtered.filter((page) => page.language === languageFilter)
    }

    if (domainFilter !== "all") {
      filtered = filtered.filter((page) => page.domain.includes(domainFilter))
    }

    setFilteredPages(filtered)
  }

  const syncToSheet = async () => {
    if (filteredPages.length === 0) {
      toast({
        title: "Error",
        description: "No pages to sync",
        variant: "destructive",
      })
      return
    }

    setSyncing(true)
    try {
      const response = await fetch("/api/google/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sheetId,
          tabName,
          pages: filteredPages,
          userId,
          filters: {
            language: languageFilter,
            domain: domainFilter,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Synced ${data.rowsWritten} pages to Google Sheets`,
        })
        onSyncComplete()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to sync to Google Sheets",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync to Google Sheets",
        variant: "destructive",
      })
    }
    setSyncing(false)
  }

  const getUniqueLanguages = () => {
    return [...new Set(pages.map((page) => page.language))].filter(Boolean)
  }

  const getUniqueDomains = () => {
    return [...new Set(pages.map((page) => page.domain))].filter(Boolean)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Page Sync</CardTitle>
        <CardDescription>Fetch and sync HubSpot pages to Google Sheets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fetch Pages */}
        <div>
          <Button onClick={fetchPages} disabled={loading} className="w-full">
            {loading ? "Fetching..." : "Fetch Pages from HubSpot"}
          </Button>
        </div>

        {pages.length > 0 && (
          <>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Language Filter</Label>
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All languages</SelectItem>
                    {getUniqueLanguages().map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Domain Filter</Label>
                <Select value={domainFilter} onValueChange={setDomainFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All domains" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All domains</SelectItem>
                    {getUniqueDomains().map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tab Name</Label>
                <Input value={tabName} onChange={(e) => setTabName(e.target.value)} placeholder="Sheet tab name" />
              </div>
            </div>

            <Button onClick={applyFilters} variant="outline">
              Apply Filters
            </Button>


            <div>
              <h3 className="text-lg font-semibold mb-2">Preview ({filteredPages.length} pages)</h3>
              <div className="border rounded-lg max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPages.slice(0, 10).map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.name}</TableCell>
                        <TableCell>{page.language}</TableCell>
                        <TableCell>{page.slug}</TableCell>
                        <TableCell>{page.domain}</TableCell>
                        <TableCell>{new Date(page.updatedAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredPages.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">Showing first 10 of {filteredPages.length} pages</p>
              )}
            </div>


            <Button onClick={syncToSheet} disabled={syncing || filteredPages.length === 0} className="w-full">
              {syncing ? "Syncing..." : `Sync ${filteredPages.length} Pages to Google Sheets`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
