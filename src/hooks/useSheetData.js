import { useState, useEffect, useCallback } from 'react'
import { fetchSheetCSV, parseMainSummary, parseDailyData, parseGoogleDailyData, normalizeSummary } from '../utils/sheetsApi'

export function useSheetSummary(spreadsheetId, summaryTab = 'Principal') {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    if (!spreadsheetId) return
    setLoading(true)
    setError(null)
    try {
      const csv = await fetchSheetCSV(spreadsheetId, summaryTab)
      setSummary(normalizeSummary(parseMainSummary(csv)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [spreadsheetId, summaryTab])

  useEffect(() => { load() }, [load])

  return { summary, loading, error }
}

export function useSheetData(
  spreadsheetId,
  summaryTab       = 'Principal',
  dailyTab         = 'Principal MTD',
  dailyGoogleTab   = null,
) {
  const [summary, setSummary]           = useState(null)
  const [daily, setDaily]               = useState([])
  const [dailyGoogle, setDailyGoogle]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [lastUpdated, setLastUpdated]   = useState(null)

  const load = useCallback(async () => {
    if (!spreadsheetId) return
    setLoading(true)
    setError(null)
    try {
      const fetches = [
        fetchSheetCSV(spreadsheetId, summaryTab),
        fetchSheetCSV(spreadsheetId, dailyTab),
      ]
      if (dailyGoogleTab) fetches.push(fetchSheetCSV(spreadsheetId, dailyGoogleTab))

      const [csvSummary, csvDaily, csvGoogle] = await Promise.all(fetches)
      setSummary(normalizeSummary(parseMainSummary(csvSummary)))
      setDaily(parseDailyData(csvDaily))
      if (dailyGoogleTab && csvGoogle) setDailyGoogle(parseGoogleDailyData(csvGoogle))
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [spreadsheetId, summaryTab, dailyTab, dailyGoogleTab])

  useEffect(() => { load() }, [load])

  return { summary, daily, dailyGoogle, loading, error, refetch: load, lastUpdated }
}
