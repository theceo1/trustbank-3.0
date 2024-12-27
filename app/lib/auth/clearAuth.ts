export function clearAuthData() {
  // Clear Supabase specific cookies
  document.cookie = 'sb-access-token=; Max-Age=0; path=/; domain=' + window.location.hostname;
  document.cookie = 'sb-refresh-token=; Max-Age=0; path=/; domain=' + window.location.hostname;
  
  // Clear local storage
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('supabase.auth.expires_at');
  localStorage.removeItem('supabase.auth.refresh_token');
  
  // Clear session storage
  sessionStorage.clear();
} 