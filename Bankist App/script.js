'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'James Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//Creating DOM Elements
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = ''; // removes default values movements
  /** textContent returns text itself while innerHTML returns everything, including text*/

  // ternary operator
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  /** we have sort = false as our second parameter
   * if sort is set to true, we use slice and sort to sort the numbers
   * we use slice to create a shallow copy of the movements array since sort() is dangerous and can mutate the original movements array
   */

  // instead of working with global variables, pass data into function
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value">${mov}€</div>
        </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance} €`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes} €`;

  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(outcomes)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(function (deposit) {
      return (deposit * acc.interestRate) / 100;
    })
    .filter((int, i, arr) => {
      console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

//COMPUTING USERNAMES
const createUsernames = function (accs) {
  // forEach loop iterates over each account(acc) in the accs array argument
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase() // converts owner property to lower case to ensure consistency
      .split(' ') //splits the owner string into an array of words at each space character
      .map(
        name => name[0]
      ) /*map takes a callback arrow function as argument and executes for each element of the array
        arrow function extracts first character of each name with index [0]
        and then returns the extracted initial
        * the map method then returns the extracted initial, creating the new array
      */
      .join('');
  }); // map method allows us to create a new array which contains initials of name
}; // no return statement needed as we modify the account object and we are not creating a new value

createUsernames(accounts);
console.log(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
}; // we can now call updateUI anywhere in our code

// Event Handlers
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault(); // prevents form from submitting when we press the enter key to login

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount); // Remember that find method can produce undefined values if the input is not part of the accounts object! (e.g., qwe, abc)

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }!`;
    containerApp.style.opacity = 100;

    // Clear input login and password fields after you login
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); // enables us to move the cursor off the login input fields

    // Update UI when logined
    updateUI(currentAccount);
  }
  /**
   * Using optional chaining (?.) here would mean if currentAccount exists, access its pin property, otherwise return undefined
   * It ensures that accessing the 'pin' property is safe and doesn't throw an error if currentAccount object is null or undefined
   */
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault(); // prevents the default action of reloading the page
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  ); // we are looking for the account that equals the username value that we input into the form and storing it in receiverAcc
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // optional chaining on receiverAcc checking if the username exists, otherwsie it will return undefined and && operand will be false

    // Doing the transfer
    currentAccount.movements.push(-amount);
    // we are pushing the negative amount to the currentAccount to reduce their balance by this amount
    receiverAcc.movements.push(amount);
    // we push positive amount to receiver so they get an increase by the transfer amount

    // Update UI
    updateUI(currentAccount);
  }
});

// Bank only grants loan if there is one deposit that is 10% of the loan amount requested
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // if at least one element in movements array is greater than 10% of requested amount, we execute the if block

    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    /**
     * we passed in condition acc.username === currentAccount.username that returns either true or false
     * findIndex will return index of first element of the array when it is true
     */

    console.log(index);

    // Delete account
    accounts.splice(index, 1); // splice method mutates the original array so no need to save it down. It deletes the account in the accounts array

    // Hide UI after account is deleted
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
  // ensures that we clear the input fields in the close account input fields once we click enter
  labelWelcome.textContent = `Log in to get started`;
});
// console.log('Login') will print and then disappear when the page reloads. When we click on submit button, the page will reload. We need to prevent that from happening

let sorted = false; // set a state variable called sorted

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

