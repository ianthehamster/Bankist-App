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

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// /////////////////////////////////////////////////

// let arr = ['a', 'b', 'c', 'd', 'e'];

// // Slice method (arrays) (Immutable)
// console.log(arr.slice(2)); //Output: ["c", "d", "e"] returns a new array as original array is NOT mutated!
// console.log(arr.slice(2, 4)); //Output: ["c", "d"] as end parameter (index 4 is not included)
// console.log(arr.slice(-1)); //Output: ["e"] as -1 is the last element of the array

// console.log(arr.slice(1, -2)); //Output: ["b", "c"] as -2 means it extracts everything except the last two elements of the array

// console.log(arr.slice()); // creates a shallow copy of the original array, arr
// console.log([...arr]); // creates a shallow copy using spread operator

// // Splice method (arrays) (Mutable)
// console.log(arr.splice(2)); //Output: ["c", "d", "e"]
// arr.splice(-1);
// console.log(arr); //Output: ["a"] as extracted elements are gone due to the splice method above
// // splice mutates the original array by taking "c", "d" and "e" out of arr as well as "b" from the splice(-1)

// // Reverse method (Mutable)
// let arr1 = ['a', 'b', 'c', 'd', 'e'];
// let arr2 = ['j', 'i', 'h', 'g', 'f'];
// console.log(arr2.reverse()); //Output: [f, g, h, i, j]
// console.log(arr2); // original array is now reversed and has mutated

// // Concat method (immutable)
// const letters = arr1.concat(arr2);
// console.log(letters); //Output: [a, b, c, d, e, f, g, h, i, j]
// console.log(...arr1, ...arr2); // same output but no longer in array, using spread operator and also does not mutate the original arrays

// // Join method ()
// console.log(letters.join('-'));

// // The new At Method
// const arrNew = [23, 11, 64];
// console.log(arrNew[0]); //Output: 23
// console.log(arr.at(0)); //Output: 23

// // we can replace bracket notation with the At method
// console.log(arrNew[arrNew.length - 1]); //Output: 64 as indexes are zero based so [2] = 64
// console.log(arrNew.slice(-1)[0]); //Output: 64 as we get the last element from the array
// /** remember that the slice method returns a new array which will be [64]
//  * we then take the first element using [0]
//  */

// // At method
// console.log(arrNew.at(-1)); //Output: 64 but remember that -1 access the last element of the array, followed by -2

// console.log('jonas'.at(0)); //Output: j
// console.log('jonas'.at(-2)); //Output: a

// // Looping Arrays: For Each
// const movementsForEach = [200, 450, -400, 3000, -650, -130, 70, 1300];
// // positive values are deposits and negative values are withdrawals from the bank account

// for (const movement of movementsForEach) {
//   if (movement > 0) {
//     console.log(`You deposited ${movement} dollars`);
//   } else {
//     console.log(`You withdrew ${Math.abs(movement)} dollars`);
//   }
// }

// // forEach method (give this method a callback function to work with)
// console.log('---forEach method below---');
// movementsForEach.forEach(function (movement, i, arr) {
//   // arguments should be in this order: 1. current element 2. index 3. array
//   if (movement > 0) {
//     console.log(`Movement ${i + 1}:You deposited ${movement}`);
//   } else {
//     console.log(`Movement ${i + 1}: You withdrew ${Math.abs(movement)}`);
//   }
// });

// //iteration 0: function(200)
// //iteration 1: function(450)
// //iteration 2: function(400)
// //... (loop continues until last iteration)

// /**
//  * note that forEach is a higher order function as it requires a callback function in order to tell it
//   what to execute. forEach will call the callback function, NOT us!
//  * forEach loops over the array and in each iteration, it calls the callback function
//  */

// console.log('---entries() method---');
// for (const [i, movement] of movementsForEach.entries()) {
//   if (movement > 0) {
//     console.log(`Movement ${i + 1}: You deposited ${movement} dollars`);
//   } else {
//     console.log(
//       `Movement ${i + 1}: You withdrew ${Math.abs(movement)} dollars`
//     );
//   }
// }

// // we cannot break out of a forEach loop and cannot use continue and break statements
// // we can use continue and break statements with for of loop

