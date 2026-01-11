import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import {
  debounce,
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

interface RegisterModel {
  username: string;
}

@Component({
  selector: 'app-root',
  imports: [Field, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  registerModel = signal<RegisterModel>({
    username: '',
  });

  registerForm = form(this.registerModel, (fg) => {
    required(fg.username, { message: 'Username is required' });

    // la funzione validateHttp() già di suo fa una sorta di debouncing delle chiamate, ogni volta che digito nell'input quelle in corso vengono abortite, utilizza internamente un abortController
    // per impedire che venga lanciata una request ad ogni digitazione possiamo applicare un ritardo, un debounce, all'update del campo
    // lo facciamo utilizzando la funzione di angular per le validation debounce(), indicando il campo ed il ritardo in millisecondi
    // debounce(fg.username, 1000);
    // questa semplice può essere sostituita da una con callback
    debounce(fg.username, ({ value }, abortSignal) => {
      // restituiamo una Promise che viene risolta solo dopo il timeout
      // se l'utente digita prima dei millisecondi indicati questa promise viene interrotta ed il timer riparte
      return new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
      // abortSignal è un oggetto di tipo AbortSignal parte dell'API standard AbortController ed è un meccanismo che viene utiizzato per interrompere operazioni asincrone come i timer, il debounce, chiamate ajax etc
      // è un segnaposto in versione Signal per dire quetsa operazione non serve più e va interrotta
      // return new Promise(resolve => {
      //   const timer = setTimeout(resolve, 2000);

      //   abortSignal.addEventListener('abort', () => {
      //     clearTimeout(timer);
      //   })
      // })
    });
    // tipizzo la funzione indicando il tipo del value che riceve dal campo (string) ed il tipo di risposta che riceverà (un oggetto con una proprietà available di tipo booleano)
    validateHttp<string, { available: boolean }>(fg.username, {
      request: ({ value }) => {
        // togliamo gli eventuali spazi all'inizio ed alla fine dello username
        const username = value().trim();

        // controllo se esiste, se non è stringa vuota e se sono almeno 3 caratteri
        if (!username || username.length < 3) {
          return undefined;
        }

        // facciamo l'encoding dello username prima di inviarlo al BE
        return `http://localhost:3002/api/check-username?username=${encodeURIComponent(username)}`;
      },
      onSuccess: (response: { available: boolean }, { value }) => {
        if (!response.available) {
          return {
            kind: 'username-taken',
            message: `Username ${value()} is already taken`,
          };
        }

        return null;
      },
      onError: () => ({ kind: 'network-error', message: 'Could not check username availability' }),
    });
  });
}
