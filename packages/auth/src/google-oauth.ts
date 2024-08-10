import { Google } from 'arctic';

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export default class GoogleOAuth {
  private client: Google;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.client = new Google(clientId, clientSecret, redirectUri);
  }

  createAuthorizationURL(state: string, codeVerifier: string, options: { scopes: string[] }) {
    return this.client.createAuthorizationURL(state, codeVerifier, options);
  }

  async validateAuthorizationCode(code: string, codeVerifier: string) {
    return this.client.validateAuthorizationCode(code, codeVerifier);
  }

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.json();
  }
}