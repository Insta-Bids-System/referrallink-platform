const UAParser = require('ua-parser-js');

export interface ParsedUserAgent {
  device: string;
  browser: string;
  os: string;
}

export function parseUserAgent(userAgent: string): ParsedUserAgent {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const device = result.device.type || 'desktop';
  const browser = result.browser.name || 'unknown';
  const os = result.os.name || 'unknown';

  return {
    device: device.toLowerCase(),
    browser,
    os
  };
}