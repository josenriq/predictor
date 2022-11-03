import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIModule } from 'app/ui';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Party } from 'app/graphql';
import { CreatePartyMutation } from './create-party.mutation';

@Component({
  selector: 'app-create-leaderboard-form',
  template: `
    <p class="tw-text-muted tw-py-2 tw-text-center"
      >Create your own leaderboard and play with your friends!</p
    >
    <app-card>
      <app-card-section>
        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          class="tw-flex tw-flex-col tw-gap-y-4"
        >
          <!-- Form group -->
          <div class="tw-flex tw-flex-col tw-gap-y-2">
            <!-- input label -->
            <div class="tw-px-1">How do you want to call your leaderboard?</div>
            <!-- input -->
            <input
              type="text"
              formControlName="name"
              maxlength="20"
              placeholder="Coworkers, Inc."
              autofocus
              class="tw-block tw-w-full tw-px-4 tw-py-3 tw-text-xl tw-border-2 tw-rounded tw-font-semibold"
            />
          </div>
          <div class="tw-flex tw-flex-row tw-gap-x-2 tw-justify-end">
            <a routerLink="../" app-button>Nevermind</a>
            <button
              type="submit"
              app-button
              variant="primary"
              [disabled]="form.invalid"
              >Create Leaderboard</button
            >
          </div>
        </form>
      </app-card-section>
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateLeaderboardFormComponent {
  form = this.builder.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/[\S]/),
      ],
    ],
  });

  @Input() busy = false;
  @Output() submit = new EventEmitter<Pick<Party, 'name'>>();

  constructor(private readonly builder: FormBuilder) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    if (!this.form.value.name) return;

    this.submit.emit({ name: this.form.value.name });
  }
}

@Component({
  selector: 'app-create-leaderboard-page',
  template: `
    <app-create-leaderboard-form
      [busy]="busy"
      (submit)="onSubmit($event)"
    ></app-create-leaderboard-form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateLeaderboardPageComponent {
  busy = false;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly createParty: CreatePartyMutation,
  ) {}

  async onSubmit({ name }: Pick<Party, 'name'>): Promise<void> {
    this.busy = true;
    try {
      const result = await this.createParty.mutate({ input: { name } });

      this.router.navigate(['../', result?.createParty.party.id], {
        relativeTo: this.route,
      });
    } catch (error) {
      console.error(error);
    } finally {
      this.busy = false;
    }
  }
}

const DIRECTIVES = [CreateLeaderboardPageComponent];

@NgModule({
  imports: [CommonModule, UIModule, RouterModule, ReactiveFormsModule],
  declarations: [...DIRECTIVES, CreateLeaderboardFormComponent],
  exports: DIRECTIVES,
})
export class CreateLeaderboardPageModule {}
