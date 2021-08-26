import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RfqAPIService } from '@app/_dataservices/rfq-api.service';

@Component({
  selector: 'app-rfq',
  templateUrl: './rfq.component.html',
  styleUrls: ['./rfq.component.less']
})
export class RfqComponent implements OnInit {

  constructor( private router: Router, private route: ActivatedRoute, private rfqapis: RfqAPIService) { }

  ngOnInit() {
    // Read Url
    // tslint:disable-next-line:no-string-literal
    // const RFQNO = this.route.snapshot.queryParams['rfqno'] ;
    // // tslint:disable-next-line:no-string-literal
    // const GUID = this.route.snapshot.queryParams['guid'] ;
    // if (!RFQNO || !GUID) {
    //   this.router.navigate(
    //     ['esourcing']) ;
    // }
    // //Get Item
    // // Open rfq-Header when loaded
    // this.rfqapis.getRfq(RFQNO, GUID);
    this.rfqapis.currentTender.subscribe( data  => {
      if (data) {  this.router.navigate(
          ['esourcing/rfqheader']) ;
        } } ) ;


  }

}
