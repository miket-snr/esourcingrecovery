import { Component } from '@angular/core';
import { first } from 'rxjs/operators';

import { User } from '@app/_models';

import { Subscription } from 'rxjs';
import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';
import { AuthenticateService } from '@app/_dataservices/authenticate.service';

@Component({ templateUrl: 'home.component.html',
styleUrls: ['./homecomponent.css']})
export class HomeComponent {
  user = new User();
  public subscriber: Subscription;
  public chosenlist = [];

  constructor(private authservice: AuthenticateService) {

  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    this.authservice.currentUser.subscribe({
      next: userx => {
        if (userx) {
          this.user = {...userx};
        } else {
          this.user.username = 'Guest';
        }
      },
      error: err => console.error('something wrong occurred: ' + err),
      complete: () => console.log('done')
    });
   // this.authservice.checksignon();
  }
  chooselist() {
alert(this.user.username);
  }
}
