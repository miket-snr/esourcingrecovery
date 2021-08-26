import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { User } from '@app/_models';
import { RfqAPIService } from '@app/_dataservices/rfq-api.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticateService } from '@app/_dataservices/authenticate.service';
@Component({
  selector: 'app-esourcing',
  templateUrl: './esourcing.component.html',
  styleUrls: ['./esourcing.component.less']
})
export class EsourcingComponent implements OnInit {

  public user: User;
  public subscriber: Subscription;
  public chosenlist = [];

  constructor(private authservice: AuthenticateService,
              public rfqapis: RfqAPIService,
              private router: Router,
              private route: ActivatedRoute) {


  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    this.rfqapis.selectedRFQ.next(null);
    this.authservice.currentUser.subscribe(datauser => {
      if (datauser && datauser.username) {
      this.user = datauser ;
      if (datauser.username.indexOf('@') > 2) {
      this.rfqapis.getRfqList(datauser.username);
      }
    }
    });
 //   this.authservice.checksignon();
    if (this.rfqapis.RFQList.value === null && this.user &&
       this.user.username  &&  (this.user.username.indexOf('@') > 2)) {
      this.rfqapis.getRfqList(this.user.username);
    }
  }
  chooselist(item) {
    this.rfqapis.selectedRFQ.next(item);

    this.router.navigate(
        ['esourcing/rfq']
      //   ,
      //   {
      //     queryParams: {
      //         rfqno: item.RFQNO,
      //         guid: item.GUID
      //     },
      //     queryParamsHandling: 'merge'
      // }
      ) ;

  }

}

