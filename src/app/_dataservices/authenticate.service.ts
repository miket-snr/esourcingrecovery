import { Router, ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { User } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AuthenticateService {
  public token = '123456';
  public rfqtoken: string;
  private subject = new Subject<any>();
  public message = this.subject.asObservable();
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {
    const cu = localStorage.getItem('currentUser') || '';
    if (cu.length > 15) {
      this.currentUserSubject = new BehaviorSubject<User>(
        { ...environment.tempuser, ...JSON.parse(localStorage.getItem('currentUser')) }
      );
    } else {
      this.currentUserSubject = new BehaviorSubject<User>(
        { ...environment.tempuser });
    }
    this.currentUser = this.currentUserSubject.asObservable();
    this.rfqtoken = this.findGetParameter('ref');
    if (this.rfqtoken !== '') {
      this.checksignon(this.rfqtoken).subscribe(databack => {
        (databack !== 'Ok') ? this.sendMessage('Invalid link - Login please', true) :
          this.router.navigate(['esourcing']);
      });
    } else {
      this.rfqtoken = localStorage.getItem('rfqtoken') || '1234567';
      this.token = localStorage.getItem('BFMtoken') || '';

    }
  }


  findGetParameter(parameterName: string) {
    let result = '';
    let tmp = [];
    location.search
      .substr(1)
      .split('&')
      .forEach((item) => {
        tmp = item.split('=');
        if (tmp[0] === parameterName) {
          result = decodeURIComponent(tmp[1]);
        }
      });
    return result;
  }
  sendMessage(message: string, login = false) {
    this.subject.next(message);
    setTimeout(() => {
      this.subject.next('');
      if (login) {
        this.router.navigate(
          ['login']);
      }
    }, 1500);
  }

  clearMessage() {
    this.subject.next('');
  }
  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  checksignon(linktoken = '') {
    const lcluser = new User();
    const rfqtoken = (linktoken === '') ? this.rfqtoken : linktoken;
    const context = '{TOKEN:' + this.token
      // + ',USER:' + this.currentUserSubject.value.username || 'UNKNOWN'
      + ',RFQTOKEN:' + rfqtoken
      + '}';
    const params = new HttpParams()
      .set('Partner', 'ALL')
      .set('Class', 'RFQU')
      .set('CallContext', context);
    return this.http
      .get<any>(environment.BASE_API + '/api/SAP/RFQ/VALIDURL', { params })
      .pipe(map(data => {
        if (data.ServicesList instanceof Array && (data.ServicesList[0] && data.ServicesList[0].JsonsetJstext)) {
          const tempObj = JSON.parse(data.ServicesList[0].JsonsetJstext);
          if (!tempObj.MESSAGE) {
            lcluser.firstName = tempObj.FIRSTNAME;
            lcluser.lastName = tempObj.LASTNAME;
            lcluser.sundry = tempObj.USERDETAL;
            lcluser.username = tempObj.EMAIL.toLowerCase();
            lcluser.cellno = tempObj.CELLNO;
            this.rfqtoken = tempObj.RFQTOKEN;
            this.token = tempObj.TOKEN;
            localStorage.setItem('currentUser', JSON.stringify(lcluser));
            localStorage.setItem('BFMtoken', this.token);
            localStorage.setItem('rfqtoken', this.rfqtoken);
            this.currentUserSubject.next(lcluser);
            return 'Ok';
          } else {
            return 'Invalid link - Login please';
          }

        }
      }));
  }

  signinUser(email: string, password: string) {
    const lclUser = new User();
    this.currentUserSubject.next(lclUser);
    this.token = '';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        username: email,
        password,
        Authorization: 'Bearer 123456',
        apikey: 'GENAPP'
      })
    };
    this.http
      .post<any>(
        environment.BASE_API + '/api/login?ClientID=All',
        {
          grant_type: 'password',
          username: email,
          password
        },
        httpOptions
      )
      .pipe(
        map(user => {
          // login successful if there's a jwt token in the response
          if (user && user.TOKEN) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('BFMtoken', user.TOKEN);
            this.token = user.TOKEN;
            return user;
          }
          if (user.ERROR) {
            this.sendMessage('Logon failed');
            setTimeout(() => this.clearMessage(), 2000);
            return user.ERROR;
          }
        })
      )
      .subscribe(data => {
        if (data.TOKEN) {
          this.getUserDetails();
        }
      });
  }
  /* ************************************************************* */
  getUserDetails() {
    const lcluser = new User();
    const context = '{TOKEN:' + this.token + '}';
    const params = new HttpParams()
      .set('Partner', 'ALL')
      .set('Class', 'USER')
      .set('CallContext', context);
    this.http
      .get<any>(environment.BASE_API + '/api/GETFLEX', { params })
      .subscribe(data => {
        if (data.ServicesList instanceof Array) {
          const tempObj = JSON.parse(data.ServicesList[0].JsonsetJstext);
          lcluser.firstName = tempObj.NAME_FIRST;
          lcluser.lastName = tempObj.NAME_LAST;
          lcluser.sundry = tempObj.OBJ + ' - ' + tempObj.DATA;
          lcluser.username = tempObj.EMAIL.toLowerCase();
          lcluser.cellno = tempObj.CELLNO;
          this.currentUserSubject.next(lcluser);
          localStorage.setItem('currentUser', JSON.stringify(lcluser));
          this.router.navigate(['/']);
        }
      });
  }
  /* ************************************************************* */
  requestOTP(email: string, typeofcom: string, cellno: string) {
    const luser = {
      EMAIL: email,
      CHANNEL: typeofcom,
      CELLNO: cellno
    };
    if (!this.token || this.token.length < 6) {
      this.token = '123456';
    }
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Authorization', 'Bearer 123456')
      .set('apikey', 'GENAPP')
      .set('runon', 'DEV');
    const params = new HttpParams()
      .set('Partner', 'ALL')
      .set('Class', 'PWDR')
      .set('CallContext', JSON.stringify(luser));
    return this.http.get<any>(environment.BASE_API + '/api/SAP/RFQ/SENDOTP', {
      params
    });
  }
  /* ************************************************************* */
  confirmOTP(email: string, otp: string, temptoken: string) {
    const lcluser = new User();
    this.token = '123456';
    localStorage.setItem('token', '123456');
    const luser = {
      EMAIL: email,
      OTP: otp,
      TOKEN: temptoken
    };
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Authorization', 'Bearer 123456')
      .set('apikey', 'GENAPP')
      .set('runon', 'DEV');
    const params = new HttpParams()
      .set('Partner', 'ALL')
      .set('Class', 'OTPC')
      .set('CallContext', JSON.stringify(luser));
    return this.http
      .get<any>(environment.BASE_API + '/api/SAP/RFQ/VALIDOTP', {
        params, headers
      })
      .pipe(
        map(data => {
          if (data.ServicesList instanceof Array &&
            data.ServicesList[0] && data.ServicesList[0].JsonsetJstext) {
            const tempObj = JSON.parse(data.ServicesList[0].JsonsetJstext);
            if (!tempObj.MESSAGE) {
              lcluser.firstName = tempObj.FIRSTNAME;
              lcluser.lastName = tempObj.LASTNAME;
              lcluser.sundry = tempObj.USERDETAL;
              lcluser.username = tempObj.EMAIL.toLowerCase();
              lcluser.cellno = tempObj.CELLNO;
              this.rfqtoken = tempObj.RFQTOKEN;
              this.token = tempObj.TOKEN;
              localStorage.setItem('currentUser', JSON.stringify(lcluser));
              localStorage.setItem('BFMtoken', this.token);
              localStorage.setItem('rfqtoken', this.rfqtoken);
              this.currentUserSubject.next(lcluser);
              return 'ok';
            } else {
              return ' Error';
            }
          }
        }));
  }

  /* ************************************************************* */
  updatePassword(email: string, password: string, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        token,
        password,
        Authorization: 'Bearer 123456',
        apikey: 'GENAPP'
      })
    };
    this.http
      .post<any>(
        environment.BASE_API + '/api/Updatepwd',
        {
          grant_type: 'password',
          username: email,
          password
        },
        httpOptions
      )
      .pipe(
        map(user => {
          // login successful if there's a jwt token in the response

          return user.TOKEN;
        })
      )
      .subscribe(newtoken => {
        if (newtoken) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('BFMtoken', JSON.stringify(newtoken));
          this.token = newtoken;
          this.getUserDetails();
        }
      });
  }
  /* ************************************************************* */
  signupUser(
    email: string,
    password: string,
    Userdetail: string,
    firstname: string,
    lastname: string,
    cellno: string
  ) {
    this.token = '123456';
    localStorage.setItem('token', '123456');
    const lcluser = new User();
    let tempObj = '';
    const context =
      '{USERDETAIL:' +
      Userdetail +
      ',EMAIL:' +
      email +
      ',PASSWORD:' +
      password +
      ',FIRSTNAME:' +
      firstname +
      ',LASTNAME:' +
      lastname +
      ',CELLNO:' +
      cellno +
      '}';
    const params = new HttpParams()
      .set('Partner', 'ALL')
      .set('Class', 'PWDN')
      .set('CallContext', context);
    this.http
      .get<any>(environment.BASE_API + '/api/GETFLEX', { params })
      .subscribe(data => {
        if (data.ServicesList instanceof Array) {
          if (data.ServicesList[0].JsonsetName === 'ERROR') {
            tempObj =
              'Error:' + JSON.stringify(data.ServicesList[0].JsonsetJstext);
          } else {
            tempObj =
              'Success:' + JSON.stringify(data.ServicesList[0].JsonsetJstext);
          }
          this.subject.next(tempObj);
        }
      });
    //  this.router.navigate(['/']);
  }
  /* ************************************************************* */
  logout() {
    /* Reset Variables*/
    this.token = '';
    localStorage.setItem('BFMtoken', '');
    localStorage.setItem('currentUser', '');
    this.currentUserSubject.next({ ...environment.tempuser });
    return 'Logged out';
  }
  /* ************************************************************* */
  getToken() {
    /*  firebase.auth().currentUser.getIdToken()
      .then(
        (token: string) => this.token = token
      );*/
    return this.token;
  }
  /* ************************************************************* */
  isAuthenticated() {
    const lclok = (this.currentUserSubject && this.currentUserSubject.value && this.currentUserSubject.value.username) ?
      this.currentUserSubject.value.username.indexOf('@') : false;
    return (this.token !== null && lclok);
  }
}
