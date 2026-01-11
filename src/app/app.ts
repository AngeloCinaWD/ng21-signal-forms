import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import {
  disabled,
  Field,
  form,
  minLength,
  pattern,
  required,
  validate,
  validateHttp,
} from '@angular/forms/signals';

interface FormModel {
  firstname: string;
  lastname: string;
}

@Component({
  selector: 'app-root',
  imports: [Field, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  formModel = signal<FormModel>({
    firstname: '',
    lastname: '',
  });

  myForm = form(this.formModel, (fg) => {
    validate(fg.firstname, ({ value }) => {
      return null;
    });
  });
}
