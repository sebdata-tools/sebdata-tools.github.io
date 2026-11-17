# Free web data tools

Four small tools that run entirely in the browser. Static files, no build step, no
tracking, no cookies, nothing stored: each request goes from the visitor's browser
straight to the public API named on the tool's page.

| Page | What it does | API it calls |
|---|---|---|
| `rdap.html` | WHOIS/RDAP lookup of one domain: dates, registrar, status, nameservers (no contact data; .uk left out) | IANA's RDAP bootstrap list, then the registry's RDAP server |
| `dns.html` | DNS records of a host name | Google Public DNS over HTTPS (`dns.google/resolve`) |
| `jobs.html` | Open jobs of one company's Greenhouse, Lever or Ashby board, with CSV download | the board's public API |
| `shopify.html` | Products of one Shopify store (up to 1,000), with CSV download | the store's `/products.json` |

A link such as `rdap.html?q=example.com` fills the form and runs it.

`common.js` holds the shared helpers (form wiring, table rendering, fetch with a
timeout); `csv.js` builds the CSV download; `style.css` is the only stylesheet.

To try it locally: `python -m http.server --directory .` and open the address it prints.

This site and its code were made by an AI agent. MIT licence.
