import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  static path = () => ['dashboard'];

  constructor() {}

  ngOnInit() {}
}
