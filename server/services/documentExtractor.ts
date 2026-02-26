/**
 * Document Extractor — Multimodal extraction from uploaded financial documents.
 *
 * PDFs: Uses Claude Sonnet with vision (PDF pages → images → extraction)
 * XLSX/XLS/CSV: Uses xlsx library for deterministic parsing
 *
 * Returns structured financial data for deal context and field extraction.
 */
import Anthropic from '@anthropic-ai/sdk';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const SONNET_MODEL = 'claude-sonnet-4-5-20250929';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface ExtractedFinancials {
  document_type?: string;     // 'tax_return', 'pnl', 'balance_sheet', 'unknown'
  tax_form_type?: string;     // 'Schedule C', '1120S', '1065', '1120', etc.
  tax_year?: number;
  revenue?: number;           // in cents
  cogs?: number;              // in cents
  gross_profit?: number;      // in cents
  operating_expenses?: number; // in cents
  net_income?: number;        // in cents
  owner_salary?: number;      // in cents
  depreciation?: number;      // in cents
  amortization?: number;      // in cents
  interest_expense?: number;  // in cents
  taxes?: number;             // in cents
  // Line items for add-back analysis
  auto_vehicle?: number;      // in cents
  travel?: number;            // in cents
  meals_entertainment?: number; // in cents
  insurance?: number;         // in cents
  rent?: number;              // in cents
  repairs_maintenance?: number; // in cents
  office_expenses?: number;   // in cents
  professional_fees?: number; // in cents
  other_deductions?: number;  // in cents
  // Balance sheet items (L3+)
  total_assets?: number;      // in cents
  total_liabilities?: number; // in cents
  total_equity?: number;      // in cents
  current_assets?: number;    // in cents
  current_liabilities?: number; // in cents
  cash?: number;              // in cents
  accounts_receivable?: number; // in cents
  inventory?: number;         // in cents
  accounts_payable?: number;  // in cents
  long_term_debt?: number;    // in cents
  // Metadata
  raw_text?: string;          // truncated raw text for context
  confidence: 'high' | 'medium' | 'low';
  notes?: string[];           // extraction notes / warnings
}

// ─── Main extraction router ────────────────────────────────

export async function extractFromDocument(
  filePath: string,
  originalName: string,
): Promise<ExtractedFinancials> {
  const ext = path.extname(originalName).toLowerCase();

  switch (ext) {
    case '.pdf':
      return extractFromPDF(filePath);
    case '.xlsx':
    case '.xls':
      return extractFromSpreadsheet(filePath);
    case '.csv':
      return extractFromCSV(filePath);
    default:
      return { confidence: 'low', notes: [`Unsupported file type: ${ext}`] };
  }
}

// ─── PDF extraction (Claude Sonnet with document support) ──

async function extractFromPDF(filePath: string): Promise<ExtractedFinancials> {
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString('base64');

  const response = await getClient().messages.create({
    model: SONNET_MODEL,
    max_tokens: 4096,
    temperature: 0,
    system: PDF_EXTRACTION_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64,
            },
          },
          {
            type: 'text',
            text: 'Extract all financial data from this document. Return ONLY valid JSON.',
          },
        ],
      },
    ],
  });

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as any).text)
    .join('');

  return parseExtractionResponse(text);
}

// ─── Spreadsheet extraction (xlsx library) ──────────────────

async function extractFromSpreadsheet(filePath: string): Promise<ExtractedFinancials> {
  const workbook = XLSX.readFile(filePath);
  const result: ExtractedFinancials = { confidence: 'medium', notes: [] };

  // Process each sheet
  const sheetData: Record<string, any[]> = {};
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    sheetData[sheetName] = jsonData;
  }

  // Try to identify the document type and extract financials
  const allText = JSON.stringify(sheetData).toLowerCase();

  if (allText.includes('profit') || allText.includes('income statement') || allText.includes('p&l')) {
    result.document_type = 'pnl';
    extractPnLFromSheets(sheetData, result);
  } else if (allText.includes('balance sheet') || allText.includes('assets')) {
    result.document_type = 'balance_sheet';
    extractBalanceSheetFromSheets(sheetData, result);
  } else {
    result.document_type = 'unknown';
    // Still try to extract any financial data
    extractGenericFinancials(sheetData, result);
  }

  // If we couldn't parse structured data, send to Claude for interpretation
  if (!result.revenue && !result.net_income) {
    const sheetText = formatSheetsAsText(sheetData);
    return extractWithClaude(sheetText, 'spreadsheet');
  }

  return result;
}

