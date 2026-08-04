import { Injectable, computed, signal, effect } from '@angular/core';
import {
  BrowseViewMode,
  DetailViewMode,
  FontChoice,
  FONT_OPTIONS,
  ThemeMode,
} from '../models/catalog.models';

const FONT_KEY = 'tb-data-viewer-font';
const THEME_KEY = 'tb-data-viewer-theme';
const DETAIL_VIEW_KEY = 'tb-data-viewer-detail-view';
const BROWSE_VIEW_KEY = 'tb-data-viewer-browse-view';
const SHEET_COLLAPSED_KEY = 'tb-data-viewer-sheet-collapsed';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  readonly fonts = FONT_OPTIONS;
  readonly font = signal<FontChoice>(this.readStoredFont());
  readonly theme = signal<ThemeMode>(this.readStoredTheme());
  readonly detailView = signal<DetailViewMode>(this.readStoredDetailView());
  readonly browseView = signal<BrowseViewMode>(this.readStoredBrowseView());
  /** Collapsed sheet column keys keyed by dataset id. */
  readonly sheetCollapsedColumns = signal<Record<string, string[]>>(
    this.readStoredSheetCollapsed(),
  );

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

    effect(() => {
      localStorage.setItem(BROWSE_VIEW_KEY, this.browseView());
    });

    effect(() => {
      localStorage.setItem(SHEET_COLLAPSED_KEY, JSON.stringify(this.sheetCollapsedColumns()));
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

  setBrowseView(mode: BrowseViewMode): void {
    this.browseView.set(mode);
  }

  collapsedColumnsFor(datasetId: string): string[] {
    return this.sheetCollapsedColumns()[datasetId] ?? [];
  }

  setCollapsedColumns(datasetId: string, keys: string[]): void {
    this.sheetCollapsedColumns.update((current) => ({
      ...current,
      [datasetId]: [...keys],
    }));
  }

  toggleCollapsedColumn(datasetId: string, key: string): void {
    const current = this.collapsedColumnsFor(datasetId);
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    this.setCollapsedColumns(datasetId, next);
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

  private readStoredBrowseView(): BrowseViewMode {
    const stored = localStorage.getItem(BROWSE_VIEW_KEY);
    if (stored === 'list' || stored === 'sheet') return stored;
    return 'list';
  }

  private readStoredSheetCollapsed(): Record<string, string[]> {
    try {
      const stored = localStorage.getItem(SHEET_COLLAPSED_KEY);
      if (!stored) return {};
      const parsed = JSON.parse(stored) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      const result: Record<string, string[]> = {};
      for (const [datasetId, keys] of Object.entries(parsed)) {
        if (Array.isArray(keys) && keys.every((k) => typeof k === 'string')) {
          result[datasetId] = keys;
        }
      }
      return result;
    } catch {
      return {};
    }
  }
}
