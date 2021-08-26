﻿import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';
import { AuthenticateService } from './_dataservices/authenticate.service';
import { RfqAPIService } from './_dataservices/rfq-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  usersubscription: Subscription;
  username: string;
  msg = '';
  docsoutstanding = '';

  constructor(  private authService: AuthenticateService, private router: Router, private rfqserv: RfqAPIService) {
     this.usersubscription = this.authService.currentUser.subscribe({
      next: x => {
        if (x) {
          this.username = x.username;
        } else {
          this.username = 'Guest';
        }
      },
      error: err => console.error('something wrong occurred: ' + err),
      complete: () => console.log('done')
    });
     this.rfqserv.docsoutstanding.subscribe((doc) => {
       this.docsoutstanding = doc ;
    });
     this.authService.message.subscribe(msg => {
       this.msg = msg;
    });
  }

  ngOnInit() {}
  ngOnDestroy() {
    this.usersubscription.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
    this.rfqserv.RFQList.next(null);
    this.router.navigate(['/auth/login']);
  }
  onLogin() {
    this.router.navigate(
      ['login']);
  }

  isAuthenticated() {
    const validity =  this.authService.isAuthenticated();
    return  validity < 0  ? false : true ;

  }
}
