# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

---

## Configuración de variables de entorno

Crea un archivo `.env` en la raíz del proyecto (ya está en `.gitignore`).
Agrega tu token de la API:

```bash
TICKET_API_TOKEN=mi_secreto_aqui
```

El fichero `app.config.js` situado en la raíz lee este `.env` y copia
`TICKET_API_TOKEN` al campo `extra` de la configuración de Expo. Esto
hace que el valor sea visible dentro de la app a través de
`Constants.expoConfig.extra.TICKET_API_TOKEN` (o `Constants.manifest.extra`)
antes de que el paquete vaya al dispositivo.

Además, los scripts personalizados (`npm run start`, `android`, `ios`,
`web`) arrancan el CLI de Expo con `-r dotenv/config`, lo que permite que
`process.env.TICKET_API_TOKEN` esté definida al empaquetar en desarrollo.

> **Importante:** si ya añadiste o modificaste `.env`, reinicia el
> servidor (`npm run start` o el comando que uses) para que Metro vuelva
> a empaquetar con la nueva variable. En caso de ejecutar `expo start`
> directamente sin `npm run` no se cargará el `.env` y la variable será
> `undefined`.

A partir de ahí tu código puede usar `process.env.TICKET_API_TOKEN` o, si
prefieres, leerla de `Constants` (el servicio `services/ticket.ts` ya
maneja ambos casos).

## Consumo del endpoint de infracciones

Se ha añadido un servicio en `services/ticket.ts` que exporta la función `fetchTicketInfraction` y el hook `useTicket`.
Estos encapsulan la llamada al URL:

```
http://198.71.58.84:5001/livinkApi/Locations/ticket-infraction
```

La llamada se realiza con **GET** y el `ticketId` se envía en el cuerpo JSON:

```json
{ "ticketId": "<ID>" }
```

El token se envía en el encabezado `Authorization: Bearer <token>` y la respuesta se mapea a la interfaz `TicketData`. Si sigues recibiendo un `401 Unauthorized`, revisa que el valor de `TICKET_API_TOKEN` apunte al inquilino correcto (PUEBLA) y no haya expirado.

Ejemplo de uso en un componente:

```tsx
import TicketInfo from './components/TicketInfo';

<TicketInfo ticketId="12345" />
```