async function extractFromCSV(filePath: string): Promise<ExtractedFinancials> {
  const workbook = XLSX.readFile(filePath);
  const sheetData: Record<string, any[]> = {};
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    sheetData[sheetName] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  }

  const allText = JSON.stringify(sheetData).toLowerCase();
  const result: ExtractedFinancials = { confidence: 'medium', notes: [] };

  if (allText.includes('revenue') || allText.includes('income') || allText.includes('sales')) {
    extractGenericFinancials(sheetData, result);
  }

  if (!result.revenue && !result.net_income) {
    const sheetText = formatSheetsAsText(sheetData);
    return extractWithClaude(sheetText, 'CSV');
  }

  return result;
}

// ─── Spreadsheet data extraction helpers ────────────────────

function extractPnLFromSheets(sheets: Record<string, any[]>, result: ExtractedFinancials): void {
  for (const rows of Object.values(sheets)) {
    for (const row of rows) {
      if (!Array.isArray(row) || row.length < 2) continue;
      const label = String(row[0] || '').toLowerCase().trim();
      const value = findNumericValue(row);
      if (value === null) continue;

      const cents = Math.round(value * 100);

      if (label.includes('revenue') || label.includes('sales') || label.includes('gross receipts')) {
        result.revenue = cents;
      } else if (label.includes('cost of goods') || label.includes('cogs') || label.includes('cost of sales')) {
        result.cogs = cents;
      } else if (label.includes('gross profit')) {
        result.gross_profit = cents;
      } else if (label.includes('operating expense') || label.includes('total expense')) {
        result.operating_expenses = cents;
      } else if (label.match(/net (income|profit|earnings)/) || label === 'net income') {
        result.net_income = cents;
      } else if (label.includes('owner') && (label.includes('salary') || label.includes('comp'))) {
        result.owner_salary = cents;
      } else if (label.includes('officer') && label.includes('comp')) {
        result.owner_salary = cents;
      } else if (label.includes('depreciation')) {
        result.depreciation = cents;
      } else if (label.includes('amortization')) {
        result.amortization = cents;
      } else if (label.includes('interest expense') || label === 'interest') {
        result.interest_expense = cents;
      } else if (label.includes('auto') || label.includes('vehicle')) {
        result.auto_vehicle = cents;
      } else if (label.includes('travel')) {
        result.travel = cents;
      } else if (label.includes('meals') || label.includes('entertainment')) {
        result.meals_entertainment = cents;
      } else if (label.includes('insurance')) {
        result.insurance = cents;
      } else if (label.includes('rent') || label.includes('lease')) {
        result.rent = cents;
      } else if (label.includes('repair') || label.includes('maintenance')) {
        result.repairs_maintenance = cents;
      } else if (label.includes('professional') || label.includes('legal') || label.includes('accounting')) {
        result.professional_fees = cents;
      } else if (label.includes('tax') && !label.includes('income tax')) {
        result.taxes = cents;
      }
    }
  }
}

function extractBalanceSheetFromSheets(sheets: Record<string, any[]>, result: ExtractedFinancials): void {
  for (const rows of Object.values(sheets)) {
    for (const row of rows) {
      if (!Array.isArray(row) || row.length < 2) continue;
      const label = String(row[0] || '').toLowerCase().trim();
      const value = findNumericValue(row);
      if (value === null) continue;

      const cents = Math.round(value * 100);

      if (label.includes('total assets')) result.total_assets = cents;
      else if (label.includes('total liabilities')) result.total_liabilities = cents;
      else if (label.includes('total equity') || label.includes("owner's equity")) result.total_equity = cents;
      else if (label.includes('current assets')) result.current_assets = cents;
      else if (label.includes('current liabilities')) result.current_liabilities = cents;
      else if (label.match(/^cash/) || label === 'cash and equivalents') result.cash = cents;
      else if (label.includes('accounts receivable') || label === 'a/r') result.accounts_receivable = cents;
      else if (label.includes('inventory')) result.inventory = cents;
      else if (label.includes('accounts payable') || label === 'a/p') result.accounts_payable = cents;
      else if (label.includes('long-term debt') || label.includes('long term debt')) result.long_term_debt = cents;
    }
  }
}

function extractGenericFinancials(sheets: Record<string, any[]>, result: ExtractedFinancials): void {
  extractPnLFromSheets(sheets, result);
  extractBalanceSheetFromSheets(sheets, result);
}

function findNumericValue(row: any[]): number | null {
  // Find the last numeric value in the row (typically the most recent year)
  for (let i = row.length - 1; i >= 1; i--) {
    const val = row[i];
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[$,\s()]/g, '').replace(/^\((.+)\)$/, '-$1');
      const num = parseFloat(cleaned);
      if (!isNaN(num)) return num;
    }
  }
  return null;
}