// //forEach with Maps and Sets

// // Map
// const currenciesMaps = new Map([
//   // Map constructor takes an iterable argument which is an array or object containing key-value pairs
//   ['USD', 'United States dollar'], // key: USD and value: United States Dollar
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// currenciesMaps.forEach(function (value, key, map) {
//   console.log(`${key}: ${value}`);
// });

// // Set
// const currenciesSets = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
// console.log(currenciesSets);

// currenciesSets.forEach(function (value, _, map) {
//   console.log(`${value}: ${value}`);
// });
// // Sets do not have keys and indexes. Thus, the key argument makes no sense for Sets.

// // Coding Challenge #1
// /*Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:
// 1. Juliafoundoutthattheownersofthefirstandthelasttwodogsactuallyhave cats, not dogs! So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters)
// 2. CreateanarraywithbothJulia's(corrected)andKate'sdata
// 3. Foreachremainingdog,logtotheconsolewhetherit'sanadult("Dognumber1
// is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy   ")
// 4. Runthefunctionforbothtestdatasets */

// const julia = [9, 16, 6, 8, 3];
// const kate = [10, 5, 6, 1, 4];

// function checkDogs(julia, kate) {
//   const juliaShallowCopy = julia.slice(1, -2);
//   /* slice(2, -2) returns a shallow copy of the elements starting from index 1(inclusive)
//     and ending at the second-to-last element (exclusive)
//   */
//   console.log(juliaShallowCopy);

//   const juliaAndKate = [...juliaShallowCopy, ...kate];
//   console.log(juliaAndKate);

//   juliaAndKate.forEach(function (element, i, arr) {
//     if (element > 3) {
//       console.log(
//         `Dog number ${i + 1} is an adult, and is ${element} years old`
//       );
//     } else {
//       console.log(`Dog number ${i + 1} is still a puppy 🐶`);
//     }
//   });
// }

// checkDogs(julia, kate);

// // The Map Method (Functional Programming!)
// const eurToUsd = 1.1;

// const movementsUSD = movements.map(function (mov, i, arr) {
//   return mov * eurToUsd; // return creates a new array using the .map method with each iteration of the movements array
// });

// const movementsUSDArrow = movements.map(mov => mov * eurToUsd);
// console.log(movementsUSDArrow);

// console.log(movements); //Output: [200, 450, -400, 3000, -650, -130, 70, 1300]
// console.log(movementsUSD); //Output: [220.00000000000003, 495.00000000000006, -440.00000000000006, 3300.0000000000005, -715.0000000000001, -143, 77, 1430.0000000000002]

// // Alternative method using the for of loop
// const movementsUSDfor = [];
// for (const mov of movements) {
//   movementsUSDfor.push(mov * eurToUsd);
//   // loop over original array and manually create new array using the push method
// }
// console.log(movementsUSDfor);

// const movementsDescriptions = movements.map(
//   (mov, i, arr) =>
//     `Movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(
//       mov
//     )}`
//   /** we pass the callback arrow function into map method but we
//       do not call the function ourself. Map calls it for each element in the array
//      */
// );
// // we can have two or more return statements in a function as long as only one return statement is executed!

// console.log(movementsDescriptions);

// // Filter method (more useful for chaining methods together)
// const deposits = movements.filter(function (mov) {
//   return mov > 0;
// });
// // only when mov > 0 is true will they be included in the deposits array
// console.log(movements); //Output: [200, 450, -400, 3000, -650, -130, 70, 1300]
// console.log(deposits); //Output: [200, 450, 3000, 70, 1300]

// // For Of Loop method (less useful as we cannot chain For Of loops with other methods)
// const depositsForOf = [];
// for (const mov of movements) {
//   if (mov > 0) {
//     depositsForOf.push(mov);
//   }
// }
// console.log(depositsForOf); //Output: [200, 450, 3000, 70, 1300]

// const withdrawals = movements.filter(function (mov) {
//   return mov < 0;
// });
// console.log(withdrawals);

// // Reduce method
// // const balance = movements.reduce(function (acc, cur, i, arr) {
// //   // accumulator -> SNOWBALL
// //   console.log(`Iteration ${i}: ${acc}`);
// //   return acc + cur;
// // }, 0);

