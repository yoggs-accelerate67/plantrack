import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserService } from '@core/services/user.service';
import { AnalyticsService } from '../analytic.service';
import { AnalyticsReport } from '../analytics.model';
import { NavbarComponent } from '@core/layout/navbar/navbar.component';

type TabKey = 'overall' | 'plans' | 'milestones' | 'initiatives';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, NgClass],
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent implements OnInit {
  private readonly api = inject(AnalyticsService);
  private readonly userApi = inject(UserService);

  // Filters
  departments = signal<string[]>([]);
  selectedDept = signal<string>('');
  startDate    = signal<string>(''); // YYYY-MM-DD (from <input type="date">)
  endDate      = signal<string>(''); // YYYY-MM-DD

  // Unified data source
  reports = signal<AnalyticsReport[]>([]);

  // UI state
  loading = signal<boolean>(false);
  error   = signal<string>('');

  // Tabs
  tab = signal<TabKey>('overall');

  // Derived: the "current" (latest/newest) report to power the KPI cards and tabs
  current = computed<AnalyticsReport | null>(() => {
    const arr = this.reports();
    return arr.length ? arr[0] : null; // we keep reports sorted DESC by generatedDate
  });

  // Derived: the rest of reports for "trend" (after the current one)
  trend = computed<AnalyticsReport[]>(() => {
    const arr = this.reports();
    return arr.length > 1 ? arr.slice(1) : [];
  });

  // Derived KPI helpers (read from current())
  planPct     = computed(() => this.current()?.planCompletionRate ?? 0);
  milesPct    = computed(() => this.current()?.milestoneCompletionRate ?? 0);
  initPct     = computed(() => this.current()?.initiativeCompletionRate ?? 0);
  overallPct  = computed(() => this.current()?.overallCompletionRate ?? 0);

  ngOnInit(): void {
    this.fetchDepartments();
  }

  private fetchDepartments(): void {
    this.loading.set(true);
    this.userApi.getDepartments().subscribe({
      next: (list) => {
        this.departments.set(list);
        if (list.length && !this.selectedDept()) {
          this.selectedDept.set(list[0]);
        }
        this.loading.set(false);
        console.log(this.departments());
        this.refresh(); // initial load after departments
      },
      error: (err) => {
        this.error.set('Failed to load departments');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  /** Sort newest-first by generatedDate (robust against fractional seconds) */
  private sortDesc = (rows: AnalyticsReport[]) =>
    [...rows].sort((a, b) =>
      new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()
    );

  /** One button to rule them all: load based on filters */
  refresh(): void {
    const dept = this.selectedDept();
    if (!dept) return;

    this.loading.set(true);
    this.error.set('');

    const s = this.startDate();
    const e = this.endDate();

    // If date range is provided, show the range; otherwise show latest only
    if (s && e) {
      this.api.getByDateRange(dept, s, e).subscribe({
        next: (list) => {
          this.reports.set(this.sortDesc(list ?? []));
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load reports for date range');
          this.loading.set(false);
          console.error(err);
        },
      });
    } else {
      this.api.getLatest(dept).subscribe({
        next: (rep) => {
          // show the latest as a single-item list
          this.reports.set(rep ? [rep] : []);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load latest analytics');
          this.loading.set(false);
          console.error(err);
        },
      });
    }
  }

  /** Generate a new report now and make it the current one */
  generateNow(): void {
    const dept = this.selectedDept();
    if (!dept) return;

    this.loading.set(true);
    this.api.generateAll(dept).subscribe({
      next: (rep) => {
        // Put freshly generated report at the top; avoid duplicates by filtering old same id
        this.reports.update(arr => [rep, ...arr.filter(r => r.reportId !== rep.reportId)]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to generate analytics');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  setTab(t: TabKey): void {
    this.tab.set(t);
  }

  // helpers for simple “bars”
  barWidth(pct: number): string {
    return Math.max(0, Math.min(100, pct)) + '%';
  }
  fmt(n: number | undefined | null, digits = 0): string {
    const v = typeof n === 'number' ? n : 0;
    return v.toFixed(digits);
  }
}
