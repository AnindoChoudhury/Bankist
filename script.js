'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP


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



// -----------------------------------------------------



//------------------------------------------------------

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////

// Finds out initials of a name to match the entered username with the actual username's initials 

const initials = function (str)
{
    let result = ""; 
    const arr = str.split(' ');
    arr.forEach(function(ele)
    {
        result+=ele[0]; 
    }) 
    return result.toLowerCase(); 
}
// compares the entered username and pin with the actual ones 
const valid = function (obj,pin,name) 
{
     if(obj.pin===pin && initials(obj.owner) === name)
     return true;  
}

// Finds out addition of elements 
const add = function (array)
{
   let s=0; 
    array.forEach(function(item)
    {
        s+=item; 
    })
    return (s.toFixed(2)); 
}

// tracks movements 
const track = function (money,i)
{
  let html,str;
    if(money<0)
    str = "withdrawal"; 
    else 
    str = "deposit"; 

    html = `<div class="movements__row">
    <div class="movements__type movements__type--${str}">${i+1} ${str}</div>
    <div class="movements__value">${money.toFixed(2)}€</div>
  </div>`;
    containerMovements.innerHTML=html+containerMovements.innerHTML; 
}

// Calculates total deposited money
const inMoney = function (arr)
{
  let sum = 0; 
    arr.forEach(function(ele)
    {
       if(ele > 0)
       sum=sum+ele; 
    })
    return sum.toFixed(2) ;
}

// Calculates total withdrawal money
const outMoney = function (arr)
{
  let sum = 0; 
    arr.forEach(function(ele)
    {
       if(ele < 0)
       sum=sum+ele; 
    })
    return Math.abs(sum).toFixed(2) ;
}
let logoutTimer; 
const timerFun = function()
{
 const tick = function()
{ 
     
     let mins = Math.floor(time/60); 
     let sec = time%60; 
     labelTimer.textContent=`${mins}`.padStart(2,0)+":"+`${sec}`.padStart(2,0);  
     if(time===0)
     {
         clearInterval(logoutTimer); 
         containerApp.style.opacity="0%";
         labelWelcome.textContent="Login to get started"; 
     }
     time--;
}
let time=300;
logoutTimer = setInterval(tick,1000); 
}

let usernameValue,pinValue,activeAcc,currentBalance; 

// Callback function for login button
const login = function()
{
    
    usernameValue = inputLoginUsername.value; 
    pinValue = Number(inputLoginPin.value);
    for(const item of accounts)
    {
       if(valid(item,pinValue,usernameValue))
       {
          
          clearInterval(logoutTimer); 
          timerFun(); 
          activeAcc=item;  //stores present account object 
          console.log(activeAcc); 
          containerMovements.innerHTML="";
          if(containerApp.classList.contains("hidden"))
          containerApp.classList.remove("hidden"); 
          containerApp.style.opacity = "100%";  
          labelWelcome.textContent = "Welcome, "+item.owner[0].toUpperCase()+item.owner.slice(1,item.owner.indexOf(' ')); 
          currentBalance = add(item.movements); 
          labelBalance.textContent=`${currentBalance}€`; 
           
          labelSumIn.textContent=`${inMoney(item.movements)}€`; 
          labelSumOut.textContent=`${outMoney(item.movements)}€`; 
          interestCalculation(); 

          item.movements.forEach(track);

          const locale = navigator.language; 
          const date = new Date(); 
          const options = {
            hour : "numeric",
            minute : "numeric",
            day : "numeric",
            month : "long",
            year : "numeric",
            weekday : "long"
          }
          labelDate.textContent=new Intl.DateTimeFormat(locale,options).format(date);           
          break; 
       }
    }
    inputLoginUsername.value="";
    inputLoginPin.value="";
    inputLoginPin.blur(); 
};

// actions after login button is clicked 
btnLogin.addEventListener("click",login);
document.addEventListener("keydown",function(e)
{
  if(e.key==="Enter")
  login();
});

