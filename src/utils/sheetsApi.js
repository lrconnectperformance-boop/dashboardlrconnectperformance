// ─── FETCH CSV ────────────────────────────────────────────────────────────
export async function fetchSheetCSV(spreadsheetId, sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

// ─── CSV LINE PARSER ─────────────────────────────────────────────────────
function parseCSVLine(line) {
  const result = []
  let cur = ''
  let inQ = false
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ }
    else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = '' }
    else { cur += ch }
  }
  result.push(cur.trim())
  return result
}

function parseLines(csv) {
  return csv.split('\n').map(parseCSVLine)
}

// ─── VALUE CLEANER ────────────────────────────────────────────────────────
function toNum(raw) {
  if (!raw || raw === '' || raw === '#DIV/0!' || raw === 'N/A') return null
  const s = raw.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.').replace('%', '').trim()
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

// ─── PARSE PRINCIPAL (SUMMARY) ────────────────────────────────────────────
// Reads Facebook + Google MTD totals from the "Principal" tab.
// Format: col0=label group, col1=metric, col2=projetado, col3=realizado, col4=%
export function parseMainSummary(csv) {
  const lines = parseLines(csv)
  const result = { facebook: {}, google: {} }
  let section = null

  for (const cols of lines) {
    if (!cols || cols.every(c => !c)) continue
    const c0 = cols[0] || ''

    // Detect section
    if (c0.toLowerCase().includes('facebook')) { section = 'facebook'; continue }
    if (c0.toLowerCase().includes('google ads')) { section = 'google'; continue }
    // Stop at Métricas de Venda section — we don't need sales data
    if (c0.toLowerCase().includes('venda') || c0.toLowerCase().includes('canal')) break
    // Planilhas sem divisão por plataforma usam "Total" — mapeia para facebook
    if (c0.toLowerCase() === 'total' && !section) { section = 'facebook' }

    if (!section) continue

    const metric = (cols[1] || '').toLowerCase()
      .normalize('NFD').replace(/\p{M}/gu, '')
      .replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')

    if (!metric || metric === 'total') continue

    result[section][metric] = {
      projetado: toNum(cols[2]),
      realizado: toNum(cols[3]),
      pct: toNum((cols[4] || '').replace('%', '')),
    }
  }

  return result
}

// ─── DETECT COLUMN MAP FROM HEADER ROW ───────────────────────────────────
function detectColMap(headerRow) {
  const map = { investimento:-1, impressoes:-1, cpc:-1, cliques:-1, ctr:-1, leads:-1, mensagemWpp:-1, cpa:-1 }
  const norm = c => (c||'').toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/\s+/g,'')
  headerRow.forEach((cell, i) => {
    const c = norm(cell)
    // PT-BR
    if      (c.includes('investimento'))                                     map.investimento = i
    else if (c.includes('impressao') || c.includes('impressoes'))            map.impressoes   = i
    else if (c === 'cpc')                                                    map.cpc          = i
    else if (c === 'cliques' || c === 'clicks')                              map.cliques      = i
    else if (c === 'ctr')                                                    map.ctr          = i
    else if (c.includes('lead') && !c.includes('total'))                     map.leads        = i
    else if (c.includes('mensagem') || c.includes('wpp'))                    map.mensagemWpp  = i
    else if (c.includes('cpa'))                                              map.cpa          = i
    // EN (Facebook Ads Manager raw export)
    else if (c.includes('amountspent') || c.includes('spent'))               map.investimento = i
    else if (c.includes('impression'))                                        map.impressoes   = i
    else if (c.includes('linkclick') || c === 'clicks')                      map.cliques      = i
    else if (c.includes('messaging') || c.includes('conversation'))          map.mensagemWpp  = i
    else if (c.includes('costperresult') || c.includes('costperlead'))       map.cpa          = i
    else if (c.includes('costperclick'))                                      map.cpc          = i
  })
  // Lead sem label: coluna em branco entre mensagemWpp e cpa
  if (map.leads === -1 && map.mensagemWpp !== -1 && map.cpa !== -1) {
    for (let i = map.mensagemWpp + 1; i < map.cpa; i++) {
      if (!headerRow[i] || !norm(headerRow[i])) { map.leads = i; break }
    }
  }
  // Sem coluna leads nem coluna em branco: WhatsApp é a conversão (ex: Faruk, Aphyra)
  if (map.leads === -1 && map.mensagemWpp !== -1) {
    map.leads = map.mensagemWpp
  }
  return map
}

