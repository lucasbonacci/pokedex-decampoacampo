import axios from 'axios';

export function getRequestErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Ocurrió un error inesperado. Intenta nuevamente.';
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'La solicitud tardó demasiado. Intenta nuevamente.';
  }

  if (!error.response) {
    return 'No pudimos conectar con el servidor. Revisa tu conexión e intenta nuevamente.';
  }

  if (error.response.status === 429) {
    return 'Hay demasiadas solicitudes. Espera un momento e intenta nuevamente.';
  }

  if (error.response.status >= 500) {
    return 'El servidor no está disponible. Intenta nuevamente más tarde.';
  }

  return 'No se pudo completar la solicitud. Intenta nuevamente.';
}

export function shouldRetryRequest(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2 || axios.isCancel(error) || !axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;

  return status === undefined || status === 408 || status === 429 || status >= 500;
}
