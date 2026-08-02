import { Component, Input } from '@angular/core';
import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { JsonValue } from '../../models/catalog.models';

@Component({
  selector: 'app-json-tree',
  standalone: true,
  imports: [KeyValuePipe, NgTemplateOutlet, MatIconModule, MatChipsModule],
  template: `
    <div class="json-tree" [class.compact]="compact">
      <ng-container
        *ngTemplateOutlet="nodeTpl; context: { $implicit: value, path: rootLabel }"
      ></ng-container>
    </div>

    <ng-template #nodeTpl let-node let-path="path">
      @if (isArray(node)) {
        <details class="node" [open]="depthOpen(path)">
          <summary>
            <mat-icon>data_array</mat-icon>
            <span class="key">{{ path }}</span>
            <span class="meta">array · {{ node.length }}</span>
          </summary>
          <div class="children">
            @for (item of node; track $index; let i = $index) {
              <ng-container
                *ngTemplateOutlet="nodeTpl; context: { $implicit: item, path: '[' + i + ']' }"
              ></ng-container>
            }
          </div>
        </details>
      } @else if (isObject(node)) {
        <details class="node" [open]="depthOpen(path)">
          <summary>
            <mat-icon>data_object</mat-icon>
            <span class="key">{{ path }}</span>
            <span class="meta">object · {{ keyCount(node) }}</span>
          </summary>
          <div class="children">
            @for (entry of node | keyvalue; track entry.key) {
              <ng-container
                *ngTemplateOutlet="
                  leafOrChild;
                  context: { $implicit: entry.value, path: entry.key }
                "
              ></ng-container>
            }
          </div>
        </details>
      } @else {
        <div class="leaf">
          <span class="key">{{ path }}</span>
          <span class="value" [attr.data-type]="typeOf(node)">{{ display(node) }}</span>
        </div>
      }
    </ng-template>

    <ng-template #leafOrChild let-node let-path="path">
      @if (isArray(node) || isObject(node)) {
        <ng-container
          *ngTemplateOutlet="nodeTpl; context: { $implicit: node, path: path }"
        ></ng-container>
      } @else if (path === 'tags' && isStringArray(node)) {
        <div class="leaf tags">
          <span class="key">{{ path }}</span>
          <mat-chip-set>
            @for (tag of asStringArray(node); track tag) {
              <mat-chip>{{ tag }}</mat-chip>
            }
          </mat-chip-set>
        </div>
      } @else {
        <div class="leaf">
          <span class="key">{{ path }}</span>
          <span class="value" [attr.data-type]="typeOf(node)">{{ display(node) }}</span>
        </div>
      }
    </ng-template>
  `,
  styles: `
    .json-tree {
      font-size: 0.92rem;
      line-height: 1.45;
    }

    .node,
    .leaf {
      margin: 0.15rem 0;
    }

    summary {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;
      list-style: none;
      padding: 0.2rem 0.35rem;
      border-radius: 6px;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary:hover {
      background: color-mix(in srgb, var(--tb-accent) 10%, transparent);
    }

    summary mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--tb-muted);
    }

    .children {
      margin-left: 1rem;
      padding-left: 0.75rem;
      border-left: 1px solid color-mix(in srgb, var(--tb-ink) 12%, transparent);
    }

    .leaf {
      display: grid;
      grid-template-columns: minmax(7rem, 12rem) 1fr;
      gap: 0.75rem;
      padding: 0.25rem 0.35rem;
      align-items: start;
    }

    .leaf.tags {
      align-items: center;
    }

    .key {
      font-weight: 600;
      color: var(--tb-ink);
      word-break: break-word;
    }

    .meta {
      color: var(--tb-muted);
      font-size: 0.78rem;
    }

    .value {
      word-break: break-word;
      white-space: pre-wrap;
    }

    .value[data-type='string'] {
      color: var(--tb-json-string);
    }

    .value[data-type='number'] {
      color: var(--tb-json-number);
    }

    .value[data-type='boolean'] {
      color: var(--tb-json-boolean);
    }

    .value[data-type='null'] {
      color: var(--tb-muted);
      font-style: italic;
    }

    .compact .leaf {
      grid-template-columns: minmax(5rem, 8rem) 1fr;
      font-size: 0.85rem;
    }
  `,
})
export class JsonTreeComponent {
  @Input({ required: true }) value!: JsonValue;
  @Input() rootLabel = 'root';
  @Input() compact = false;
  @Input() defaultOpenDepth = 1;

  isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  isStringArray(value: unknown): boolean {
    return Array.isArray(value) && value.every((v) => typeof v === 'string');
  }

  asStringArray(value: unknown): string[] {
    return this.isStringArray(value) ? (value as string[]) : [];
  }

  keyCount(value: Record<string, unknown>): number {
    return Object.keys(value).length;
  }

  typeOf(value: unknown): string {
    if (value === null) return 'null';
    return typeof value;
  }

  display(value: unknown): string {
    if (value === null) return 'null';
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  }

  depthOpen(path: string): boolean {
    if (path === this.rootLabel) return true;
    const depth = path.split('.').length + (path.includes('[') ? 1 : 0);
    return depth <= this.defaultOpenDepth;
  }
}
