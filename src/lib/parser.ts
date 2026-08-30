/**
 * Bill OCR text parser for Whee.
 * 
 * Converts raw OCR text lines into candidate line items with:
 * - itemNameGuess: best guess at product name
 * - quantity: numeric quantity (or null if unparseable)
 * - unit: unit string (kg, l, piece, etc., or null if unparseable)
 * - price: unit price or total price in rupees
 * 
 * Uses a small set of pattern matchers (tried in order).
 * Surfaces OCR ambiguity to user rather than guessing silently.
 * Pure function — no side effects, fully testable.
 */

/**
 * Candidate line item from OCR parsing.
 */
export interface ParsedLineItem {
  id: string; // Unique ID for this parsed item (UUID or index-based)
  rawText: string; // Original OCR text (for debugging)
  itemNameGuess: string; // Best guess at product name
  quantity: number | null; // Parsed quantity (null if ambiguous)
  unit: string | null; // Parsed unit (null if ambiguous)
  price: number | null; // Parsed price in rupees (null if not found)
  confidence: "high" | "medium" | "low"; // Confidence in this parse
  warnings: string[]; // Ambiguities to surface to user
}

/**
 * Parse OCR lines into candidate line items.
 * 
 * @param ocrText - Raw text from OCR (could be multiline)
 * @returns Array of parsed line items
 */
export function parseBillText(ocrText: string): ParsedLineItem[] {
  const lines = ocrText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const items: ParsedLineItem[] = [];
  let itemIndex = 0;

  for (const line of lines) {
    // Skip common non-item lines
    if (isMetaLine(line)) {
      continue;
    }

    const parsed = parseLineItem(line, itemIndex);
    if (parsed) {
      items.push(parsed);
      itemIndex++;
    }
  }

  return items;
}

/**
 * Parse a single bill line into a line item.
 * Tries pattern matchers in order.
 */
function parseLineItem(line: string, index: number): ParsedLineItem | null {
  // Pattern 1: "item ... qty unit @ price" or "item qty unit price"
  // Examples:
  //   "Tomato 500 g 40"
  //   "Milk 1 l 60"
  //   "Pen 10 piece 50"
  const match1 = tryPatternQtyUnitPrice(line, index);
  if (match1) return match1;

  // Pattern 2: "item ... price/unit" or "item qty @ price/unit"
  // Examples:
  //   "Tomato 80/kg"
  //   "Oil 1L 250/L"
  const match2 = tryPatternPricePerUnit(line, index);
  if (match2) return match2;

  // Pattern 3: "item ... price" (no quantity/unit — assume single item or weight-less)
  // Examples:
  //   "Eggs (dozen) 120"
  //   "Pen 5"
  const match3 = tryPatternItemPrice(line, index);
  if (match3) return match3;

  // Could not confidently parse this line
  return {
    id: `item-${index}`,
    rawText: line,
    itemNameGuess: line, // fallback: use whole line as name
    quantity: null,
    unit: null,
    price: null,
    confidence: "low",
    warnings: [
      "Could not parse item details. Please edit manually: enter name, quantity, unit, and price."
    ]
  };
}

/**
 * Pattern: "item [qty] [unit] [price]"
 * Examples:
 *   "Tomato 500g ₹40"
 *   "Milk 1L 60"
 *   "Pen (pack of 10) 50"
 */
function tryPatternQtyUnitPrice(
  line: string,
  index: number
): ParsedLineItem | null {
  // Look for: word+ (qty unit|unit|qty) number
  // Simplified regex: capture item name, then look for qty+unit and price
  const regex =
    /^(.+?)\s+(\d+\.?\d*)\s*([a-z]+)\s+(₹?)(\d+\.?\d*)\s*$/i;
  const match = line.match(regex);

  if (match) {
    const itemName = match[1].trim();
    const qty = parseFloat(match[2]);
    const unit = match[3].toLowerCase();
    const price = parseFloat(match[5]);

    const warnings: string[] = [];
    let confidence: "high" | "medium" | "low" = "high";

    // Check for ambiguities
    if (isAmbiguousUnit(unit)) {
      warnings.push(
        `Unit "${unit}" is ambiguous. Please confirm it's the intended unit.`
      );
      confidence = "medium";
    }

    return {
      id: `item-${index}`,
      rawText: line,
      itemNameGuess: itemName,
      quantity: qty,
      unit: unit,
      price: price,
      confidence: confidence,
      warnings: warnings
    };
  }

  return null;
}

/**
 * Pattern: "item ... price/unit"
 * Examples:
 *   "Tomato 80/kg"
 *   "Oil 250/L"
 */
function tryPatternPricePerUnit(
  line: string,
  index: number
): ParsedLineItem | null {
  // Look for: word+ price/unit
  const regex = /^(.+?)\s+(₹?)(\d+\.?\d*)\s*\/\s*([a-z]+)\s*$/i;
  const match = line.match(regex);

  if (match) {
    const itemName = match[1].trim();
    const pricePerUnit = parseFloat(match[3]);
    const unit = match[4].toLowerCase();

    const warnings = [
      "Parsed as price-per-unit, but quantity is unknown. Please enter quantity manually."
    ];

    return {
      id: `item-${index}`,
      rawText: line,
      itemNameGuess: itemName,
      quantity: null, // unknown
      unit: unit,
      price: pricePerUnit, // Note: this is price/unit, not total
      confidence: "medium",
      warnings: warnings
    };
  }

  return null;
}

/**
 * Pattern: "item ... price"
 * Examples:
 *   "Eggs (dozen) 120"
 *   "Pen 5"
 */
function tryPatternItemPrice(
  line: string,
  index: number
): ParsedLineItem | null {
  // Look for: word+ ... number at the end
  const regex = /^(.+?)\s+(₹?)(\d+\.?\d*)\s*$/;
  const match = line.match(regex);

  if (match) {
    const itemName = match[1].trim();
    const price = parseFloat(match[3]);

    const warnings = [
      "Quantity and unit not detected. This might be a single item or a bundle. Please confirm manually."
    ];

    return {
      id: `item-${index}`,
      rawText: line,
      itemNameGuess: itemName,
      quantity: null,
      unit: null,
      price: price,
      confidence: "low",
      warnings: warnings
    };
  }

  return null;
}

/**
 * Check if a line is metadata (store name, date, total, etc.) not a price line.
 */
function isMetaLine(line: string): boolean {
  // Skip common meta patterns
  const metaPatterns = [
    /^total/i,
    /^subtotal/i,
    /^tax|gst/i,
    /^net|payable/i,
    /^date|time/i,
    /^store|shop/i,
    /^invoice|bill/i,
    /^thank you/i,
    /^payment/i,
    /^cash|card/i,
    /^--+$/, // separator lines
    /^[a-z0-9\s]{2,}[₹] [0-9.]+$/i // Generic "label amount" that looks like a total
  ];

  for (const pattern of metaPatterns) {
    if (pattern.test(line)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a unit string is ambiguous (could mean different things).
 */
function isAmbiguousUnit(unit: string): boolean {
  const ambiguous = [
    "pc", // could be piece or pack
    "pk", // could be pack or packet
    "box", // unclear how many items
    "pack" // unclear pack size
  ];
  return ambiguous.includes(unit.toLowerCase());
}

/**
 * Merge duplicate or similar line items detected by OCR.
 * (E.g., OCR split "Tomato 1kg" across two lines.)
 */
export function mergeAdjacent(
  items: ParsedLineItem[]
): ParsedLineItem[] {
  if (items.length <= 1) return items;

  // TODO: Implement fuzzy name matching and merging
  // For now, return as-is
  return items;
}
