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
import { TrackPagesDaemon } from './daemons/track-pages-daemon';
import { TrackUserDaemon } from './daemons/track-user-daemon';
import { RefetchMatchDaemon } from './daemons/refetch-match-daemon';
import { LayoutModule } from './layout';
import { AnalyticsModule } from './analytics';
import { PusherModule } from './pusher';

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
    DaemonsModule.forRoot({
      daemons: [
        HideSplashScreenDaemon,
        TrackPagesDaemon,
        TrackUserDaemon,
        RefetchMatchDaemon,
      ],
    }),
    LayoutModule,
    AnalyticsModule.forRoot({
      debug: !environment.production,
      google: { id: environment.GOOGLE_ANALYTICS_ID },
    }),
    PusherModule.forRoot({
      key: environment.PUSHER_KEY,
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
