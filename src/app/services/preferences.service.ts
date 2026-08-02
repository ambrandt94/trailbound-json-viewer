import { Injectable, computed, signal, effect } from '@angular/core';
import { DetailViewMode, FontChoice, FONT_OPTIONS, ThemeMode } from '../models/catalog.models';

const FONT_KEY = 'tb-data-viewer-font';
const THEME_KEY = 'tb-data-viewer-theme';
const DETAIL_VIEW_KEY = 'tb-data-viewer-detail-view';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  readonly fonts = FONT_OPTIONS;
  readonly font = signal<FontChoice>(this.readStoredFont());
  readonly theme = signal<ThemeMode>(this.readStoredTheme());
  readonly detailView = signal<DetailViewMode>(this.readStoredDetailView());

  readonly fontStack = computed(() => {
    return this.fonts.find((f) => f.id === this.font())?.stack ?? "'Poppins', sans-serif";
  });

  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    effect(() => {
      const choice = this.font();
      document.documentElement.style.setProperty('--tb-font', this.fontStack());
      document.documentElement.dataset['font'] = choice;
      localStorage.setItem(FONT_KEY, choice);
    });

    effect(() => {
      const theme = this.theme();
      document.documentElement.dataset['theme'] = theme;
      document.documentElement.style.colorScheme = theme;
      localStorage.setItem(THEME_KEY, theme);
    });

    effect(() => {
      localStorage.setItem(DETAIL_VIEW_KEY, this.detailView());
    });
  }

  setFont(font: FontChoice): void {
    this.font.set(font);
  }

  setTheme(theme: ThemeMode): void {
    this.theme.set(theme);
  }

  toggleTheme(): void {
    this.theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  setDetailView(mode: DetailViewMode): void {
    this.detailView.set(mode);
  }

  private readStoredFont(): FontChoice {
    const stored = localStorage.getItem(FONT_KEY);
    if (stored && this.fonts.some((f) => f.id === stored)) {
      return stored as FontChoice;
    }
    return 'poppins';
  }

  private readStoredTheme(): ThemeMode {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  }

  private readStoredDetailView(): DetailViewMode {
    const stored = localStorage.getItem(DETAIL_VIEW_KEY);
    if (stored === 'presentation' || stored === 'json') return stored;
    return 'presentation';
  }
}
