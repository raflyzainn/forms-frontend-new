'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')

      const savedState = localStorage.getItem('oauth_state')
      const codeVerifier = localStorage.getItem('pkce_code_verifier')

      if (!code || !state || !codeVerifier) {
        setError('Missing code/state/verifier')
        setLoading(false)
        return
      }

      if (state !== savedState) {
        setError('Invalid state')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, code_verifier: codeVerifier }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to get token')
        }

        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('isLoggedIn', 'true')

        try {
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
              'Content-Type': 'application/json',
            },
          });
          if (!userRes.ok) throw new Error('Gagal ambil data user');
          const userData = await userRes.json();
          const nik = userData?.data?.data?.koperasi_detail?.nik;
          if (!nik) throw new Error('NIK tidak ditemukan di data user');
          localStorage.setItem('nik', nik);
          localStorage.setItem('user', JSON.stringify(userData.data.data));

          try {
            const sessionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.access_token}`,
              },
              body: JSON.stringify({ nik }),
            });
            if (!sessionRes.ok) throw new Error('Gagal membuat session');
            const sessionData = await sessionRes.json();
            localStorage.setItem('session_id', sessionData.session_id);
          } catch (e: any) {
            setError(e.message || 'Gagal membuat session');
            setLoading(false);
            return;
          }
        } catch (e: any) {
          setError(e.message || 'Gagal mengambil data user/NIK');
          setLoading(false);
          return;
        }

        router.push('/forms')
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (loading) return <div className="text-center mt-20 text-lg">Logging in...</div>
  if (error) return <div className="text-center text-red-600 mt-20">Error: {error}</div>

  return null
}