// const balance = movements.reduce(
//   (acc, cur) =>
//     // accumulator -> SNOWBALL
//     acc + cur,
//   0
// );

// console.log(balance); //Output: 3840
// /**
//  * .reduce() method is called on the movements array
//  * .reduce() takes 2 arguments:
//     1. Callback function
//     2. Initial value: 0, indicating sum will start from 0
//  * callback function has 4 parameters:
//     1. acc (accumulator): keeps track of accumulated value and updates in each iteration
//     2. cur (current value): represents current element of the array in each iteration
//     3.
//  */

// let balance2 = 0;
// for (const mov of movements) {
//   balance2 += mov; // we need external variable, balance2, for the for of loop, which can be cumbersome
// }
// console.log(balance2);

// // Maximum value
// const max = movements.reduce((acc, mov) => {
//   if (acc > mov) {
//     return acc; // since acc is always in the next iteration
//   } else {
//     return mov; // we return the mov as the new acc in the next iteration
//   }
// }, movements[0]);
// console.log(max); //Output: 3000
// /**
//  * at 200, acc < mov so we return 200
//  * Then, when acc is 200, but mov is 450, we return mov as else block is executed and new acc is now 450 (return mov)
//  * Then, when acc is 450 but mov is -4000, we return acc as if block is executed and acc remains the same
//  * We keep going until mov = 3000, where it is the max number in the array
//  */

// // Coding Challenge #2
// const calcAverageHumanAge = function (ages) {
//   // create new array on original array
//   const humanAges = ages.map(age => (age <= 2 ? 2 * age : 16 + age * 4));
//   const adults = humanAges.filter(age => age >= 18);
//   console.log(humanAges);
//   console.log(adults);

//   const average = adults.reduce((acc, age) => acc + age, 0) / adults.length;

//   // Or
//   // const average = adults.reduce((acc, age, i, arr) => acc + age / arr.length, 0);

//   return average;
// };

// const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
// const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);
// console.log(avg1, avg2);

// // Coding Challenge #3
// const calcAverageHumanAgeChain = function (ages) {
//   return ages
//     .map(age => (age <= 2 ? 2 * age : 16 + age * 4))
//     .filter(age => age >= 18)
//     .reduce((acc, age, i, arr) => acc + age / arr.length, 0);
// };

// console.log(calcAverageHumanAgeChain([5, 2, 4, 1, 15, 8, 3]));

// // Magic of Chaining Methods

// // PIPELINE
// const totalDepositsUSD = movements
//   .filter(mov => mov > 0)
//   .map((mov, i, arr) => {
//     // console.log(arr); // we can inspect the array using the third parameter of the callback function, arr
//     return mov * eurToUsd;
//   })
//   // .map(mov => mov * eurToUSD)
//   .reduce((acc, mov) => acc + mov, 0);

// // filter and map method makes a new array
// /** note that we can only chain a method after another one if the previous method returns an array
//  * thus, we cannot chain the map or filter method after the reduce method since reduce method returns a value
//  */

// console.log(totalDepositsUSD);

// // The find method (loops over array and retrieves specific element)
// const firstWithdrawal = movements.find(mov => mov < 0);
// console.log(movements);
// console.log(firstWithdrawal); //Output: -400
// /**
//  * like the filter method, find method needs a callback function that returns a boolean value
//  * Howver, it will not return an array but the first element in the array that satisfies this condition (mov < 0)
//  * filter returns all the elements that match the condition
//  * filter method returns a new array while find method only returns the element itself
//  */

// const account = accounts.find(acc => acc.owner === 'James Davis');
// console.log(account);

console.log(movements);

// EQUALITY
console.log(movements.includes(-130));

const anyDepositsFunction = movements.some(function (mov) {
  return mov > 0;
});

// CONDITION
console.log(movements.some(mov => mov === -130));
const anyDeposits = movements.some(mov => mov > 1500);

console.log(anyDeposits);
console.log(anyDepositsFunction);

// EVERY (only returns true when all elements of the array satisfies the condition in the callback function)

console.log(movements.every(mov => mov > 0));
console.log(account4.movements.every(mov => mov > 0)); //Output: True as every movement in Sarah's account is positive!

