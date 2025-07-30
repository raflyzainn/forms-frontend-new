// Token management utilities

export async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem('refresh_token')
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID
    
    if (!refreshToken || !clientId) {
      throw new Error('Refresh token or client ID not found')
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_OAUTH_REFRESH_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const data = await response.json()
    
    // Update tokens in localStorage
    localStorage.setItem('access_token', data.access_token)
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token)
    }
    
    return data.access_token
  } catch (error) {
    console.error('Error refreshing token:', error)
    // Clear all tokens and redirect to login
    clearAllTokens()
    window.location.href = '/'
    throw error
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch (error) {
    return true // If we can't decode, assume expired
  }
}

export function getCurrentToken(): string | null {
  return localStorage.getItem('access_token') || localStorage.getItem('token')
}

export function clearAllTokens(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('token')
}

export async function fetchWithTokenRefresh(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getCurrentToken()
  
  if (!token) {
    throw new Error('No token available')
  }

  // Add authorization header
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  }

  let response = await fetch(url, {
    ...options,
    headers,
  })

  // If 401, try to refresh token and retry
  if (response.status === 401) {
    try {
      const newToken = await refreshAccessToken()
      
      // Retry with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          'Authorization': `Bearer ${newToken}`,
        },
      })
    } catch (refreshError) {
      // Refresh failed, user will be redirected to login
      throw refreshError
    }
  }

  return response
} 