function formatSheetsAsText(sheets: Record<string, any[]>): string {
  const lines: string[] = [];
  for (const [name, rows] of Object.entries(sheets)) {
    lines.push(`=== Sheet: ${name} ===`);
    for (const row of rows.slice(0, 100)) { // cap at 100 rows
      if (Array.isArray(row)) {
        lines.push(row.map(c => String(c ?? '')).join('\t'));
      }
    }
  }
  return lines.join('\n').substring(0, 8000); // cap at 8K chars
}

// ─── Claude-assisted extraction for complex documents ───────

async function extractWithClaude(text: string, sourceType: string): Promise<ExtractedFinancials> {
  const response = await getClient().messages.create({
    model: SONNET_MODEL,
    max_tokens: 4096,
    temperature: 0,
    system: PDF_EXTRACTION_PROMPT,
    messages: [
      {
        role: 'user',
        content: `This is extracted text from a ${sourceType} financial document. Extract all financial data.\n\n${text}\n\nReturn ONLY valid JSON.`,
      },
    ],
  });

  const responseText = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as any).text)
    .join('');

  return parseExtractionResponse(responseText);
}

// ─── Response parsing ───────────────────────────────────────

function parseExtractionResponse(text: string): ExtractedFinancials {
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Convert all dollar amounts to cents
    const DOLLAR_FIELDS = new Set([
      'revenue', 'cogs', 'gross_profit', 'operating_expenses', 'net_income',
      'owner_salary', 'depreciation', 'amortization', 'interest_expense', 'taxes',
      'auto_vehicle', 'travel', 'meals_entertainment', 'insurance', 'rent',
      'repairs_maintenance', 'office_expenses', 'professional_fees', 'other_deductions',
      'total_assets', 'total_liabilities', 'total_equity', 'current_assets',
      'current_liabilities', 'cash', 'accounts_receivable', 'inventory',
      'accounts_payable', 'long_term_debt',
    ]);

    const result: ExtractedFinancials = { confidence: 'high', notes: [] };
    for (const [key, value] of Object.entries(parsed)) {
      if (value === null || value === undefined) continue;
      if (DOLLAR_FIELDS.has(key) && typeof value === 'number') {
        (result as any)[key] = Math.round(value * 100);
      } else {
        (result as any)[key] = value;
      }
    }

    return result;
  } catch (err: any) {
    return { confidence: 'low', notes: [`Parse error: ${err.message}`] };
  }
}

// ─── Extraction prompt ──────────────────────────────────────

const PDF_EXTRACTION_PROMPT = `You are a financial data extraction engine for M&A analysis. Extract ALL financial data from the document.

Return a JSON object with these fields (use null for fields not found). Report all dollar amounts in DOLLARS (the system converts to cents).

{
  "document_type": "tax_return" | "pnl" | "balance_sheet" | "unknown",
  "tax_form_type": "Schedule C" | "1120S" | "1065" | "1120" | null,
  "tax_year": 2024,
  "revenue": 1500000,
  "cogs": 600000,
  "gross_profit": 900000,
  "operating_expenses": 500000,
  "net_income": 400000,
  "owner_salary": 150000,
  "depreciation": 25000,
  "amortization": 5000,
  "interest_expense": 12000,
  "taxes": 80000,
  "auto_vehicle": 8000,
  "travel": 5000,
  "meals_entertainment": 3000,
  "insurance": 15000,
  "rent": 36000,
  "repairs_maintenance": 8000,
  "office_expenses": 4000,
  "professional_fees": 6000,
  "other_deductions": 10000,
  "total_assets": null,
  "total_liabilities": null,
  "total_equity": null,
  "current_assets": null,
  "current_liabilities": null,
  "cash": null,
  "accounts_receivable": null,
  "inventory": null,
  "accounts_payable": null,
  "long_term_debt": null,
  "confidence": "high" | "medium" | "low",
  "notes": ["Any extraction warnings or observations"]
}

TAX RETURN EXTRACTION RULES:
- Schedule C: Line 1 → revenue, Line 7 → gross profit, Line 22 → total expenses, Line 31 → net profit
- 1120S: Line 1a → revenue, Line 6 → gross profit, Line 21 → ordinary income, Schedule E → officer compensation
- 1065: Line 1a → revenue, Line 3 → gross profit, Line 8 → net income, K-1 distributions
- 1120: Line 1a → revenue, Line 11 → gross profit, Line 30 → taxable income

CRITICAL RULES:
- Extract EXACTLY what the document shows — never estimate or infer
- If a number is negative or in parentheses, report as negative
- If you can identify specific expense line items, include them (they're potential add-backs)
- Confidence: "high" if numbers are clearly readable, "medium" if some interpretation needed, "low" if poor quality

Respond with ONLY valid JSON. No markdown, no explanation.`;
