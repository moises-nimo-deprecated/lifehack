import {Component, IterableDiffers, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from './../environments/environment';
import {Goal} from './models/goal';
import {PersonGoals} from './models/person.goals';
import {ToasterService} from './services/toaster.service';
import {Person} from './models/person';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  personGoals: PersonGoals = {
    person: {
      name: '',
      goals: []
    },
    availableGoals: []
  };

  constructor(private http: HttpClient, private toaster: ToasterService) {
  }

  addObserver(item: Goal): void {
    item.canExpand = () => {
      if (!this.personGoals.person.name) {
        this.toaster.show('error', 'Please write your name');
        return false;
      }
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.personGoals.person.goals.length; i++) {
        if (item.id === this.personGoals.person.goals[i].id) {
          this.toaster.show('error', 'You already took this path.');
          return false;
        }
        if (item.sequence === this.personGoals.person.goals[i].sequence) {
          this.toaster.show('error', 'You already took another path.');
          return false;
        }
      }
      this.personGoals.person.goals.push(item);
      console.log(this.personGoals.person);
      this.http.post(`${environment.apiEndpoint}/person`, this.personGoals.person)
        .subscribe((data: Person) => {
          this.toaster.show('success', 'Path updated successfully.');
        });
      return true;
    };

    if (item.goals) {
      item.goals.forEach((sub) => {
        this.addObserver(sub);
      });
    }
  }

  ngOnInit(): void {
    this.http.get<Goal>(`${environment.apiEndpoint}/goals`)
      .subscribe((data: Goal) => {
        this.personGoals.availableGoals = [data];
        this.personGoals.availableGoals.forEach((item) => {
          this.addObserver(item);
        });
      });
  }
}
