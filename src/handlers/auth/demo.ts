import { Handler } from 'hono'
import { html } from 'hono/html'

// eslint-disable-next-line max-lines-per-function,no-secrets/no-secrets
export const handleAuthDemo: Handler = (context) => context.html(html`
  <html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Authentication Demo</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap" rel="stylesheet"/>
    <script type="module">
      import { encode, decode } from 'https://cdn.jsdelivr.net/npm/base64-arraybuffer@1.0.2/+esm'

      window.registerUser = async () => {
        const email = prompt('User Email?')
        if (!email) return
        const id = prompt('User ID?')
        if (!id) return
        const name = prompt('User Name?')
        if (!name) return

        const { status } = await (fetch('/auth/user/register', { method: 'POST', body: JSON.stringify({ email, id, name }) }))
        if (status === 200) console.log('Registered your account')
        else console.error('An error has occurred')
      }
      window.registerAuthenticator = async () => {
        const label = prompt('Device Name?')
        if (!label) return

        const options = await (await fetch('/auth/fido2/register', { credentials: 'include' })).json();

        options.user.displayName = decode(options.user.displayName)
        options.user.id = decode(options.user.id)
        options.user.name = decode(options.user.name)
        options.challenge = decode(options.challenge)

        if (options.excludeCredentials) {
          for (let cred of options.excludeCredentials) {
            cred.id = decode(cred.id)
          }
        }

        const cred = await navigator.credentials.create({
          publicKey: options
        });

        const credential = { 
          id: cred.id,
          label,
          rawId: encode(cred.rawId),
          type: cred.type
        };

        if (cred.response) {
          credential.response = {
            clientDataJSON: encode(cred.response.clientDataJSON),
            attestationObject: encode(cred.response.attestationObject),
          }
        }

        await fetch('/auth/fido2/register', { method: 'POST', credentials: 'same-origin', body: JSON.stringify(credential) });
        console.log('Registered your authenticator')
      };
      window.login = async () => {
        const id = prompt('User ID?')
        if (!id) return

        const options = await (await fetch('/auth/fido2/login?id='+id)).json();

        if (options.allowCredentials.length === 0) {
          console.info('No registered credentials found.');
          return Promise.resolve(null);
        }

        options.challenge = decode(options.challenge);

        for (let cred of options.allowCredentials) cred.id = decode(cred.id);

        const cred = await navigator.credentials.get({ publicKey: options });

        const credential = {
          id: cred.id,
          rawId: encode(cred.rawId),
          type: cred.type
        };

        if (cred.response) {
          const clientDataJSON = encode(cred.response.clientDataJSON);
          const authenticatorData = encode(cred.response.authenticatorData);
          const signature = encode(cred.response.signature);
          const userHandle = encode(cred.response.userHandle);
          credential.response = {
            clientDataJSON,
            authenticatorData,
            signature,
            userHandle
          };
        }

        await fetch('/auth/fido2/login', { method: 'POST', credentials: "same-origin", body: JSON.stringify(credential) });
        console.log('Logged in')
      };
      window.logout = () => {
        document.cookie = 'token=;path=/'
        console.log('Logged out')
      }
      window.recoverAuthenticator = async () => {
        const id = prompt('User ID?')
        if (!id) return
        await fetch('/auth/recovery?id='+id)
        console.log('Check your mailbox')
      }
    </script>
    <style>
      body {
        font-family: 'Inter', sans-serif;
      }
    </style>
  </head>
  <body class="flex items-center justify-center font-sans bg-white dark:bg-black select-none">
    <div class="text-center space-y-4">
      <button class="p-4 bg-blue-500 rounded-lg shadow-lg" onclick="registerUser()">Register User</button><br />
      <button class="p-4 bg-blue-500 rounded-lg shadow-lg" onclick="registerAuthenticator()">Register Authenticator</button><br />
      <button class="p-4 bg-blue-500 rounded-lg shadow-lg" onclick="login()">Login</button><br />
      <button class="p-4 bg-blue-500 rounded-lg shadow-lg" onclick="logout()">Logout</button><br />
      <button class="p-4 bg-blue-500 rounded-lg shadow-lg" onclick="recoverAuthenticator()">Recover Authenticator</button>
    </div>
  </body>
  </html>
`)
