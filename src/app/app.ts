import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import {
  disabled,
  Field,
  form,
  max,
  min,
  minLength,
  pattern,
  required,
  validate,
  validateHttp,
} from '@angular/forms/signals';

@Component({
  selector: 'app-root',
  imports: [Field, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
