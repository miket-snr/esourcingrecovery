import { Injectable } from '@angular/core';
import { APIReply, Bid, RfcObj, RfqControl, RFQDocs, RFQHeader, Tender } from '@app/_models';
import { BehaviorSubject } from 'rxjs';
import { RfqAPIService } from './rfq-api.service';

@Injectable({
  providedIn: 'root'
})
export class RfqdataService {
  public currentRFQList = new BehaviorSubject<RFQHeader[]>(null);
  public currentTender = new BehaviorSubject<Tender>(null);
  private tenderHeader: RfcObj;
  private tenderLine: RfcObj;
  public tender: Tender ;
  public bid: Bid ;

  constructor(private apiserv: RfqAPIService) {
   this.apiserv.tenderHeader.subscribe( data => {
     this.tenderHeader = data;

   });
   this.apiserv.tenderLine.subscribe( data => {
     this.tenderLine = data ;

   });
   }

//this.currentRFQItems.next( JSON.parse(this.tenderLine.KEYS)) ;
/*          this.responseControl.next( JSON.parse(this.tenderLine.KEYS)) ;
          this.responseItems.next( JSON.parse(this.tenderLine.KEYS)) ;
          */
  }
