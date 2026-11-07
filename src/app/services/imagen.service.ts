import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_PRESET } from '../config';

@Injectable({
  providedIn: 'root',
})
export class ImagenService {
  private url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  constructor(private http: HttpClient) {}

  /** Sube la imagen (en base64) a Cloudinary y devuelve el link público. */
  subirLogo(imagen: string) {
    const datos = new FormData();
    datos.append('file', imagen);
    datos.append('upload_preset', CLOUDINARY_PRESET);
    return this.http.post<{ secure_url: string }>(this.url, datos).pipe(map((r) => r.secure_url));
  }
}