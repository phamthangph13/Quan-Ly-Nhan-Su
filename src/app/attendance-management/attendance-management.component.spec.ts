import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceManagementComponent } from './attendance-management.component';

describe('AttendanceManagementComponent', () => {
  let component: AttendanceManagementComponent;
  let fixture: ComponentFixture<AttendanceManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
