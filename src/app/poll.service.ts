import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Session } from './session';
import { MemberVote } from './card';
import { Observable } from 'rxjs';

export class PollResponse {
  name: string;
  timestamp: number;

  topic: string;
  description: string;
  url: string;

  flipped: boolean;
  consensus: boolean;

  votes: MemberVote[];
}

@Injectable({
  providedIn: 'root'
})
export class PollService {

  constructor(private http: HttpClient) { }

  currentPoll(session: Session) : Observable<PollResponse> {
    return this.http.get<PollResponse>('/api/poll/current/' + session.id);
  }
}
