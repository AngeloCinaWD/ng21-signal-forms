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

interface FormModel {
  firstname: string;
  lastname: string;
  // aggiungo un parametro numerico
  age: number;
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
    age: 0,
  });

  myForm = form(this.formModel, (fg) => {
    // il parametro fc è un FieldContext, permette solo di leggere i dati che arrivano dal campo del form, non è quindi un FormControl
    // è un oggetto che mi permette di poterlo destrutturare ed ottenere direttamente il value del campo che è un Signal, poi richiamabile con le tonde nella funzione per ottenere il valore
    // sono destrutturizzabili solo value (valore del campo corrente), state (state del campo correne), valueOf (posso ricavare il valore di un altro campo del form), stateOf (stato di un altro campo del form), field, fieldTreeOf, pathKeys
    // lo state di un campo comprende value, errors, valid, invalid, dirty, touched etc etc
    // validate(fg.firstname, (fc) => {
    validate(fg.firstname, ({ value, state, valueOf, stateOf }) => {
      // voglio creare una validazione per controllare che firstname e lastname siano uguali
      // il valore di firstname è quello che ricevo dal parametro value()
      // const firstname = value();
      // il valore di lastname lo posso ricavare dal FormControl del FormGroup
      // const lastname = this.myForm.lastname().value();
      // prendendo il valore direttamente dal form myForm potrebbe causare problemi di sincronizzazione coi valori
      // si utilizza quindi il metodo valueOf() che prende come parametro il FormGroup.nomeDelCampoCheCiInteressa
      // riscrivo le const
      const firstname = valueOf(fg.firstname);
      const lastname = valueOf(fg.lastname);

      // se firstname ha meno di 3 caratteri
      // if (value().length < 3) {
      if (state.value().length < 3) {
        return {
          kind: 'too-short',
          message: 'Firstname must be at least 3 characters long',
        };
      }

      if (firstname !== lastname) {
        // controllo che siano uguali, se lo sono ritorno null (nessun errore di validazione) o un ggetto di errore di validazione con kind e message
        // return firstname === lastname
        //   ? null
        //   : {
        //       kind: 'fn-ln-mismatch',
        //       message: 'Firstname and Lastname must be equal',
        //     };
        // riscrivo la logica della validazione di firstname tenendo conto anche di age e della sua validità
        // se fn e ln sono diversi ritorno l'errore
        return {
          kind: 'fn-ln-mismatch',
          message: 'Firstname and Lastname must be equal',
        };
      }
      // posso accedere allo state di un campo tramite stateOf() e poi richiamare tutti i metodi che avrei per un FormControl
      const stateAge = stateOf(fg.age);
      console.log(stateAge.invalid());
      console.log(stateAge.valid());
      console.log(stateAge.dirty());
      console.log(stateAge.disabled());
      console.log(stateAge.errors());
      // se age è invalid voglio che non sia possibile settare il valore di firstname
      if (stateAge.invalid()) {
        return {
          kind: 'age-invalid',
          message: 'Cannot validate firstname until age is valid',
        };
      }

      return null;
    });

    // regole per age
    required(fg.age, { message: 'Age is required' });
    // regola per valore massimo e minimo
    min(fg.age, 18, { message: 'Minimum age is 18' });
    max(fg.age, 120, { message: 'Maximum age is 120' });
  });
}
