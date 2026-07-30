import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function renderTemplate(fileName: string, variables: Record<string, string>): string {
  const filePath = path.join(__dirname, fileName);

  let html = fs.readFileSync(filePath, 'utf8');

  for (const [key, value] of Object.entries(variables)) {
    html = html.split(`{{${key}}}`).join(value);
  }

  return html;
}
