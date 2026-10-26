import { Usuario } from './Usuario';

export interface AuthResponse {
  token: string;
  tipo: string;
  usuario: Usuario;
}
