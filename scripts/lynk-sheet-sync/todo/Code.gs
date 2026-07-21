/**
 * Lynk.id To-Do List sales sheet -> Supabase auto-grant.
 *
 * This script is bound to the Google Sheet Lynk.id writes ONLY
 * To-Do List sales into. Financial Tracker has its own separate sheet
 * and its own copy of this script (see ../financial/Code.gs) — each
 * sheet only ever contains rows for one product, so there's no need to
 * look up which tracker a row is for; TRACKER_ID below is fixed.
 *
 * Column names below are copied from the confirmed Financial Tracker
 * sheet layout (same Lynk.id export format is expected for every
 * product) — Lynk.id's own "Status" column (order status:
 * SUCCESS/PENDING/etc) and "Buyer Email" column. TODO(owner): once
 * this sheet exists, double check these headers match exactly.
 *
 * Setup (one-time, in your Google account — not deployable from this repo):
 *   1. Open the To-Do List sales sheet.
 *   2. Extensions -> Apps Script, paste this file in as Code.gs.
 *   3. Project Settings -> Script Properties, add:
 *        SUPABASE_URL          = your Supabase project URL
 *        SUPABASE_SERVICE_KEY  = the service-role key (from website/.env's SUPABASE_SERVICE_KEY)
 *   4. Triggers (clock icon, left sidebar) -> Add Trigger, twice, both
 *      pointing at the SAME function (processNewRows is idempotent —
 *      safe to run back-to-back or overlapping):
 *        a) event source: Time-driven, type: Minutes timer, every 5
 *           minutes — the reliable backstop. Sheets edit triggers
 *           aren't guaranteed to fire for rows Lynk.id inserts via its
 *           own integration rather than the Sheets UI, so this is what
 *           actually guarantees every sale gets processed eventually.
 *        b) event source: From spreadsheet, event type: On change —
 *           best-effort instant processing. When Lynk.id's write does
 *           happen to trigger it, access is granted right away instead
 *           of waiting for the next poll; when it doesn't fire, (a)
 *           still catches the row within 5 minutes.
 *
 * What it does, each run:
 *   - Reads every row in the sheet.
 *   - Skips rows already marked in PROCESSED_COLUMN_HEADER (our own
 *     tracking column, distinct from Lynk.id's "Status" column).
 *   - Skips (without marking — so it's rechecked next run) any row whose
 *     ORDER_STATUS_COLUMN_HEADER value isn't SUCCESS yet, so a payment
 *     that's still PENDING gets granted automatically once it clears.
 *   - For SUCCESS rows: calls Supabase's grant_tracker_access RPC
 *     (migration 010, supabase/migrations/010_lynk_sheet_grant.sql) with
 *     the buyer email and TRACKER_ID, and writes the result into
 *     PROCESSED_COLUMN_HEADER so the row is never reprocessed.
 */

const CONFIG = {
  TRACKER_ID: 'todo',
  EMAIL_COLUMN_HEADER: 'Buyer Email',
  // Lynk.id's own order-status column — only act on SUCCESS.
  ORDER_STATUS_COLUMN_HEADER: 'Status',
  ORDER_SUCCESS_VALUE: 'SUCCESS',
  // Script-managed column — created automatically if it doesn't exist.
  // Must stay different from Lynk.id's own "Status" column above.
  PROCESSED_COLUMN_HEADER: 'Novo Status',
}

function processNewRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const data = sheet.getDataRange().getValues()
  if (data.length < 2) return // header row only, nothing to process

  const headers = data[0]
  const emailCol = headers.indexOf(CONFIG.EMAIL_COLUMN_HEADER)
  const orderStatusCol = headers.indexOf(CONFIG.ORDER_STATUS_COLUMN_HEADER)
  let processedCol = headers.indexOf(CONFIG.PROCESSED_COLUMN_HEADER)

  if (emailCol === -1 || orderStatusCol === -1) {
    throw new Error(
      `Column not found — check CONFIG.EMAIL_COLUMN_HEADER/ORDER_STATUS_COLUMN_HEADER against the sheet's actual headers: ${headers.join(', ')}`
    )
  }
  if (processedCol === -1) {
    processedCol = headers.length
    sheet.getRange(1, processedCol + 1).setValue(CONFIG.PROCESSED_COLUMN_HEADER)
  }

  for (let row = 1; row < data.length; row++) {
    const alreadyProcessed = data[row][processedCol]
    if (alreadyProcessed) continue // we've already handled this row

    const orderStatus = String(data[row][orderStatusCol] || '').trim().toUpperCase()
    if (orderStatus !== CONFIG.ORDER_SUCCESS_VALUE) continue // not paid yet — recheck next run, don't mark

    const email = String(data[row][emailCol] || '').trim()
    const sheetRow = row + 1 // 1-indexed, +1 for header

    if (!email) {
      sheet.getRange(sheetRow, processedCol + 1).setValue('FAILED: missing email')
      continue
    }

    try {
      const result = grantTrackerAccess(email, CONFIG.TRACKER_ID)
      sheet.getRange(sheetRow, processedCol + 1).setValue(result.status + (result.reason ? `: ${result.reason}` : ''))
    } catch (err) {
      sheet.getRange(sheetRow, processedCol + 1).setValue('FAILED: ' + err.message)
    }
  }
}

function grantTrackerAccess(email, trackerId) {
  const props = PropertiesService.getScriptProperties()
  const supabaseUrl = props.getProperty('SUPABASE_URL')
  const serviceKey = props.getProperty('SUPABASE_SERVICE_KEY')
  if (!supabaseUrl || !serviceKey) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_KEY not set in Script Properties')
  }

  const response = UrlFetchApp.fetch(`${supabaseUrl}/rest/v1/rpc/grant_tracker_access`, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    payload: JSON.stringify({ p_email: email, p_tracker_id: trackerId }),
    muteHttpExceptions: true,
  })

  const code = response.getResponseCode()
  if (code < 200 || code >= 300) {
    throw new Error(`Supabase returned ${code}: ${response.getContentText()}`)
  }
  return JSON.parse(response.getContentText())
}
