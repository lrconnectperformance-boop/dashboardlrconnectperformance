export const clients = [
  {
    id: 7,
    name: 'Pet Paz',
    avatar: 'PP',
    color: '#F59E0B',
    sector: 'Funerária Pet',
    canal: 'Facebook + Google',
    sheetsId:             '1_TWzOzhqjMzZT0jwOW8n7htBDDjbxKq_4-8Wf2O2K0w',
    sheetsTab:            'Principal',
    sheetsTabDaily:       'Principal MTD',
    sheetsTabDailyGoogle: 'MTD - Google Ads',
    sheetsUrl:            'https://docs.google.com/spreadsheets/d/1_TWzOzhqjMzZT0jwOW8n7htBDDjbxKq_4-8Wf2O2K0w/edit',
    isLive: true,
    createdAt: '2026-05-01',
    goals: {
      investimento: 2000,
      leads:        60,
      cpa:          25,
    },
  },
  {
    id: 6,
    name: 'D&D Fitness',
    avatar: 'DD',
    color: '#10B981',
    sector: 'Fitness & Saúde',
    canal: 'Facebook + Google',
    sheetsId:       '1Zej1y8eyhlDDa--MQ-a6JNpgSgZpXegYvAlYbFqupkc',
    sheetsTab:      'Principal',
    sheetsTabDaily:       'Principal MTD',
    sheetsTabDailyGoogle: 'MTD - Google Ads',
    sheetsUrl:      'https://docs.google.com/spreadsheets/d/1Zej1y8eyhlDDa--MQ-a6JNpgSgZpXegYvAlYbFqupkc/edit',
    isLive: true,
    createdAt: '2026-01-01',
    goals: {
      investimento: 3000,
      leads:        220,
      cpa:          13.64,
    },
  },
]

// Stubs — não usados com clientes live
export const allDailyData = []
export function getClientData()          { return [] }
export function aggregateClient()        { return null }
export function getAllClientsAggregated() { return clients.map(c => ({ client: c, metrics: null })) }

export const syncLogs = [
  { id: 1, clientId: 6, clientName: 'Jardim da Paz', timestamp: '2026-05-08 09:14:22', status: 'success', rows: 5 },
  { id: 2, clientId: 6, clientName: 'Jardim da Paz', timestamp: '2026-05-07 18:10:45', status: 'success', rows: 4 },
  { id: 3, clientId: 6, clientName: 'Jardim da Paz', timestamp: '2026-05-07 09:00:00', status: 'success', rows: 4 },
  { id: 4, clientId: 6, clientName: 'Jardim da Paz', timestamp: '2026-05-06 18:30:22', status: 'success', rows: 3 },
  { id: 5, clientId: 6, clientName: 'Jardim da Paz', timestamp: '2026-05-06 09:00:00', status: 'warning', rows: 1 },
]
