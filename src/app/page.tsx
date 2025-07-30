"use client";
import Image from "next/image";
import { generateCodeVerifier, generateCodeChallenge, generateState } from '@/lib/pkce';

const OAUTH_AUTH_URL = process.env.NEXT_PUBLIC_OAUTH_AUTH_URL!;
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI!;

export default function OdsLoginPage() {
  async function handleOAuthLogin() {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    localStorage.setItem('pkce_code_verifier', codeVerifier);
    localStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'profile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
    });

    window.location.href = `${OAUTH_AUTH_URL}?${params.toString()}`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="bg-white rounded-xl shadow-lg p-10 flex flex-col items-center w-full max-w-md">
        <Image
          src="/assets/logo kemenkop.png"
          alt="Logo Kemenkop"
          width={180}
          height={90}
          className="mb-4"
        />
        <h1 className="text-2xl font-bold mb-1">Login Form</h1>
        <p className="text-gray-500 mb-8">Kementerian Koperasi</p>
        <button
          type="button"
          className="flex items-center justify-center w-full bg-[#23486B] text-white py-3 px-6 rounded hover:bg-[#18324b] text-lg font-semibold shadow transition"
          onClick={handleOAuthLogin}
        >
          Login menggunakan ODS
        </button>
      </div>
    </div>
  );
}