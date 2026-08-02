import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../services/catalog.service';
import { PreferencesService } from '../../services/preferences.service';
import { DatasetBrowserComponent } from '../dataset-browser/dataset-browser.component';
import { FontChoice } from '../../models/catalog.models';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    FormsModule,
    DatasetBrowserComponent,
  ],
  template: `
    <mat-toolbar class="topbar">
      <div class="brand">
        <mat-icon class="brand-icon">travel_explore</mat-icon>
        <div>
          <div class="title">{{ catalog.catalog()?.appName || 'Trailbound Data Viewer' }}</div>
          <div class="subtitle">JSON workshop browser</div>
        </div>
      </div>

      <div class="datasets">
        @for (dataset of catalog.catalog()?.datasets || []; track dataset.id) {
          <button
            mat-stroked-button
            type="button"
            [class.active]="catalog.activeDatasetId() === dataset.id"
            (click)="catalog.selectDataset(dataset.id)"
          >
            <mat-icon>{{ dataset.icon || 'folder' }}</mat-icon>
            {{ dataset.label }}
          </button>
        }
      </div>

      <span class="spacer"></span>

      <button
        mat-icon-button
        type="button"
        class="theme-toggle"
        [matTooltip]="prefs.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
        (click)="prefs.toggleTheme()"
      >
        <mat-icon>{{ prefs.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>

      <mat-form-field appearance="outline" class="font-field" subscriptSizing="dynamic">
        <mat-label>Font</mat-label>
        <mat-select
          [ngModel]="prefs.font()"
          (ngModelChange)="prefs.setFont($event)"
        >
          @for (font of prefs.fonts; track font.id) {
            <mat-option [value]="font.id">{{ font.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-toolbar>

    <main class="main">
      <app-dataset-browser />
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: var(--tb-bg);
      color: var(--tb-ink);
      font-family: var(--tb-font);
    }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 20;
      height: auto;
      min-height: 4.25rem;
      padding: 0.65rem 1rem;
      gap: 1rem;
      background: color-mix(in srgb, var(--tb-panel) 92%, transparent);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
      color: var(--tb-ink);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      min-width: 12rem;
    }

    .brand-icon {
      color: var(--tb-accent-strong);
    }

    .title {
      font-weight: 700;
      line-height: 1.1;
    }

    .subtitle {
      font-size: 0.75rem;
      color: var(--tb-muted);
    }

    .datasets {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .datasets button.active {
      background: color-mix(in srgb, var(--tb-accent) 18%, transparent);
      border-color: var(--tb-accent-strong);
    }

    .spacer {
      flex: 1;
    }

    .theme-toggle {
      color: var(--tb-ink);
    }

    .font-field {
      width: 9.5rem;
      font-size: 0.9rem;
    }

    .main {
      min-height: calc(100vh - 4.25rem);
    }

    @media (max-width: 800px) {
      .topbar {
        flex-wrap: wrap;
      }

      .spacer {
        display: none;
      }
    }
  `,
})
export class ShellComponent {
  readonly catalog = inject(CatalogService);
  readonly prefs = inject(PreferencesService);

  // Helps template typing for mat-select
  asFont(value: string): FontChoice {
    return value as FontChoice;
  }
}
