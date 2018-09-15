import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Title} from '@angular/platform-browser';
import { MyExchangesComponent } from './my-exchanges.component';

describe('MyExchangesComponent', () => {
  let component: MyExchangesComponent;
  let fixture: ComponentFixture<MyExchangesComponent>;
  let userService: Title;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyExchangesComponent ],
      providers: [{ provide: Title, useClass: Title }],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyExchangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create instance', () => {
    expect(component).toBeTruthy();
  });
  
  it('Page title Should be "My Exchanges"', () => {
    userService = TestBed.get(Title);
    expect(userService.getTitle()).toBe("My Exchanges");
});
});
