import { Component, OnInit } from '@angular/core';
import { RfqAPIService } from '@app/_dataservices/rfq-api.service';
import { ModalService } from '@app/_modal';

@Component({
  selector: 'app-ask-us',
  templateUrl: './ask-us.component.html',
  styleUrls: ['./ask-us.component.less']
})
export class AskUsComponent implements OnInit {
  today = new Date();
  comments = [];
  response = '';
  constructor(public modalService: ModalService, private apiService: RfqAPIService) { }

  ngOnInit() {
    this.apiService.rfqcommentsOB.subscribe(data => {
      data.forEach(element => {
        element.COMMENT_TEXT = element.COMMENT_TEXT.replaceAll('\\n', '<br >');
        element.COMMENT_TEXT = element.COMMENT_TEXT.replaceAll('\\', '');
        this.comments.push(element);
      });
    });
  }

  onSend() {
    const resptxt = {text: this.response} ;
    this.apiService.postResponse(JSON.stringify(resptxt)).subscribe( data => {
    console.log(data);
    });
  }
}
