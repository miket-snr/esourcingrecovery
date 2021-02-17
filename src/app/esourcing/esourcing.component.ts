import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { User } from '@app/_models';
import { AuthService } from '../auth/auth.service';
import { RfqAPIService } from '@app/_dataservices/rfq-api.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-esourcing',
  templateUrl: './esourcing.component.html',
  styleUrls: ['./esourcing.component.less']
})
export class EsourcingComponent implements OnInit {

  public user: User;
  public subscriber: Subscription;
  public chosenlist = [];
 // public orchlist = { show: 'baselist' };
  constructor(private authservice: AuthService, public rfqapis: RfqAPIService, private router: Router, private route: ActivatedRoute) {

 //   this.orchlist = this.rfqapis.orchlist;
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    this.authservice.currentUser.subscribe(datauser => {
      this.user = datauser ;
      this.rfqapis.getRfqList(datauser.email);
    });
    this.authservice.checksignon();
  }
  chooselist(item) {
    this.rfqapis.currentRFQDoc.next(item);

    this.router.navigate(
        ['esourcing/rfq'],
        {
          queryParams: {
              rfqno: item.RFQNO,
              guid: item.GUID
          },
          queryParamsHandling: 'merge'
      }) ;

  }

}

