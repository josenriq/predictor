import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ApolloModule } from 'apollo-angular';
import { ApolloProvider } from 'app/graphql';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, ApolloModule],
  providers: [ApolloProvider],
  bootstrap: [AppComponent],
})
export class AppModule {}
