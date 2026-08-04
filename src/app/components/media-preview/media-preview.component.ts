import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MediaImage } from '../../models/media.models';
import { JsonRecord } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { RecordEditsService } from '../../services/record-edits.service';
import { MAX_IMAGE_BYTES, MediaAssetService } from '../../services/media-asset.service';

import '@google/model-viewer';

export type MediaPreviewLayout = 'split' | 'stack' | 'model-only' | 'images-only';

@Component({
  selector: 'app-media-preview',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  template: `
    @if (showModel || showCarousel) {
      <section
        class="media-preview"
        [attr.data-layout]="layout"
        [class.model-only]="showModel && !showCarousel"
        [class.images-only]="!showModel && showCarousel"
        [class.editing]="editing"
      >
        @if (showModel && modelUrl) {
          <div class="model-pane">
            <div class="pane-label">
              <mat-icon>view_in_ar</mat-icon>
              <span>Model</span>
            </div>
            <div class="viewer-shell">
              <model-viewer
                class="viewer"
                [attr.src]="modelUrl"
                [attr.poster]="posterUrl || null"
                alt="3D model preview"
                camera-controls
                touch-action="pan-y"
                shadow-intensity="0.85"
                exposure="1"
                auto-rotate
                interaction-prompt="auto"
              ></model-viewer>
            </div>
          </div>
        }

        @if (showCarousel) {
          <div class="carousel-pane">
            @if (editing) {
              <input
                #fileInput
                type="file"
                accept="image/*"
                multiple
                hidden
                (change)="onFilesSelected($event)"
              />
            }
            <div class="pane-label">
              <mat-icon>photo_library</mat-icon>
              <span>Reference images</span>
              @if (images.length) {
                <span class="count">{{ activeIndex + 1 }} / {{ images.length }}</span>
              }
              @if (editing) {
                <button
                  mat-stroked-button
                  type="button"
                  class="upload-btn"
                  (click)="triggerUpload()"
                  matTooltip="Upload reference images (max 5MB each)"
                >
                  <mat-icon>upload</mat-icon>
                  Upload
                </button>
              }
            </div>

            @if (images.length) {
              <div class="stage">
                <button
                  mat-icon-button
                  type="button"
                  class="nav prev"
                  (click)="prev()"
                  [disabled]="images.length < 2"
                  matTooltip="Previous image"
                  aria-label="Previous image"
                >
                  <mat-icon>chevron_left</mat-icon>
                </button>

                <figure class="frame">
                  <div class="image-shell">
                    <button
                      type="button"
                      class="image-hit"
                      (click)="openLightbox()"
                      matTooltip="View enlarged"
                      aria-label="View enlarged image"
                    >
                      <img
                        [src]="activeImage.url"
                        [alt]="activeImage.alt || activeImage.caption || 'Reference image'"
                      />
                    </button>
                    <button
                      mat-icon-button
                      type="button"
                      class="expand-btn"
                      (click)="openLightbox()"
                      matTooltip="View enlarged"
                      aria-label="View enlarged image"
                    >
                      <mat-icon>open_in_full</mat-icon>
                    </button>
                    @if (editing) {
                      <button
                        mat-icon-button
                        type="button"
                        class="remove-btn"
                        (click)="removeActiveImage()"
                        matTooltip="Remove image"
                        aria-label="Remove image"
                      >
                        <mat-icon>delete</mat-icon>
                      </button>
                    }
                  </div>
                  @if (editing) {
                    <mat-form-field appearance="outline" class="caption-field" subscriptSizing="dynamic">
                      <mat-label>Caption</mat-label>
                      <input
                        matInput
                        [ngModel]="activeImage.caption || ''"
                        (ngModelChange)="onCaptionChange($event)"
                        placeholder="Optional caption"
                      />
                    </mat-form-field>
                  } @else if (activeImage.caption) {
                    <figcaption>{{ activeImage.caption }}</figcaption>
                  }
                </figure>

                <button
                  mat-icon-button
                  type="button"
                  class="nav next"
                  (click)="next()"
                  [disabled]="images.length < 2"
                  matTooltip="Next image"
                  aria-label="Next image"
                >
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </div>

              @if (images.length > 1) {
                <div class="thumbs" role="tablist" aria-label="Reference image thumbnails">
                  @for (image of images; track image.id || image.url; let i = $index) {
                    <button
                      type="button"
                      class="thumb"
                      role="tab"
                      [class.active]="i === activeIndex"
                      [attr.aria-selected]="i === activeIndex"
                      (click)="goTo(i)"
                    >
                      <img [src]="image.url" [alt]="image.alt || image.caption || 'Thumbnail'" />
                    </button>
                  }
                </div>
              }
            } @else if (editing) {
              <button type="button" class="empty-upload" (click)="triggerUpload()">
                <mat-icon>add_photo_alternate</mat-icon>
                <span>Upload reference images</span>
                <span class="hint">PNG, JPG, WebP — up to 5MB each</span>
              </button>
            }
          </div>
        }
      </section>
    }

    @if (lightboxOpen && images.length) {
      <div
        class="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="Enlarged reference image"
      >
        <button
          type="button"
          class="lightbox-backdrop"
          aria-label="Close enlarged view"
          (click)="closeLightbox()"
        ></button>

        <div class="lightbox-ui">
          <button
            mat-icon-button
            type="button"
            class="lightbox-close"
            (click)="closeLightbox()"
            matTooltip="Close"
            aria-label="Close enlarged view"
          >
            <mat-icon>close</mat-icon>
          </button>

          <button
            mat-icon-button
            type="button"
            class="lightbox-nav prev"
            (click)="prev($event)"
            [disabled]="images.length < 2"
            matTooltip="Previous image"
            aria-label="Previous image"
          >
            <mat-icon>chevron_left</mat-icon>
          </button>

          <figure class="lightbox-frame">
            <img
              [src]="activeImage.url"
              [alt]="activeImage.alt || activeImage.caption || 'Reference image'"
            />
            @if (activeImage.caption) {
              <figcaption>
                <span>{{ activeImage.caption }}</span>
                <span class="lightbox-count">{{ activeIndex + 1 }} / {{ images.length }}</span>
              </figcaption>
            } @else if (images.length > 1) {
              <figcaption>
                <span class="lightbox-count">{{ activeIndex + 1 }} / {{ images.length }}</span>
              </figcaption>
            }
          </figure>

          <button
            mat-icon-button
            type="button"
            class="lightbox-nav next"
            (click)="next($event)"
            [disabled]="images.length < 2"
            matTooltip="Next image"
            aria-label="Next image"
          >
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      --tb-model-size: 18.5rem;
    }

    @media (min-width: 1400px) {
      :host {
        --tb-model-size: 20rem;
      }
    }

    .media-preview {
      display: grid;
      gap: 0.85rem;
      margin-bottom: 0.35rem;
      align-items: start;
    }

    .media-preview[data-layout='split']:not(.model-only):not(.images-only) {
      grid-template-columns: var(--tb-model-size) minmax(0, 1fr);
    }

    .media-preview[data-layout='split'].model-only,
    .media-preview[data-layout='split'].images-only,
    .media-preview[data-layout='stack'],
    .media-preview[data-layout='model-only'],
    .media-preview[data-layout='images-only'] {
      grid-template-columns: 1fr;
    }

    .media-preview[data-layout='split'].model-only .model-pane {
      justify-self: start;
      width: min(var(--tb-model-size), 100%);
    }

    .model-pane,
    .carousel-pane {
      background: var(--tb-card);
      border: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
      border-radius: 12px;
      padding: 0.65rem 0.75rem 0.75rem;
      min-width: 0;
    }

    .pane-label {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-bottom: 0.5rem;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--tb-muted);
      flex-wrap: wrap;
    }

    .pane-label mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .count {
      margin-left: auto;
      font-weight: 600;
      letter-spacing: 0;
      text-transform: none;
    }

    .upload-btn {
      margin-left: 0.35rem;
      text-transform: none;
      letter-spacing: 0;
      font-weight: 600;
    }

    .upload-btn mat-icon {
      font-size: 1.05rem;
      width: 1.05rem;
      height: 1.05rem;
      margin-right: 0.15rem;
    }

    .viewer-shell {
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 8px;
      overflow: hidden;
      background: color-mix(in srgb, var(--tb-ink) 5%, transparent);
    }

    .viewer {
      display: block;
      width: 100%;
      height: 100%;
    }

    .stage {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: 0.15rem;
      align-items: center;
    }

    .frame {
      margin: 0;
      min-width: 0;
    }

    .image-shell {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 12rem;
      max-height: min(22rem, 48vh);
      padding: 0.35rem;
      border-radius: 8px;
      background: color-mix(in srgb, var(--tb-ink) 5%, transparent);
      box-sizing: border-box;
      overflow: hidden;
    }

    .image-hit {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      cursor: zoom-in;
      min-height: 0;
      min-width: 0;
    }

    .image-hit img {
      display: block;
      max-width: 100%;
      max-height: min(20.5rem, calc(48vh - 0.7rem));
      width: auto;
      height: auto;
      object-fit: contain;
    }

    .expand-btn {
      position: absolute;
      right: 0.35rem;
      bottom: 0.35rem;
      color: var(--tb-ink);
      background: color-mix(in srgb, var(--tb-card) 88%, transparent);
      backdrop-filter: blur(4px);
    }

    .remove-btn {
      position: absolute;
      right: 0.35rem;
      top: 0.35rem;
      color: var(--tb-ink);
      background: color-mix(in srgb, var(--tb-card) 88%, transparent);
      backdrop-filter: blur(4px);
    }

    .frame figcaption {
      margin-top: 0.45rem;
      font-size: 0.8rem;
      color: var(--tb-muted);
      text-align: center;
    }

    .caption-field {
      width: 100%;
      margin-top: 0.45rem;
    }

    .nav {
      color: var(--tb-ink);
      flex-shrink: 0;
    }

    .thumbs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.6rem;
      justify-content: center;
    }

    .thumb {
      border: 2px solid transparent;
      border-radius: 8px;
      padding: 0;
      cursor: pointer;
      background: color-mix(in srgb, var(--tb-ink) 5%, transparent);
      width: 3.4rem;
      height: 2.4rem;
      box-sizing: border-box;
      overflow: hidden;
      flex-shrink: 0;
    }

    .thumb img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumb.active {
      border-color: var(--tb-accent-strong);
    }

    .empty-upload {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      width: 100%;
      min-height: 10rem;
      margin: 0;
      padding: 1rem;
      border: 1px dashed color-mix(in srgb, var(--tb-ink) 22%, transparent);
      border-radius: 8px;
      background: color-mix(in srgb, var(--tb-ink) 4%, transparent);
      color: var(--tb-muted);
      cursor: pointer;
      font: inherit;
    }

    .empty-upload:hover {
      border-color: var(--tb-accent-strong);
      color: var(--tb-ink);
    }

    .empty-upload mat-icon {
      font-size: 1.75rem;
      width: 1.75rem;
      height: 1.75rem;
    }

    .empty-upload .hint {
      font-size: 0.75rem;
      opacity: 0.85;
    }

    .lightbox {
      position: fixed;
      inset: 0;
      z-index: 1200;
    }

    .lightbox-backdrop {
      position: absolute;
      inset: 0;
      border: 0;
      padding: 0;
      margin: 0;
      cursor: pointer;
      background: color-mix(in srgb, #0c0e12 88%, transparent);
      backdrop-filter: blur(8px);
    }

    .lightbox-ui {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.35rem;
      height: 100%;
      padding: 2.5rem 0.75rem 1.25rem;
      box-sizing: border-box;
      pointer-events: none;
    }

    .lightbox-ui > * {
      pointer-events: auto;
    }

    .lightbox-close {
      position: absolute;
      top: 0.65rem;
      right: 0.65rem;
      color: #f3f5f8;
      z-index: 1;
    }

    .lightbox-nav {
      color: #f3f5f8;
      flex-shrink: 0;
    }

    .lightbox-frame {
      margin: 0;
      min-width: 0;
      justify-self: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.65rem;
      max-height: 100%;
      width: fit-content;
      max-width: 100%;
    }

    .lightbox-frame img {
      display: block;
      max-width: min(100%, 92vw);
      max-height: min(82vh, 100%);
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 6px;
    }

    .lightbox-frame figcaption {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      font-size: 0.85rem;
      color: color-mix(in srgb, #f3f5f8 78%, transparent);
      text-align: center;
    }

    .lightbox-count {
      font-variant-numeric: tabular-nums;
      opacity: 0.8;
    }

    @media (max-width: 720px) {
      .media-preview[data-layout='split']:not(.model-only):not(.images-only) {
        grid-template-columns: 1fr;
      }

      .model-pane {
        width: min(var(--tb-model-size), 100%);
        justify-self: center;
      }

      .image-shell {
        min-height: 11rem;
        max-height: min(20rem, 42vh);
      }

      .image-hit img {
        max-height: min(18.5rem, calc(42vh - 0.7rem));
      }

      .lightbox-ui {
        grid-template-columns: auto auto;
        grid-template-rows: minmax(0, 1fr) auto;
        justify-content: center;
        align-content: center;
        column-gap: 0.5rem;
        padding: 3rem 0.75rem 1rem;
      }

      .lightbox-frame {
        grid-column: 1 / -1;
        grid-row: 1;
      }

      .lightbox-nav.prev {
        grid-column: 1;
        grid-row: 2;
      }

      .lightbox-nav.next {
        grid-column: 2;
        grid-row: 2;
      }
    }

    @media (min-width: 1400px) {
      .media-preview[data-layout='split']:not(.model-only):not(.images-only) {
        grid-template-columns: var(--tb-model-size) minmax(0, 36rem);
        justify-content: start;
      }

      .image-shell {
        max-height: min(24rem, 42vh);
      }

      .image-hit img {
        max-height: min(22.5rem, calc(42vh - 0.7rem));
      }
    }
  `,
})
export class MediaPreviewComponent implements OnChanges {
  private readonly catalog = inject(CatalogService);
  private readonly edits = inject(RecordEditsService);
  private readonly assets = inject(MediaAssetService);
  private readonly snackBar = inject(MatSnackBar);

