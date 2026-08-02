import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CatalogService } from './services/catalog.service';
import { PreferencesService } from './services/preferences.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
    }
  `,
})
export class AppComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly prefs = inject(PreferencesService);

  ngOnInit(): void {
    void this.prefs;
    void this.catalog.init();
  }
}
