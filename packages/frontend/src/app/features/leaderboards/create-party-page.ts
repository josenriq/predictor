import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIModule } from 'app/ui';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Party } from 'app/graphql';
import { CreatePartyMutation } from './create-party.mutation';
import { Session } from 'app/session';

@Component({
  selector: 'app-create-party-form',
  template: `
    <p class="tw-text-muted tw-py-2 tw-text-center"
      >Create a private party to compete against your friends
    </p>
    <app-card>
      <app-card-section>
        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          class="tw-flex tw-flex-col tw-gap-y-4"
        >
          <!-- TODO: Refactor the following into form.ts -->
          <!-- Form group -->
          <div class="tw-flex tw-flex-col tw-gap-y-2">
            <!-- input label -->
            <div class="tw-px-1">Party Name</div>
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
          <!-- Button toolbar -->
          <div class="tw-flex tw-flex-row tw-gap-x-2 tw-justify-end">
            <a routerLink="../" app-button>Cancel</a>
            <button
              type="submit"
              app-button
              variant="primary"
              [disabled]="busy || form.invalid"
              >Create Party</button
            >
          </div>
        </form>
      </app-card-section>
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePartyFormComponent {
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
  @Output() create = new EventEmitter<Pick<Party, 'name'>>();

  constructor(private readonly builder: FormBuilder) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    if (!this.form.value.name) return;

    this.create.emit({ name: this.form.value.name });
  }
}

@Component({
  selector: 'app-create-party-page',
  template: `
    <app-create-party-form
      [busy]="busy"
      (create)="createParty($event)"
    ></app-create-party-form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePartyPageComponent implements OnInit {
  busy = false;

  constructor(
    private readonly session: Session,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly createPartyMutation: CreatePartyMutation,
  ) {}

  async ngOnInit(): Promise<void> {
    if (!(await this.session.isAuthenticated())) {
      this.session.login();
      return;
    }
  }

  async createParty({ name }: Pick<Party, 'name'>): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try {
      const result = await this.createPartyMutation.mutate({ input: { name } });

      this.router.navigate(['../', result?.createParty.party.id], {
        relativeTo: this.route,
      });
    } catch (error: any) {
      console.warn(error);
      alert('Something went wrong. Please try again.');
    } finally {
      this.busy = false;
    }
  }
}

const DIRECTIVES = [CreatePartyPageComponent];

@NgModule({
  imports: [CommonModule, UIModule, RouterModule, ReactiveFormsModule],
  declarations: [...DIRECTIVES, CreatePartyFormComponent],
  exports: DIRECTIVES,
})
export class CreatePartyPageModule {}
