export function generateCodeVerifier(length = 128) {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let codeVerifier = "";
    for (let i = 0; i < length; i++) {
      codeVerifier += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return codeVerifier;
  }

  export async function generateCodeChallenge(codeVerifier: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return base64;
  }

  export function generateState(length = 32) {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let state = "";
    for (let i = 0; i < length; i++) {
      state += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return state;
  }