import { NgModule, Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from 'app/layout';

@Component({
  selector: 'app-about-page',
  template: `
    <app-main-layout>
      <h1>About this game</h1>
      <p
        >Let's celebrate the upcoming World Cup Qatar 2022 with a friendly game
        of predictions!</p
      >
      <p
        >Born as a pet project, turned company, turned back again to pet
        project, this prediction game can be played for free with your
        friends.</p
      >

      <h2>How to play</h2>

      <p
        >Sign in during the World Cup and fill out the scores of the
        <a class="text-link" routerLink="/">upcoming matches</a>. Make your best
        guest!</p
      >
      <p
        >Matches become unavailable for prediction
        <b>five minutes prior to kick-off</b>, so make sure you enter your
        predictions in time.</p
      >
      <p
        >When the match day is over, come back and check how many
        <b>points</b> you scored. Points you obtain are accumulated throughout
        the tournament. Compare your stats against your friends and the world in
        the <a class="text-link" routerLink="/leaderboards">leaderboards.</a></p
      >

      <h2>Scoring points</h2>

      <p
        >To score points, you have to correctly predict the outcome of the
        matches. If your prediction matches the final score
        <b class="tw-text-green-600">exactly</b> you score
        <b class="tw-text-green-600">three points</b>; if your prediction didn't
        match exactly, but the final outcome of the match (winner, loser, tie)
        is the same as your prediction, you get
        <b class="tw-text-blue-600">one point</b>; otherwise, you don't get any
        points.</p
      >
      <p
        >Points awarded are the same for all group matches. However, matches in
        advanced phases of the tournament award more points:</p
      >
      <ul>
        <li><b>Group stage:</b> 3 pts exact / 1 pt correct</li>
        <li><b>Round of 16:</b> 5 pts exact / 2 pts correct</li>
        <li><b>Quater-finals:</b> 7 pts exact / 3 pts correct</li>
        <li><b>Semi-finals:</b> 9 pts exact / 4 pts correct</li>
        <li><b>Third place:</b> 10 pts exact / 5 pts correct</li>
        <li><b>Final:</b> 11 pts exact / 5 pts correct</li>
      </ul>

      <p class="tw-text-muted tw-mt-8"
        >This game was created by me,
        <a
          class="text-link"
          href="https://www.linkedin.com/in/josebolanos/"
          target="_blank"
          >José Enrique Bolaños</a
        >
        👋🏻 Feel free to contact me at
        <a class="text-link" href="mailto:qatar2022@gmail.com"
          >qatar2022@gmail.com</a
        >.</p
      >
    </app-main-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPageComponent {}

const routes: Routes = [
  {
    path: '',
    component: AboutPageComponent,
    data: {
      title: 'About Policy',
    },
  },
];

@NgModule({
  declarations: [AboutPageComponent],
  imports: [CommonModule, LayoutModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AboutModule {}