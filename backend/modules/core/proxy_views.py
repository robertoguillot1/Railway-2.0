"""
proxy_views.py
Proxy de streaming de cámara para evitar el bloqueo CORS/Pinggy en el frontend.
"""
import urllib.request
from django.http import StreamingHttpResponse, JsonResponse
from django.views import View


class CameraProxyView(View):
    """
    Hace de intermediario entre el dashboard y la URL de la cámara.
    El frontend llama a: /api/v1/core/cam-proxy/?url=https://...pinggy.../video
    Y este endpoint le devuelve el video directamente, saltándose el CORS y el
    aviso interstitial de Pinggy.
    """

    def get(self, request):
        cam_url = request.GET.get('url', '').strip()

        if not cam_url:
            return JsonResponse({'error': 'Falta el parámetro ?url='}, status=400)

        # Solo permitimos URLs de Pinggy o IPs locales por seguridad
        allowed_hosts = ['pinggy', '192.168.', '10.', '172.']
        if not any(host in cam_url for host in allowed_hosts):
            return JsonResponse({'error': 'URL no permitida por seguridad'}, status=403)

        try:
            req = urllib.request.Request(
                cam_url,
                headers={
                    # Este header le indica a Pinggy que omita la pantalla de advertencia
                    'X-Pinggy-No-Screen': '1',
                    'User-Agent': 'HydroSmart-Dashboard/1.0',
                }
            )
            upstream = urllib.request.urlopen(req, timeout=10)
            content_type = upstream.headers.get('Content-Type', 'video/jpeg')

            def stream_generator():
                try:
                    while True:
                        chunk = upstream.read(4096)
                        if not chunk:
                            break
                        yield chunk
                finally:
                    upstream.close()

            response = StreamingHttpResponse(
                stream_generator(),
                content_type=content_type
            )
            response['Access-Control-Allow-Origin'] = '*'
            return response

        except Exception as e:
            return JsonResponse({'error': f'No se pudo conectar: {str(e)}'}, status=502)
