// Datos de conexión del proyecto. Solo la clave pública (anon) va en la página.
export const SUPABASE_URL = 'https://mvtdszqhuiqugcndyjeg.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12dGRzenFodWlxdWdjbmR5amVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzOTQyMjMsImV4cCI6MjEwODk3MDIyM30.ZW1nY8rTRNV2YesztmQrWv6Reebp6yfmy2fcMHiVvfs';

// Número del local para pedidos por WhatsApp: 549 + código de área sin 0 + número sin 15
export const WA_NUMERO = '5492604019454';

// Bucket de Supabase Storage donde se guardan las fotos
export const BUCKET = 'fotos';

export const urlFoto = path => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
