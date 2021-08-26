import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-notice',
  template: `
    <div [ngClass]="{'blinking': blinking == 'X' }">
    <ng-content></ng-content>
</div>
  `,
  styles: ['.blinking{ font-weight: bold; animation:blinkingText 1.2s infinite;}',
           // tslint:disable-next-line:max-line-length
           `@keyframes blinkingText{ 0%{ color: #000;} 49%{ color: #000; }
            60%{ color: transparent; }  99%{color:transparent; } 100%{color: #000; }}`
           ]
})
export class NoticeComponent implements OnInit {
@Input() blinking = '';
  constructor() { }

  ngOnInit() {
  }

}