  /** glTF / GLB URL for the model viewer. */
  @Input() modelUrl: string | null = null;
  /** Optional poster shown before the model loads. */
  @Input() posterUrl: string | null = null;
  /** Reference images for the carousel. */
  @Input() images: MediaImage[] = [];
  /** Layout control so the same component can sit in different contexts. */
  @Input() layout: MediaPreviewLayout = 'split';
  /** Optional override for the square model pane size (CSS length). */
  @Input() modelSize: string | null = null;
  /** Record used for upload / remove / caption edits. */
  @Input() record: JsonRecord | null = null;

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  activeIndex = 0;
  lightboxOpen = false;
  uploading = false;

  ngOnChanges(): void {
    if (this.activeIndex >= this.images.length) {
      this.activeIndex = Math.max(0, this.images.length - 1);
    }
    if (!this.images.length) {
      this.lightboxOpen = false;
    }
  }

  get editing(): boolean {
    return this.edits.editing() && !!this.record;
  }

  get showModel(): boolean {
    return this.layout !== 'images-only' && !!this.modelUrl;
  }

  get showCarousel(): boolean {
    if (this.layout === 'model-only') return false;
    return this.images.length > 0 || this.editing;
  }

  get activeImage(): MediaImage {
    return this.images[this.activeIndex] ?? { url: '', caption: '' };
  }