// Transfer callback function
const transferMoney = function()
{
  const transferToValue = inputTransferTo.value;
  const transferAmountValue = Number(inputTransferAmount.value);
  for(const item of accounts)
  {
      if(transferToValue===initials(item.owner) && transferToValue!==initials(activeAcc.owner) && transferAmountValue<=currentBalance && transferAmountValue>0)
      {
            containerMovements.innerHTML=""; //resets the innerhtml of the movements
            activeAcc.movements.push(0-transferAmountValue); //pushes the withdrawal in the active-acc movements array
            item.movements.push(transferAmountValue); //pushes the deposited account in the recipent 
            currentBalance=add(activeAcc.movements); 
            labelBalance.textContent=`${currentBalance}€`; 
            activeAcc.movements.forEach(track); 
            labelSumOut.textContent = `${outMoney(activeAcc.movements)}€`;
            inputTransferAmount.value = ""; 
            inputTransferTo.value = "";  
            inputTransferAmount.blur();

            //Resetting the timer 

            clearInterval(logoutTimer); 
            timerFun(); 
      }
  }
};

// transfer operations 
btnTransfer.addEventListener("click", transferMoney);
document.addEventListener("keydown",function(e)
{
  if(e.key==="Enter")
  transferMoney();
});

// Loan callback function
const takeLoan = function()
{
  const loanAmt = Number(Math.floor(inputLoanAmount.value)); 
  clearInterval(logoutTimer); 
  timerFun(); 
  // Loan should be sanctioned only if there is at least one deposited amount which is more than 10% of the loan amount && loan amount > 0

   if((activeAcc.movements).some(item=>item>=(0.1*loanAmt)) && loanAmt>0)
   {
    
    activeAcc.movements.push(loanAmt); 
    const giveLoan = setTimeout(function()
    {
    containerMovements.innerHTML="";
    activeAcc.movements.forEach(track);
    labelBalance.textContent=`${add(activeAcc.movements)}€`;
    labelSumIn.textContent = `${inMoney(activeAcc.movements)}€`;  
    interestCalculation(); 
    inputLoanAmount.value=""; 
    inputLoanAmount.blur(); 
    },3000); 
   }
}

// Loan operations
btnLoan.addEventListener("click",takeLoan);
document.addEventListener("keydown",function(e)
{
  if(e.key==="Enter")
  {
    takeLoan();
    e.preventDefault();
  }
});


// close callback function 
const closeAcc = function()
{
  clearInterval(logoutTimer); 
  timerFun();
    if(initials(activeAcc.owner)===inputCloseUsername.value && activeAcc.pin===Number(inputClosePin.value))
    {
       containerApp.style.opacity="0%"; 
       accounts.splice(accounts.indexOf(activeAcc),1); 
       inputCloseUsername.value=""; 
       inputClosePin.value = ""; 
       inputClosePin.blur(); 
       labelWelcome.textContent="Login to get started"; 
       inputLoginUsername.value=""; 
       inputLoginPin=""; 
    }
}
// close operations 
btnClose.addEventListener("click",closeAcc);   
document.addEventListener("keydown",function(e)
{
    if(e.key==="Enter")
   {
     closeAcc();
     e.preventDefault();
   }
});
//interest calculation 

const interestCalculation = function() 
{
  
//  filter positive values from the movements array => map a new array multiplied with the rate => filter values greater than or equal to 1  => reduce the array to the sum 
  const sumOfInterest = (activeAcc.movements).filter(item=>(item>0)).map(item => (item*activeAcc.interestRate/100)).filter(item=>(item>=1)).reduce((acc,item)=>acc+item,0);
  labelSumInterest.textContent=`${sumOfInterest.toFixed(2)}€`; 
}

// Sort transactions
let sorted = false;  
btnSort.addEventListener("click",function()
{
  containerMovements.innerHTML="";
  if(!(sorted))
  {
     activeAcc.movements.slice().sort((a,b)=>a-b).forEach(track); 
  } 
  else 
  {
      activeAcc.movements.forEach(track); 
  }
  sorted=!(sorted); 
})
//----------------------------------------------
// local database 

