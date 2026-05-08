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

// ─── PARSE DAILY DATA (PRINCIPAL MTD TAB) ────────────────────────────────
// Columns (0-indexed):
//   0: date (YYYY-MM-DD)  1: dia semana  2: Dia Semana
//   3: blank OR investimento (varies — we detect)
//   then: Investimento | Impressões | CPC | Cliques | CTR | Leads | MensagemWpp | CPA
export function parseDailyData(csv) {
  const lines = parseLines(csv)
  const rows = []
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  for (const cols of lines) {
    if (!cols || cols.length < 4) continue

    // Must start with a valid date in the current month
    const dateMatch = (cols[0] || '').match(/^\d{4}-\d{2}-\d{2}$/)
    if (!dateMatch) continue
    if (!cols[0].startsWith(currentMonth)) continue

    // Find the investimento column: first col >= 3 that contains a currency-like number
    let offset = 3
    while (offset < cols.length && toNum(cols[offset]) === null && offset < 6) offset++

    const investimento = toNum(cols[offset])
    if (!investimento) continue // skip empty/future rows

    const impressoes = toNum(cols[offset + 1])
    const cpc        = toNum(cols[offset + 2])
    const cliques    = toNum(cols[offset + 3])
    const ctr        = toNum(cols[offset + 4])
    const leads      = toNum(cols[offset + 5])
    const wpp        = toNum(cols[offset + 6])
    const cpa        = toNum(cols[offset + 7])

    rows.push({
      date: cols[0],
      investimento: investimento || 0,
      impressoes:   impressoes   || 0,
      cpc:          cpc          || 0,
      cliques:      cliques      || 0,
      ctr:          ctr          || 0,
      leads:        leads        || 0,
      mensagemWpp:  wpp          || 0,
      cpa:          cpa          || 0,
    })
  }

  return rows.sort((a, b) => a.date.localeCompare(b.date))
}

// ─── PARSE GOOGLE ADS DAILY (MTD - Google Ads TAB) ───────────────────────
// Columns: 0=date, 1=dia, 2=Dia, 3=blank, 4=Investimento, 5=CPC,
//          6=Cliques, 7=Impressão, 8=CTR, 9=Leads, 10=CPA Geral
export function parseGoogleDailyData(csv) {
  const lines = parseLines(csv)
  const rows = []
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  for (const cols of lines) {
    if (!cols || cols.length < 5) continue
    if (!(cols[0] || '').match(/^\d{4}-\d{2}-\d{2}$/)) continue
    if (!cols[0].startsWith(currentMonth)) continue

    const investimento = toNum(cols[4])
    if (!investimento) continue

    rows.push({
      date:         cols[0],
      investimento: investimento        || 0,
      cpc:          toNum(cols[5])      || 0,
      cliques:      toNum(cols[6])      || 0,
      impressoes:   toNum(cols[7])      || 0,
      ctr:          toNum(cols[8])      || 0,
      leads:        toNum(cols[9])      || 0,
      mensagemWpp:  0,
      cpa:          toNum(cols[10])     || 0,
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
