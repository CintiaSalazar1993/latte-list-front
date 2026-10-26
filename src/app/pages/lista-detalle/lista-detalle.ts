import { Component, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Costo } from '../../components/costo/costo';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { Ruleta } from '../../components/ruleta/ruleta';
import { TazaLogo } from '../../components/taza-logo/taza-logo';
import { CafeResumen } from '../../models/CafeResumen';
import { Lista } from '../../models/Lista';
import { ConfirmService } from '../../services/confirm.service';
import { ListaService } from '../../services/lista.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { mensajeError } from '../../utils/errores';

/** Detalle de una lista: sus cafés (quitar) y la ruleta (sorteo de un café de la lista). */
@Component({
  selector: 'app-lista-detalle',
  imports: [RouterLink, TazaLogo, Costo, EstadoVacio, Ruleta],
  templateUrl: './lista-detalle.html',
  styleUrl: './lista-detalle.css',
})
export class ListaDetalle implements OnInit {
  lista = signal<Lista | null>(null);
  cargando = signal(true);
  error = signal('');
  girando = signal(false);
  elegido = signal<CafeResumen | null>(null);

  ruleta = viewChild(Ruleta);
  private idLista = 0;

  constructor(
    private route: ActivatedRoute,
    private listaService: ListaService,
    private notificaciones: NotificacionesService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.idLista = Number(this.route.snapshot.paramMap.get('id'));
    this.traerLista();
  }

  traerLista() {
    this.listaService.getListaById(this.idLista).subscribe({
      next: (data) => {
        this.lista.set(data);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargando.set(false);
      },
    });
  }

  /** El backend elige el café al azar; la ruleta solo anima hasta ese café. */
  girar() {
    if (this.girando()) return;
    this.girando.set(true);
    this.elegido.set(null);
    this.listaService.getCafeAleatorioDeLista(this.idLista).subscribe({
      next: (cafe) => this.ruleta()?.girarHacia(cafe.id),
      error: (e) => {
        this.notificaciones.error(mensajeError(e));
        this.girando.set(false);
      },
    });
  }

  /** Evento (termino) de la ruleta: el hijo le avisa al padre cuál salió. */
  alTerminarGiro(cafe: CafeResumen) {
    this.elegido.set(cafe);
    this.girando.set(false);
  }

  async quitar(cafe: CafeResumen) {
    const lista = this.lista();
    if (!lista) return;
    const ok = await this.confirm.preguntar({
      titulo: 'Quitar de la lista',
      mensaje: `¿Quitar "${cafe.nombre}" de "${lista.nombre}"?`,
      textoConfirmar: 'Quitar',
    });
    if (!ok) return;
    this.listaService.deleteCafeDeLista(this.idLista, cafe.id).subscribe({
      next: (actualizada) => {
        this.lista.set(actualizada);
        if (this.elegido()?.id === cafe.id) this.elegido.set(null);
        this.notificaciones.ok(`Quitaste "${cafe.nombre}"`);
      },
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });
  }
}
