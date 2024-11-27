import express, { Request, Response } from "express";
import axios from "axios";

const discordAuthBaseUrl = "https://discord.com/api/oauth2";

export const setupAuthRoutes = (app: express.Application) => {
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
  const redirectUri = process.env.DISCORD_REDIRECT_URI!;

  // Redirect to Discord OAuth2 URL
  app.get("/", (req: Request, res: Response) => {
    const authUrl = `${discordAuthBaseUrl}/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=identify%20guilds`;
    res.send(`<a href="${authUrl}">Login with Discord</a>`);
  });

  // Handle the OAuth2 callback
  app.get("/auth/discord/callback", async (req: any, res: any) => {
    const code = req.query.code as string;

    if (!code) {
      return res.status(400).send("Authorization code is missing.");
    }

    try {
      // Exchange the code for an access token
      const tokenResponse = await axios.post(
        `${discordAuthBaseUrl}/token`,
        new URLSearchParams({   
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const { access_token, token_type } = tokenResponse.data;
      console.log({ access_token, token_type })

      // Fetch user data
      const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `${token_type} ${access_token}` },
      });

      const user = userResponse.data;

      // Placeholder: Store user data in the database here
      console.log("Authenticated User:", user);

      res.send(`Hello, ${user.username}! Authentication successful.`);
    } catch (error) {
      console.error("OAuth2 error:", error);
      res.status(500).send("Authentication failed.");
    }
  });
};
