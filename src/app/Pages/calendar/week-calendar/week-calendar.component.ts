import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CalendarService } from '../calendar.service';
import { MatDialog } from '@angular/material/dialog';
import { SlotPopoverComponent } from '../slots-popover/slot-popover.component';
import moment from 'moment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FooterNavComponent } from "../../footer-nav/footer-nav.component";
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-week-calendar',
  templateUrl: './week-calendar.component.html',
  styleUrls: ['./week-calendar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    FooterNavComponent,
    MatToolbarModule
]
})
export class WeekCalendarComponent implements OnInit {
  private router = inject(Router);
  categories: any[] = [];
  selectedCategories: number[] = [];
  preferredCategories: number[] = [];
  slots: any = {}; 
  weekDates: string[] = [];
  timeSlots: string[] = [];
  currentWeekStart!: moment.Moment;
  isAdmin = localStorage.getItem('isAdmin') =='true';
  username = localStorage.getItem('username');

  constructor(
    private calendarService: CalendarService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.generateTimeSlots();
    this.setWeek(moment());
    this.loadCategories();
  }

  generateTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = 9; hour < 18; hour++) {
      this.timeSlots.push(moment({ hour }).format('HH:mm')); 
    }
  }

  setWeek(start: moment.Moment): void {
    this.currentWeekStart = start.clone().startOf('isoWeek');
    this.weekDates = Array.from({ length: 5 }, (_, i) =>
      this.currentWeekStart.clone().add(i, 'days').format('YYYY-MM-DD')
    );
    this.loadSlots();
  }

  prevWeek(): void {
    this.setWeek(this.currentWeekStart.clone().subtract(1, 'week'));
  }

  nextWeek(): void {
    this.setWeek(this.currentWeekStart.clone().add(1, 'week'));
  }

  loadCategories(): void {
    this.calendarService.getActiveCategories().subscribe(categories => {
      this.categories = categories;
      this.calendarService.getUserPreferences().subscribe(prefs => {
        this.preferredCategories = prefs.map((p: any) => p.category);
        this.selectedCategories = [...this.preferredCategories];
        this.loadSlots();
      });
    });
  }

  getEndTimeOptions(from: moment.MomentInput): string[] {
      const startTime = moment(from, 'HH:mm');
      const times: string[] = [];
      let count = 0
      for (let hour = startTime.hour() + 1; hour <= 18; hour++, count++) {
        times.push(moment({ hour }).format('HH:mm'));
        if (count == 2) break
      }
      return times;
    }

 loadSlots(): void {
  if (!this.selectedCategories.length) return;

  const from = this.weekDates[0];
  const to = this.weekDates[4];
  const data = {from: from, to : to, categories: this.selectedCategories} 
  this.calendarService.getWeeklySlots(data).subscribe(data => {
    this.slots = {};

    Object.entries(data).forEach(([date, times]: any) => {
      Object.entries(times).forEach(([time, categories]: any) => {
        Object.entries(categories).forEach(([catIdStr, slot]: any) => {
          const catId = Number(catIdStr);
          const start = moment(slot.start_time, 'HH:mm:ss');
          const end = moment(slot.end_time, 'HH:mm:ss');

          for (
            let t = start.clone();
            t.isBefore(end);
            t.add(1, 'hour')
          ) {
            const tStr = t.format('HH:mm'); 
            if (!this.slots[date]) this.slots[date] = {};
            if (!this.slots[date][tStr]) this.slots[date][tStr] = {};
            this.slots[date][tStr][catId] = slot;
          }
        });
      });
    });

    });
  }

  getSlot(date: string, time: string, categoryId: number): any {
    return this.slots?.[date]?.[time]?.[categoryId];
  }

  getDayName(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' }); 
  }

  getSlotColspan(date: string, time: string, categoryId: number): number {
    const slot = this.getSlot(date, time, categoryId);
    if (!slot) return 1;

    const start = moment(slot.start_time, 'HH:mm:ss');
    const end = moment(slot.end_time, 'HH:mm:ss');
    const duration = moment.duration(end.diff(start)).asHours();
    return duration;
  }
  getCategoryName(catId: number): string {
    return this.categories.find(c => c.id === catId)?.name || 'Unknown';
  }

  shouldSkip(date: string, time: string, categoryId: number): boolean {
    const slot = this.getSlot(date, time, categoryId);
    if (!slot) return false;

    const current = moment(time, 'HH:mm');
    const start = moment(slot.start_time, 'HH:mm:ss');

    return !current.isSame(start);
  }

  openSlotPopover(slot: any, date: string, time: string, categoryId: number): void {
    
    const now = new Date();
    const [hour, minute] = time.split(':').map(Number); 
    const slotTime = moment(date + ' ' + time, 'YYYY-MM-DD HH:mm');

    if (slotTime.isBefore(now) && moment(date).isSame(moment(), 'day')){
      alert("You can't update past events.");
      return;
    }
    if (this.isAdmin) {
      if (!slot?.booked_by) {
        this.dialog.open(SlotPopoverComponent, {
          width: '400px',
          data: {
            slot,
            date,
            time,
            categoryId,
            isAdmin: this.isAdmin
          }
        }).afterClosed().subscribe(result => {
          if (result === 'refresh') this.loadSlots();
        });
      }
      return;
    }

    if (!slot?.booked_by) {
      if(this.isAdmin){
      this.dialog.open(SlotPopoverComponent, {
        width: '400px',
        data: {
          slot: null,
          date,
          time,
          categoryId,
          isAdmin: false,
          actionType: 'subscribe'
        }
      }).afterClosed().subscribe(result => {
        if (result === 'refresh') this.loadSlots();
      });}
      else{
        if(slot){
          this.dialog.open(SlotPopoverComponent, {
          width: '400px',
          data: {
            slot,
            date,
            time,
            categoryId,
            isAdmin: false,
            actionType: 'subscribe'
          }
          }).afterClosed().subscribe(result => {
            if (result === 'refresh') this.loadSlots();
          });
        }
      }
    } else if (this.isMine(slot)) {
      this.dialog.open(SlotPopoverComponent, {
        width: '400px',
        data: {
          slot,
          date,
          time,
          categoryId,
          isAdmin: false,
          actionType: 'unsubscribe'
        }
      }).afterClosed().subscribe(result => {
        if (result === 'refresh') this.loadSlots();
      });
    }
  }

  onCategoryChange(): void {
    this.loadSlots();
  }

  addNewSlot(): void {
    const dialogRef = this.dialog.open(SlotPopoverComponent, {
      width: '400px',
      data: {
        isNew: true,
        isAdmin: this.isAdmin
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') this.loadSlots();
    });
  }

  isPast(date: string): boolean {
    return moment(date).isBefore(moment(), 'day');
  }

  isMine(slot: any): boolean {
    return slot?.booked_by === this.username;
  }

  getSlotClass(slot: any, date: string): string {
    if (!slot) return '';
    if (this.isPast(date)) return 'slot-cell past';
    if (slot.booked_by) return this.isMine(slot) ? 'slot-cell mine' : 'slot-cell booked';
    return 'slot-cell';
  }
  logout(){
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
