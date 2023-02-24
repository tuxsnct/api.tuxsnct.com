import { Context } from 'hono'
import { html } from 'hono/html'
import { getStatusText, StatusCode } from 'hono/utils/http-status'
import { isBrowser } from '../../libs'

export const BrowserErrorTemplate = (status: StatusCode) => html`
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${status}: ${getStatusText(status)}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap" rel="stylesheet" />
      <style>body { font-family: 'Inter', sans-serif; }</style>
    </head>
    <body class="flex items-center justify-center font-sans bg-white dark:bg-black select-none">
      <div class="text-center text-black dark:text-white">
        <h1 class="text-4xl font-bold">${status.toString()}</h1>
        <span>${getStatusText(status)}</span>
      </div>
    </body>
  </html>
`

export const throwErrorOutput = (context: Context, status: StatusCode) => {
  if (isBrowser(context)) {
    return context.html(BrowserErrorTemplate(status), status)
  }
  return context.text(getStatusText(status), status)
}
