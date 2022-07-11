import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroupDirective,
  FormGroup,
  NgForm,
  Validators,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const password = control.parent?.get('password')?.value;
    const confirmation = control.parent?.get('passwordConfirmation')?.value;
    const match = password !== confirmation;

    return (
      (control && control.dirty && match) ||
      (control && control.touched && control.invalid)
    );
  }
}

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  matcher = new MyErrorStateMatcher();
  loader = false;
  destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    public formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  register(): void {
    this.loader = true;
    this.authService
      .register(this.form.value)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loader = false))
      )
      .subscribe({
        next: () => {
          this.router.navigate(['..'], {
            relativeTo: this.route,
            queryParams: { registered: 'success' },
          });
          this.snackBar.open(`User Registered! Now, you can login`, '', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });

          // this.router.navigate(['/auth/login'], {
          //   queryParams: { registered: 'success' },
          // });
        },
        error: (error) => {
          console.log('error at component', error);
          this.snackBar.open(`${error.message}`, '', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
        },
      });
  }

  // registerUser() {
  //   this.authService.register(this.form.value).subscribe(
  //     (data) => {
  //       this.router.navigate(['..'], { relativeTo: this.route });
  //       this.snackBar.open(`User Registered! Now, you can login`, '', {
  //         duration: 3000,
  //         horizontalPosition: 'end',
  //         verticalPosition: 'bottom',
  //       });
  //     },
  //     (error) => {
  //       console.log('error at component', error);
  //       this.snackBar.open(`${error.message}`, '', {
  //         duration: 3000,
  //         horizontalPosition: 'end',
  //         verticalPosition: 'bottom',
  //       });
  //     }
  //   );
  // }

  private initForm() {
    this.form = this.formBuilder.group(
      {
        username: ['', [Validators.required]],
        email: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'
            ),
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            this.regexValidator(new RegExp('(?=.*?[0-9])'), {
              'at-least-one-digit': true,
            }),
            this.regexValidator(new RegExp('(?=.*[a-z])'), {
              'at-least-one-lowercase': true,
            }),
            this.regexValidator(new RegExp('(?=.*[A-Z])'), {
              'at-least-one-uppercase': true,
            }),
            this.regexValidator(new RegExp('(?=.*[!@#$%^&*])'), {
              'at-least-one-special-character': true,
            }),
            this.regexValidator(new RegExp('(^.{8,}$)'), {
              'at-least-eight-characters': true,
            }),
          ],
        ],
        passwordConfirmation: ['', Validators.required],
      },
      { validator: this.checkPasswords }
    );
  }

  private checkPasswords(group: FormGroup) {
    const pass = group.controls['password'].value;
    const confirmPass = group.controls['passwordConfirmation'].value;
    return pass === confirmPass ? null : { notSame: true };
  }

  private regexValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const valid = regex.test(control.value);
      return valid ? null : error;
    };
  }
}
