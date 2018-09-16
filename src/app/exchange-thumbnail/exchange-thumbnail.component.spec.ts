import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeThumbnailComponent } from './exchange-thumbnail.component';

describe('ExchangeThumbnailComponent', () => {
  let component: ExchangeThumbnailComponent;
  let fixture: ComponentFixture<ExchangeThumbnailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeThumbnailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
