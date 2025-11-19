import { NextRequest } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  try {
    const { html, pdfOptions } = await req.json();

    if (typeof html !== 'string' || html.length === 0) {
      return new Response('Invalid html payload', { status: 400 });
    }

    const browser = await puppeteer.launch({
      executablePath:
        process.env.NODE_ENV === 'production'
          ? '/usr/bin/chromium-browser'
          : undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(
      `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>
        @page { margin: 0; }
        body { margin: 0; font-family: Helvetica, Arial, sans-serif; -webkit-print-color-adjust: exact; }
        * { box-sizing: border-box; }
      </style></head><body>${html}</body></html>`,
      { waitUntil: 'networkidle0' }
    );

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      ...(pdfOptions || {}),
    });

    await page.close();
    await browser.close();

    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Export PDF error:', err);
    return new Response('Failed to export PDF', { status: 500 });
  }
}