// ─── PARSE DAILY DATA (PRINCIPAL MTD TAB) ────────────────────────────────
export function parseDailyData(csv) {
  const lines = parseLines(csv)
  const rows = []
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Detect column positions from header row (PT-BR "investimento" OR EN "amount spent" / "day")
  let colMap = null
  for (const cols of lines) {
    const hasHeader = cols.some(c => {
      const lc = (c||'').toLowerCase()
      return lc.includes('investimento') || lc.includes('amount') || lc.includes('spent') || lc.includes('impression')
    })
    if (hasHeader) {
      colMap = detectColMap(cols)
      break
    }
  }

  for (const cols of lines) {
    if (!cols || cols.length < 4) continue
    const isoDate = normalizeDate(cols[0])
    if (!isoDate) continue
    if (!isoDate.startsWith(currentMonth)) continue

    let investimento, impressoes, cpc, cliques, ctr, leads, wpp, cpa

    if (colMap && colMap.investimento !== -1) {
      investimento = toNum(cols[colMap.investimento])
      impressoes   = toNum(cols[colMap.impressoes])
      cpc          = toNum(cols[colMap.cpc])
      cliques      = toNum(cols[colMap.cliques])
      ctr          = toNum(cols[colMap.ctr])
      leads        = toNum(cols[colMap.leads])
      wpp          = toNum(cols[colMap.mensagemWpp])
      cpa          = toNum(cols[colMap.cpa])
    } else {
      let offset = 3
      while (offset < cols.length && toNum(cols[offset]) === null && offset < 6) offset++
      investimento = toNum(cols[offset])
      impressoes   = toNum(cols[offset + 1])
      cpc          = toNum(cols[offset + 2])
      cliques      = toNum(cols[offset + 3])
      ctr          = toNum(cols[offset + 4])
      leads        = toNum(cols[offset + 5])
      wpp          = toNum(cols[offset + 6])
      cpa          = toNum(cols[offset + 7])
    }

    if (!investimento) continue

    const inv  = investimento || 0
    const cliq = cliques      || 0
    const impr = impressoes   || 0
    const lds  = leads        || 0

    // Compute derived metrics when column is absent in sheet (e.g. raw FB export)
    const cpcFinal = (cpc && cpc > 0) ? cpc : (cliq > 0 ? inv / cliq  : 0)
    const ctrFinal = (ctr && ctr > 0) ? ctr : (impr > 0 ? (cliq / impr) * 100 : 0)
    const cpaFinal = (cpa && cpa > 0) ? cpa : (lds  > 0 ? inv  / lds  : 0)

    rows.push({
      date:        isoDate,
      investimento: inv,
      impressoes:   impr,
      cpc:          cpcFinal,
      cliques:      cliq,
      ctr:          ctrFinal,
      leads:        lds,
      mensagemWpp:  wpp || 0,
      cpa:          cpaFinal,
    })
  }

  return rows.sort((a, b) => a.date.localeCompare(b.date))
}

// ─── DATE NORMALIZER ─────────────────────────────────────────────────────
// Normalizes any common date format to YYYY-MM-DD. Returns null if not a date.
function normalizeDate(raw) {
  if (!raw) return null
  // Already ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  // Short ISO YY-MM-DD (e.g. 26-05-01 → 2026-05-01)
  const mShort = raw.match(/^(\d{2})-(\d{2})-(\d{2})$/)
  if (mShort && parseInt(mShort[1]) >= 20) {
    return `20${mShort[1]}-${mShort[2]}-${mShort[3]}`
  }
  // Brazilian DD/MM/YYYY or DD/MM/YY
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (m) {
    const d = m[1].padStart(2, '0')
    const mo = m[2].padStart(2, '0')
    const y = m[3].length === 2 ? `20${m[3]}` : m[3]
    return `${y}-${mo}-${d}`
  }
  return null
}

