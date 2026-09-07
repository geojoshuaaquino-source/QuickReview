import { CardType } from '../domain/models';

export type ImportedCard = { front: string; back: string; type: CardType };

function clean(value: string) {
  return value.replace(/^\uFEFF/, '').trim();
}

export function parseTextCards(text: string): ImportedCard[] {
  const lines = text.split(/\r?\n/).map(clean).filter(Boolean);
  const cards: ImportedCard[] = [];

  for (const line of lines) {
    const separator = line.includes('::') ? '::' : line.includes('\t') ? '\t' : null;
    if (!separator) continue;
    const index = line.indexOf(separator);
    const front = clean(line.slice(0, index));
    const back = clean(line.slice(index + separator.length));
    if (front && back) cards.push({ front, back, type: 'basic' });
  }
  return cards;
}

export function parseCsvCards(text: string): ImportedCard[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (char !== '\r') cell += char;
  }
  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);

  const start = rows.length > 0 && /^(front|question|term|prompt)$/i.test(clean(rows[0][0] ?? '')) ? 1 : 0;
  return rows.slice(start).map(columns => ({ front: clean(columns[0] ?? ''), back: clean(columns[1] ?? ''), type: 'basic' as CardType })).filter(card => card.front && card.back);
}

export function parseImportedCards(text: string, mimeType?: string, name?: string) {
  const lower = (name ?? '').toLowerCase();
  const csv = mimeType === 'text/csv' || lower.endsWith('.csv');
  return csv ? parseCsvCards(text) : parseTextCards(text);
}