// Local banking system variables 
const btnNext = document.querySelector(".btn-next"); 
const btnSubmit = document.querySelector(".btn-submit"); 
const inputDatabaseName = document.querySelector(".database-username"); 
const inputDatabasePin = document.querySelector(".database-pin"); 
const inputDatabaseDeposit = document.querySelector(".database-deposit"); 
const inputDatabaseInterest = document.querySelector(".database-interest")
const localLogo = document.querySelector(".local-logo"); 
const databaseBox = document.querySelector(".local-database-box"); 
const databasePage = document.querySelector(".local-database-page"); 
const brand = document.querySelector(".brand"); 
const navLogin = document.querySelector(".navbar-login"); 
const detailsActual = document.querySelector(".details-actual");
const detailsBox = document.querySelector(".user-details-box");  
const lightBulb = document.querySelector(".bi-lightbulb"); 
// Database input reveal
localLogo.addEventListener("mouseover",function()
{
    localLogo.style.opacity="0%";
    setTimeout(() => {localLogo.classList.add("hidden")},300); 
    databaseBox.style.opacity="100%"; 
    brand.style.opacity="100%"; 
})
////////////////////////////
const obj = {
  owner : "anindo ch",
  pin : 1111,
  movements : [1200,3400,120],
  interestRate : 1.2
}
const accounts=[obj],usernamesArray=[],pinArray=[]; 
//////////////////////////
btnNext.addEventListener("click",function()
{
          if(inputDatabaseName.value!=="" && +inputDatabasePin.value>=1000 && +inputDatabasePin.value<=9999)
            { 
              accounts.push(new Object(
              {
                 owner : inputDatabaseName.value,
                 pin : Number(inputDatabasePin.value),
                 movements : [Number(inputDatabaseDeposit.value)],
                 interestRate : +(inputDatabaseInterest.value)
              }));
              usernamesArray.push(initials(inputDatabaseName.value)); 
              pinArray.push(inputDatabasePin.value); 
              inputDatabaseName.value=""; 
              inputDatabasePin.value=""; 
              inputDatabaseDeposit.value=""; 
              inputDatabaseInterest.value="";
            } 
            else 
            {
              inputDatabaseName.value=""; 
              inputDatabasePin.value="";
              inputDatabaseDeposit.value="";   
              inputDatabaseInterest.value=""; 
            }
})

btnSubmit.addEventListener("click",function()
{
  if(inputDatabaseName.value!=="" && +inputDatabasePin.value>=1000 && +inputDatabasePin.value<=9999)
  {
           accounts.push(new Object(
            {
              owner : inputDatabaseName.value,
              pin : Number(inputDatabasePin.value),
              movements : [Number(inputDatabaseDeposit.value)],
              interestRate : +(inputDatabaseInterest.value)
            }));   
            usernamesArray.push(initials(inputDatabaseName.value)); 
            pinArray.push(inputDatabasePin.value)  
            navLogin.classList.remove("hidden"); 
            databasePage.classList.add("hidden");
            lightBulb.classList.remove("hidden"); 
  } 
  else
  {   
       inputDatabaseName.value=""; 
       inputDatabasePin.value=""; 
       inputDatabaseInterest.value="";
       inputDatabaseDeposit.value=""; 
  }
})     

// Lightbulb
const userInfo = (arr1,arr2) => 
{   detailsActual.innerHTML=""; 
    arr1.forEach((item,i) => 
      {
        detailsActual.innerHTML+=`<div class="username-and-pin"><p class="username">${item}</p><p class="pin">${arr2[i]}</p></div>`
      })
}
let glow = false; 
lightBulb.addEventListener("click",function()
{
  // Make it glow
  if(!glow)
  {
      lightBulb.innerHTML='<path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13h-5a.5.5 0 0 1-.46-.302l-.761-1.77a1.964 1.964 0 0 0-.453-.618A5.984 5.984 0 0 1 2 6zm3 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1-.5-.5z"/>'; 
      lightBulb.style.fill="#E9B824"; 
      detailsBox.style.opacity="100%"; 
      userInfo(usernamesArray,pinArray); 
  }
  // Does not make it glow
  else
  {
    lightBulb.innerHTML='<path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a1.964 1.964 0 0 0-.453-.618A5.984 5.984 0 0 1 2 6zm6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1z"/>'; 
    lightBulb.style.fill="black";
    detailsBox.style.opacity="0%"; 
  }
  glow=!glow; 
})






