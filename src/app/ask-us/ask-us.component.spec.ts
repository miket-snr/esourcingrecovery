import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AskUsComponent } from './ask-us.component';

describe('AskUsComponent', () => {
  let component: AskUsComponent;
  let fixture: ComponentFixture<AskUsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AskUsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AskUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
