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
  username: string;
  password: string;
  // aggiungo un campo opzionale
  color?: string;
  // aggiungo un campo boolean per esempio per una checkbox
  agree: boolean;
  // radio button
  plan: string;
  // select
  tech: string;
  // valore numerico
  n: number;
  // campo per validazione http
  user: string;
}

@Component({
  selector: 'app-root',
  // la direttiva Field collega ogni input nel template al suo corrispettivo campo del form creato con form(), instaurando una comunicazione bidirezionale tra interfaccia utente e modello
  imports: [Field, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  techs = [
    { id: 1, value: 'vue' },
    { id: 2, value: 'react' },
    { id: 3, value: 'angular' },
  ];

  // creiamo un modello di form con un signal
  // in questo modo io posso modificare la struttura di un form e la funzione form me lo sincronizzerà automaticamente
  formModel = signal<FormModel>({
    username: '',
    password: '',
    agree: false,
    plan: 'free',
    tech: '',
    n: 10,
    user: '',
  });

  // trasformiamo il modello di form in un FormGroup reattivo tramite il metodo form()
  // le proprietà descritte nel FormModel diventano quindi FormControl che compongono il FormGroup
  // per ottenere il valore di un FormControl devo utilizzare .value() che è un Signal
  // inoltre per ogni FormControl posso utilizzare i metodi .dirty(), .touched() etc
  // ora possiamo utilizzarlo nel template
  // questa funzione crea un field-tree navigabile
  // un secondo parametro alla funzione form mi permette di regolare la validazione del form
  // il secondo parametro è una funzione con parametro il formgroup
  loginForm = form(this.formModel, (fg) => {
    // username
    required(fg.username, { message: 'Username is required' });
    minLength(fg.username, 4, { message: 'Minimum length is 4' });
    // voglio che lo usernamename possa contenere solo lettere, numeri e underscore e nessun altro carattere speciale
    pattern(fg.username, /^[a-z0-9_]+$/i, {
      message: 'Username può contenere solo numeri, lettere e _',
    });
    // possiamo anche creare regole di validazione custom con il metodo validate(), come secondo parametro accetta una funzione che ha come parametro il FormControl e deve ritornare in caso di errore un oggetto con le proprietà kind (nome validazione) e message (messaggio da mostrare)
    // validate(fg.username, (fc) => {
    // un piccolo trucco è chiamare il parametro value tra le graffe e poi utilizzarlo con le tonde
    validate(fg.username, ({ value }) => {
      // voglio che lo username inizi con la r
      // è case-sensitive
      // if (!fc.value().startsWith('r')) {
      if (!value().startsWith('r')) {
        return {
          kind: 'not-r-start',
          message: 'Username deve iniziare con la r',
        };
      }

      // controllo che lo username sia solo un valore contenuto in un array
      const allowedValues = ['riccardo', 'ricky', 'roberto'];
      if (!allowedValues.includes(value())) {
        return {
          kind: 'not-allowed',
          message: `Valori consentiti ${allowedValues.toString()}`,
        };
      }

      return null;
    });

    // password
    required(fg.password, { message: 'Password is required' });
    minLength(fg.password, 8, { message: 'Minimum length is 8' });
    // posso rendere un formcontrol disabilitato fino a che non è vera una certa condizione
    // faccio inserire la password solo dopo che lo username è stato inserito in maniera valida
    disabled(fg.password, () => this.loginForm.username().invalid());

    // agree
    required(fg.agree, { message: 'Acconsentire' });

    // user
    required(fg.user, { message: 'Required' });
    // validazione asincrona di user
    validateHttp(fg.user, {
      // gli viene passato un oggetto di configurazione con diverse proprietà
      // url della request (funzione che ha come parametro il value del formcontrol)
      request: ({ value }) => `https://jsonplaceholder.typicode.com/users?username=${value()}`,

      // in caso di successo della request
      // funzione con 2 parametri il primo è la response, il secondo è il value del formcontrol
      onSuccess: (response: any[], { value }) => {
        // normalizzo il valore di user tutto in minuscolo
        const username = value()?.toLowerCase?.() ?? '';

        // con il metodo .some() controllo se l'oggetto contenuto nell'array di risposta contiene una proprietà username con valore (normalizzato in minuscolo) uguale al valore del formcontrol
        // in caso non esiste un utente con quello username otterrò in risposta un array vuoto
        // il metodo .some() mi restituisce true o false
        // se l'array è vuoto avrò quindi taken = false
        const taken = response.some((user) => user.username.toLowerCase() === username);

        console.log('Is taken?', taken, 'Response:', response);

        // in caso taken è true vuol dire che esiste un ytente con quell'username e quindi ritorno un oggetto di errore di validazione con le proprietà kind e messagge, altrimenti ritorno null (validazione passata nessun errore)
        return taken ? { kind: 'usernameTaken', message: 'Username already taken' } : null;
      },

      // in caso di errore di request non andata a buon fine ritorno un oggetto di errore con kind e message
      onError: () => ({
        kind: 'networkError',
        message: 'Could not check username availability',
      }),
    });
  });

  // creo un computed Signal per ottenere la lunghezza della password inserita
  passwordLength = computed(() => this.loginForm.password().value().length);

  logValues() {
    // possiamo accedere ai dati del form in 2 modalità, direttamente tramite FormModel o tramite Signal Form e i suoi campi specifici
    // da FormMode quindi da Signall:
    const fm = this.formModel();
    console.log(fm.username, fm.password);
    // accesso da FormGroup, posso utilizzare i metodi come valid(), value(), dirty() etc
    const username = this.loginForm.username().value();
    console.log(username);
    console.log(this.passwordLength());
  }

  updateValues() {
    // possiamo accedere ai dati anche in scrittura, quindi modificarli
    // aggiorniamo lo username, tramite formModel che è un Signal e quindi posso utilizzare il metodo .update
    this.formModel.update((current) => ({
      ...current,
      username: 'new value',
      // posso aggiungere in questo momento un campo opzionale nel FormModel, field me lo binderà automaticamente
      color: 'blue',
    }));
    // aggiorniamo la password tramite FormGroup, il campo del form è un Signal restituito con value, in questo caso non ho l'intero oggetto FormModel ma solo la stringa valore del campo password
    this.loginForm.password().value.update((password) => 'secret password');
  }
}
