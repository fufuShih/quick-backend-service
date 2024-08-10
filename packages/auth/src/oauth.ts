import { generateCodeVerifier, generateState } from 'arctic';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import Adapter from './adapter';
import GoogleOAuth from './google-oauth';

const signUpSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(8)
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

type SignUpInput = z.infer<typeof signUpSchema>;
type SignInInput = z.infer<typeof signInSchema>;

export default class OAuth {
  constructor(private adapter: Adapter) {}

  async signUp(values: SignUpInput) {
    try {
      const { email, name, password } = signUpSchema.parse(values);
      const existingUser = await this.adapter.findUserByEmail(email);
      if (existingUser) {
        return { error: 'User already exists', success: false };
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await this.adapter.createUser({ email, name, hashedPassword });
      const session = await this.adapter.createSession(user.id);
      return { success: true, session };
    } catch (error) {
      return { error: "Something went wrong", success: false };
    }
  }

  async signIn(values: SignInInput) {
    try {
      const { email, password } = signInSchema.parse(values);
      const user = await this.adapter.findUserByEmail(email);
      if (!user || !user.hashedPassword) {
        return { success: false, error: "Invalid Credentials!" };
      }

      const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
      if (!passwordMatch) {
        return { success: false, error: "Invalid Credentials!" };
      }

      const session = await this.adapter.createSession(user.id);
      return { success: true, session };
    } catch (error) {
      return { success: false, error: "Something went wrong" };
    }
  }

  async logOut(sessionId: string) {
    await this.adapter.deleteSession(sessionId);
    return { success: true };
  }

  getGoogleOAuthConsentUrl(googleOAuthClient: GoogleOAuth) {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const authUrl = googleOAuthClient.createAuthorizationURL(state, codeVerifier, {
      scopes: ['email', 'profile']
    });

    return {
      success: true,
      url: authUrl.toString(),
      state,
      codeVerifier
    };
  }
}