  prev(event?: Event): void {
    event?.stopPropagation();
    if (this.images.length < 2) return;
    this.activeIndex = (this.activeIndex - 1 + this.images.length) % this.images.length;
  }

  next(event?: Event): void {
    event?.stopPropagation();
    if (this.images.length < 2) return;
    this.activeIndex = (this.activeIndex + 1) % this.images.length;
  }

  goTo(index: number): void {
    if (index < 0 || index >= this.images.length) return;
    this.activeIndex = index;
  }

  openLightbox(): void {
    if (!this.images.length) return;
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
  }

  triggerUpload(): void {
    this.fileInput?.nativeElement.click();
  }

  async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length || !this.record) {
      input.value = '';
      return;
    }

    this.uploading = true;
    try {
      const result = await this.assets.uploadImages(files);
      if (result.accepted.length) {
        const acceptedCaptions: (string | undefined)[] = [];
        for (const file of Array.from(files)) {
          if (!file.type.startsWith('image/') || file.size > MAX_IMAGE_BYTES) continue;
          acceptedCaptions.push(file.name.replace(/\.[^.]+$/, '') || undefined);
        }
        this.catalog.addRecordImageIds(this.record, result.accepted, acceptedCaptions);
      }

      if (result.rejected.length) {
        const sizeCount = result.rejected.filter((r) => r.reason === 'size').length;
        const typeCount = result.rejected.filter((r) => r.reason === 'type').length;
        const parts: string[] = [];
        if (typeCount) parts.push(`${typeCount} not an image`);
        if (sizeCount) parts.push(`${sizeCount} over 5MB`);
        this.snackBar.open(`Skipped: ${parts.join(', ')}`, 'Dismiss', { duration: 4000 });
      }
    } finally {
      this.uploading = false;
      input.value = '';
    }
  }

  removeActiveImage(): void {
    if (!this.record || !this.images.length) return;
    const image = this.activeImage;
    const imageId = image.id || image.url;
    if (!imageId) return;
    this.catalog.removeRecordImage(this.record, imageId);
  }

  onCaptionChange(caption: string): void {
    if (!this.record || !this.images.length) return;
    const image = this.activeImage;
    const imageId = image.id || image.url;
    if (!imageId) return;
    this.catalog.setRecordImageCaption(this.record, imageId, caption);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.lightboxOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeLightbox();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.prev();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.next();
        break;
    }
  }

  /** Only override responsive CSS when an explicit size is provided. */
  @HostBinding('style.--tb-model-size')
  get modelSizeVar(): string | null {
    return this.modelSize;
  }
}
