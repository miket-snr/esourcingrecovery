import { Component } from '@angular/core';
import { first } from 'rxjs/operators';

import { User } from '@app/_models';
import { AuthService } from '../auth/auth.service';
import { RfqAPIService } from '@app/_dataservices/rfq-api.service';
import { Subscription } from 'rxjs';
import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
  public user: User;
  public subscriber: Subscription;
  public chosenlist = [];
  public orchlist = { show: 'baselist' };
  constructor(private authservice: AuthService, public rfqapis: RfqAPIService) {
    this.rfqapis.getRfqList(this.rfqapis.currentUser.username);
    this.orchlist = this.rfqapis.orchlist;
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    // If rfqtoken ne 1234567 - check for validity - return username, rfqdetail else go to login
    // else if user ne 'tempuser'
    // check for listLazyRoutes
    // else  go to login
    this.user = this.authservice.currentUserValue;
    this.authservice.checksignon();
  }
  chooselist(item) {
    this.rfqapis.getRfqItems(item.RFQNO);
    this.rfqapis.currentRFQDoc.next(item);
    this.rfqapis.orchlist.show = 'header';
  }
}