// Separate callback to save the callback function in a variable
const deposit = mov => mov > 0;
console.log(movements.some(deposit)); //Output: True
console.log(movements.every(deposit)); //Output: False
console.log(movements.filter(deposit)); //Output: [200, 450, 3000, 70, 1300]

// flat and flatMap methods
const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
console.log(arr.flat()); // we get our full array: [1, 2, 3, 4, 5, 6, 7, 8]

const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
console.log(arrDeep.flat(2)); //Output: [1, 2, 3, 4, 5, 6, 7, 8] as we go 2 levels deep into the nesting in arrDeep

const accountMovements = accounts.map(acc => acc.movements);
// we create a new array which contains the array of all the movements from the 4 accounts

const allMovements = accountMovements.flat();
console.log(allMovements); // Output: [200, 450, -400, 3000, -650, -130, 70, 1300, 5000, 3400, -150, -790, -3210, -1000, 8500, -30, 200, -200, 340, -300, -20, 50, 400, -460, 430, 1000, 700, 50, 90]

const overallBalance = allMovements.reduce((acc, mov) => acc + mov, 0);
console.log(overallBalance); //Output: 17840

// Chaining method
const overallBalanceChaining = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0);
console.log(overallBalanceChaining); // Output: 178
40;

// flatMap method which combines map() and flat() method
const overallBalanceChaining2 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, mov) => acc + mov, 0);
console.log(overallBalanceChaining2); // Output: 178
40;
console.log(overallBalanceChaining2);
// Note that flatMap only goes 1 level deep. Use flat method if you want to go more than 1 level deep

// Sorting Arrays
const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
console.log(owners.sort()); //Output: ['Adam', 'Jonas', 'Martha', 'Zach']
console.log(owners); //Same output as the original array has been mutated with sort method

//Numbers
console.log(movements);
console.log(movements.sort()); //Output: [-130, -400, -650, 1300, 200, 3000, 450, 70] these numbers are not ordered at all as the sort method sorts based on strings, NOT on numbers
/**
 * sort converts these numbers to strings, then sorts them based on the first symbol/number
 */

// return < 0, A will be before B (keep order)
// return > 0, B will be before A (switch order)

// Ascending Order
movements.sort((a, b) => {
  if (a > b) {
    return 1;
  } // If 'a' is greater than 'b', callback function returns 1, indivating that 'a' should be placed after 'b' in the new array
  if (b > a) {
    return -1;
  } // If 'b' is greater than 'a', callback function returns -1, indivating that 'a' should be placed after 'a' in the new array
  return 0; // If 'a' and 'b' are equal, the callback function returns 0, meaning order of 'a' and 'b' remains unchanged
});
console.log(movements); //Output: [-650, -400, -130, 70, 200, 450, 1300, 3000]

/**
 * sort method loops over array and applies callback function in each iteration to sort the new array
 * EXAMPLE: '200' and '450' -> first pair of elements in array
 * 200 is 'a' and 450 is 'b'
 * Since '200' is less than '450, callback function returns -1
 * sort method determines 200 should be placed before 450
 * Using positive and negative return values shows that sort method interprets positive values as 'greater than' and negative values as 'less than' during sorting process
 */

/**
 * If the callback function returns a positive value (1), a will be sorted after b.
 * If the callback function returns a negative value (-1), a will be sorted before b.
 * If the callback function returns 0, the relative order of a and b remains unchanged.
 */

// Descending Order
movements.sort((a, b) => {
  if (a > b) {
    return -1;
  }
  if (a < b) {
    return 1; // 200 is now sorted after 450 since the return value is positive in this instances
  }
  return 0;
});
console.log(movements);

// Polished version of Ascending order
movements.sort((a, b) => a - b);
console.log(movements); //Output: [-650, -400, -130, 70, 200, 450, 1300, 3000]

/**
 * if a is greater than b, a-b is positive number, return positive number
 * if a is smaller than b, a-b is negative number, return negative number
 * if a is equal b, a-b is 0 and return 0, position remains unchanged
 */

// Polished version of Descending order
movements.sort((a, b) => b - a);
console.log(movements); //Output: [3000, 1300, 450, 200, 70, -130, -400, -650]

// if array has both numbers and strings, don't use sort method