// ─── PARSE GOOGLE ADS DAILY (MTD - Google Ads TAB) ───────────────────────
// Uses smart header detection (detectColMap) so it works regardless of column order.
// Handles both ISO (YYYY-MM-DD) and Brazilian (DD/MM/YYYY) date formats.
// Falls back to legacy positional mapping if no header row is found.
export function parseGoogleDailyData(csv) {
  const lines = parseLines(csv)
  const rows = []
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Detect column positions from header row
  let colMap = null
  for (const cols of lines) {
    if (cols.some(c => (c || '').toLowerCase().includes('investimento'))) {
      colMap = detectColMap(cols)
      break
    }
  }

  for (const cols of lines) {
    if (!cols || cols.length < 4) continue

    // Try col 0 then col 1 for date — some sheets have an index column first
    let isoDate = normalizeDate(cols[0])
    let dataOffset = 0
    if (!isoDate) {
      isoDate = normalizeDate(cols[1])
      dataOffset = 1
    }
    if (!isoDate) continue
    if (!isoDate.startsWith(currentMonth)) continue

    // Shift colMap indices when there's a leading non-date column
    const get = (idx) => idx === -1 ? null : toNum(cols[idx + dataOffset])

    let investimento, cpc, cliques, impressoes, ctr, leads, cpa

    if (colMap && colMap.investimento !== -1) {
      investimento = get(colMap.investimento)
      cpc          = get(colMap.cpc)
      cliques      = get(colMap.cliques)
      impressoes   = get(colMap.impressoes)
      ctr          = get(colMap.ctr)
      leads        = get(colMap.leads)
      cpa          = get(colMap.cpa)
    } else {
      // Legacy positional fallback (col4=invest when dataOffset=0)
      const base = 4 - dataOffset
      investimento = toNum(cols[base])
      cpc          = toNum(cols[base + 1])
      cliques      = toNum(cols[base + 2])
      impressoes   = toNum(cols[base + 3])
      ctr          = toNum(cols[base + 4])
      leads        = toNum(cols[base + 5])
      cpa          = toNum(cols[base + 6])
    }

    if (!investimento) continue

    rows.push({
      date:         isoDate,
      investimento: investimento || 0,
      cpc:          cpc          || 0,
      cliques:      cliques      || 0,
      impressoes:   impressoes   || 0,
      ctr:          ctr          || 0,
      leads:        leads        || 0,
      mensagemWpp:  0,
      cpa:          cpa          || 0,
    })
  }

  return rows.sort((a, b) => a.date.localeCompare(b.date))
}

// ─── NORMALIZE SUMMARY TO DASHBOARD FORMAT ───────────────────────────────
export function normalizeSummary(parsed) {
  const fb = parsed.facebook || {}
  const gg = parsed.google   || {}

  const get = (obj, key) => ({
    real:    obj[key]?.realizado  ?? 0,
    goal:    obj[key]?.projetado  ?? 0,
    pct:     obj[key]?.pct        ?? null,
  })

  const fbInvest = get(fb, 'investimento')
  const ggInvest = get(gg, 'investimento')
  const fbLeads  = get(fb, 'leads')
  const ggLeads  = get(gg, 'leads')

  const totalInvest = fbInvest.real + ggInvest.real
  const totalLeadsR = fbLeads.real + ggLeads.real
  const totalLeadsG = fbLeads.goal + ggLeads.goal

  return {
    // ── Totals ──
    investimento:  { real: totalInvest,  goal: fbInvest.goal + ggInvest.goal },
    leadsTotal:    { real: totalLeadsR,  goal: totalLeadsG },
    cpa:           { real: totalLeadsR > 0 ? totalInvest / totalLeadsR : 0,
                     goal: totalLeadsG > 0 ? (fbInvest.goal + ggInvest.goal) / totalLeadsG : 0 },

    // ── Facebook ──
    fb: {
      investimento: fbInvest,
      leads:        fbLeads,
      cpa:          get(fb, 'cpa'),
      cpc:          get(fb, 'cpc'),
      ctr:          get(fb, 'ctr'),
    },

    // ── Google ──
    gg: {
      investimento: ggInvest,
      leads:        ggLeads,
      cpa:          get(gg, 'cpa'),
      cpc:          get(gg, 'cpc'),
      ctr:          get(gg, 'ctr'),
    },
  }
}
