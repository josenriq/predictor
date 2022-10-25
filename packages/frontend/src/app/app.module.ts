import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ApolloModule } from 'apollo-angular';
import { GraphQLModule } from 'app/graphql';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SessionModule } from './session';
import { environment } from 'environments';
import { SplashScreenModule } from './splash-screen';
import { DaemonsModule } from './daemons';
import { HideSplashScreenDaemon } from './daemons/hide-splash-screen-daemon';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ApolloModule,
    GraphQLModule.forRoot({
      apiBaseUri: environment.API_BASE_URI,
    }),
    SessionModule.forRoot({
      apiBaseUri: environment.API_BASE_URI,
    }),
    SplashScreenModule.forRoot(),
    DaemonsModule.forRoot({ daemons: [HideSplashScreenDaemon] }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
