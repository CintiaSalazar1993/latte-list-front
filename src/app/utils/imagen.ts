/**
 * Convierte la imagen que sube el usuario en un logo liviano:
 * la recorta al centro en forma cuadrada, la achica a `lado` píxeles
 * y la devuelve como texto base64 ("data:image/webp;base64,...") para guardarla en la base de datos.
 * Así una foto de 4 MB del celular queda en unos 20-40 KB.
 */
export function achicarImagen(archivo: File, lado = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      // Recorte cuadrado centrado (los logos se muestran en un círculo)
      const recorte = Math.min(img.width, img.height);
      const x = (img.width - recorte) / 2;
      const y = (img.height - recorte) / 2;
      const tam = Math.min(lado, recorte); // nunca agrandar una imagen chica

      const canvas = document.createElement('canvas');
      canvas.width = tam;
      canvas.height = tam;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Tu navegador no pudo procesar la imagen.'));
        return;
      }
      ctx.fillStyle = '#ffffff'; // fondo blanco por si la imagen tiene transparencia
      ctx.fillRect(0, 0, tam, tam);
      ctx.drawImage(img, x, y, recorte, recorte, 0, 0, tam, tam);
      URL.revokeObjectURL(url);

      // WEBP pesa menos; si el navegador no sabe generarlo (Safari viejo), usamos JPG
      let datos = canvas.toDataURL('image/webp', 0.85);
      if (!datos.startsWith('data:image/webp')) datos = canvas.toDataURL('image/jpeg', 0.85);
      resolve(datos);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No pudimos leer esa imagen. Probá con otra.'));
    };
    img.src = url;
  });
}
