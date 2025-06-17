import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CalendarService } from '../calendar.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import moment from 'moment';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-slot-popover',
  templateUrl: './slot-popover.component.html',
  styleUrls: ['./slot-popover.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule
  ]
})
export class SlotPopoverComponent implements OnInit {
  slotForm: FormGroup;
  categories: any[] = [];
  isEditing = false;
  isBooking = false;

  constructor(
    public dialogRef: MatDialogRef<SlotPopoverComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private calendarService: CalendarService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.slotForm = this.fb.group({
      category: [data.categoryId || '', Validators.required],
      date: [data.date || '', Validators.required],
      start_time: [data.time || '', Validators.required],
      end_time: ['', Validators.required]
    });
    this.isEditing = !!data.slot && data.isAdmin;
    this.isBooking = !!data.slot && !data.isAdmin;

    if (this.isEditing) {
      this.slotForm.patchValue({
        category: data.slot.category,
        date: data.slot.date,
        start_time: this.formatTime(data.slot.start_time),
        end_time: this.formatTime(data.slot.end_time)
      });
    }

    this.calendarService.getActiveCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: (err) => {
        const errorMsg = err?.error?.error || 'Failed to fetch categories';
        this.snackBar.open(errorMsg, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  formatTime(time: string): string {
    return time ? time.slice(0, 5) : '';
  }

  ngOnInit(): void {
    this.slotForm.get('start_time')?.valueChanges.subscribe(() => {
      const endOptions = this.getEndTimeOptions();
      if (!endOptions.includes(this.slotForm.value.end_time)) {
        this.slotForm.patchValue({ end_time: '' });
      }
    });
  }

  getStartTimeOptions(): string[] {
    const times: string[] = [];
    for (let hour = 9; hour < 18; hour++) {
      times.push(moment({ hour }).format('HH:mm'));
    }
    return times;
  }

  getEndTimeOptions(): string[] {
    const startTime = moment(this.slotForm.value.start_time, 'HH:mm');
    const times: string[] = [];
    let count = 0
    for (let hour = startTime.hour() + 1; hour <= 18; hour++, count++) {
      times.push(moment({ hour }).format('HH:mm'));
      if (count == 2) break
    }
    return times;
  }

  saveSlot(): void {
    if (this.slotForm.invalid) return;
    const payload = this.slotForm.value;

    const handleSuccess = (res: any) => {
      this.snackBar.open(res.message || 'Operation successful!', 'Close', { duration: 3000 });
      this.dialogRef.close('refresh');
    };

    const handleError = (err: any) => {
      const errorMsg = err?.error?.error || 'Something went wrong.';
      this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
    };

    if (this.isEditing) {
      this.calendarService.updateSlot(this.data.slot.id, payload).subscribe({
        next: handleSuccess,
        error: handleError
      });
    } else {
      this.calendarService.createSlot(payload).subscribe({
        next: handleSuccess,
        error: handleError
      });
    }
  }

  deleteSlot(): void {
    this.calendarService.deleteSlot(this.data.slot.id).subscribe({
      next: (res: any) => {
        this.snackBar.open(res.message || 'Slot deleted successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close('refresh');
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.error || 'Failed to delete slot.', 'Close', { duration: 3000 });
      }
    });
  }

  bookSlot(): void {
    this.calendarService.bookSlot(this.data.slot.id).subscribe({
      next: (res: any) => {
        this.snackBar.open(res.message || 'Slot booked successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close('refresh');
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.error || 'Failed to book slot.', 'Close', { duration: 3000 });
      }
    });
  }

  unbookSlot(): void {
    this.calendarService.unbookSlot(this.data.slot.id).subscribe({
      next: (res: any) => {
        this.snackBar.open(res.message || 'Slot unbooked successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close('refresh');
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.error || 'Failed to unbook slot.', 'Close', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
