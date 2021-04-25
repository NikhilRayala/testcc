

//
// Event listener registration
//

// Hooks the onLoad function to the DOMContentLoaded event.
document.addEventListener('DOMContentLoaded', onLoad);

//
// Elements
//

/** @type {HTMLElement} */
let emailForm;

/** @type {HTMLElement} */
let formSubmitted;

/** @type {HTMLElement} */
let submitFormButton;

//
// Functions
//

/**
 * Fires as soon as the DOM is loaded.
 */
async function onLoad() {
  document.getElementById('name').addEventListener('keydown', limitCharacterInput);

  const collegeLocations = await (await fetch('./assets/college-locations.json')).json();

  // Grab the datalist and remove its ID (destroying the select-datalist relationship),
  // to improve performance while adding the options to the datalist.
  const collegeDataList = document.getElementById('colleges');
  collegeDataList.removeAttribute('id');

  // Add all colleges as datalist options. We use a document fragment because the
  // DOM is slow if we add each option individually and let the DOM update in between.
  const fragment = document.createDocumentFragment();
  collegeLocations.forEach((location) => {
    const newOption = document.createElement('option');
    newOption.setAttribute('data-value', location.UNITID);
    newOption.value = location.NAME;

    fragment.appendChild(newOption);
  });

  // Add the options and restore the select-datalist relationship.
  collegeDataList.appendChild(fragment);
  collegeDataList.setAttribute('id', 'colleges');

  // When users submit the form, initiate form validation.
  emailForm = document.getElementById('email-form');
  submitFormButton = document.getElementById('form-submit');
  formSubmitted = document.getElementById('form-submitted');
  submitFormButton.addEventListener('click', submitForm);
}

/**
 * On click of the submit button, validate form data and send data to the servlet.
 */
async function submitForm() {
  // Disable multiple submissions.
  submitFormButton.disabled = true;

  if (validateForm()) {
    emailForm.action = '/user';

    // Based on user subscribing or unsubscribing, show confirmation that form
    // was submitted and submit the form.
    const submittedConfirmationMessage = document.getElementById('subscribe').checked ?
      'thanks for joining the noms fam! check your email for a subscription confirmation!' :
      'hope you have enjoyed your time with noms!';
    document.getElementById('confirmation-text').innerHTML = submittedConfirmationMessage;
    formSubmitted.style.display = 'block';
    emailForm.submit();
  } else {
    submitFormButton.disabled = false;
  }
}

/**
 * Goes through the form elements and marks the invalid inputs.
 * @return {boolean} whether all the inputs are valid
 */
function validateForm() {
  const invalidIds = [];
  const errorMessages = [];
  const formElements = emailForm.elements;

  disableInjection(formElements);
  validateFormText(invalidIds, errorMessages, formElements);
  validateFormEmail(invalidIds, errorMessages, formElements);
  validateFormCollege(invalidIds, errorMessages, formElements);
  // validateFormRadioButtons(invalidIds, errorMessages, formElements);
  validateFormPassword(invalidIds, errorMessages, formElements);
  markInvalidInputs(invalidIds, errorMessages, formElements);

  return (invalidIds.length === 0);
}

/**
 * Checks if the email is valid.
 * @param {Array<string>} invalidIds - ids of invalid inputs
 * @param {Array<string>} errorMessages - error messages of invalid inputs
 * @param {Array<HTMLElement>} formElements - email form input elements
 */
function validateFormEmail(invalidIds, errorMessages, formElements) {
  const email = formElements.namedItem('email').value;
  const emailPattern = /^[a-zA-Z0-9._-]+@asu.edu$/;
  if (!emailPattern.test(email)) {
    invalidIds.push('email');
    errorMessages.push('email must follow @asu.edu');
  }
}

/**
 * Checks if at least one radio button has been checked.
 * @param {Array<string>} invalidIds - ids of invalid inputs
 * @param {Array<string>} errorMessages - error messages of invalid inputs
 * @param {Array<HTMLElement>} formElements - email form input elements
 */
// function validateFormRadioButtons(invalidIds, errorMessages, formElements) {
//   const subscribeRadioButton = formElements.namedItem('email-notif')[0].checked;
//   const unsubscribeRadioButton = formElements.namedItem('email-notif')[1].checked;

//   if (!subscribeRadioButton && !unsubscribeRadioButton) {
//     invalidIds.push('subscribe');
//     errorMessages.push('must pick to subscribe or unsubscribe');
//   }
// }

/**
 * Check if form text elements have been filled out completely.
 * @param {Array<string>} invalidIds - ids of invalid inputs
 * @param {Array<string>} errorMessages - error messages of invalid inputs
 * @param {Array<HTMLElement>} formElements - email form input elements
 */
function validateFormText(invalidIds, errorMessages, formElements) {
  // Checks if any text elements are blank.
  for (let i = 0; i < formElements.length; i++) {
    if (formElements[i].type === 'text' || formElements[i].type === 'email' || formElements[i].type === 'password') {
      if (!formElements[i].value.trim()) {
        invalidIds.push(formElements[i].id);
        const errorMessage = formElements[i].name + ' is blank';
        errorMessages.push(errorMessage);
      }
    }
  }
}

/**
 * Check if valid college.
 * @param {Array<string>} invalidIds - ids of invalid inputs
 * @param {Array<string>} errorMessages - error messages of invalid inputs
 * @param {Array<HTMLElement>} formElements - email form input elements
 */
function validateFormCollege(invalidIds, errorMessages, formElements) {
  const collegeName = document.getElementById('colleges-input-form').value;
  const option = document.querySelector(`#colleges option[value='${collegeName}']`);

  if (option) {
    const collegeId = option.dataset.value;
    const selectedCollege = document.getElementById('cID');
    selectedCollege.value = collegeId;
  } else {
    invalidIds.push(formElements.namedItem('colleges').id);
    const errorMessage = 'we currently do not support that college; ' +
     'please pick college from given list';
    errorMessages.push(errorMessage);
  }
}

/**
 * Check if Passwords match or not.
 * @param {Array<string>} invalidIds - ids of invalid inputs
 * @param {Array<string>} errorMessages - error messages of invalid inputs
 * @param {Array<HTMLElement>} formElements - email form input elements
 */

function validateFormPassword(invalidIds, errorMessages, formElements){
  const newpassword = document.getElementById('newpassword').value;
  const confirmpassword = document.getElementById('confirmpassword').value;
  if (!(newpassword == confirmpassword)){
    const errorMessage = 'The Password and Confirm Password does not match'
    errorMessages.push(errorMessage);
  }
}

/**
 * Highlight invalid inputs with a red background and
 * adds error messages.
 * @param {Array<string>} invalidIds - ids of invalid inputs
 * @param {Array<string>} errorMessages - error messages of invalid inputs
 * @param {Array<HTMLElement>} formElements - email form input elements
 */
function markInvalidInputs(invalidIds, errorMessages, formElements) {
  resetMarks(formElements);
  invalidIds.forEach((id) => {
    const element = formElements.namedItem(id);
    if (element) {
      element.style.background = '#ff999966';
    }
  });
  if (errorMessages.length > 0) {
    const formError = document.createElement('div');
    formError.setAttribute('id', 'form-input-error');
    formError.innerHTML += '<ul>';
    errorMessages.forEach((message) => {
      formError.innerHTML += '<li>' + message + '</li>';
    });
    formError.innerHTML += '</ul>';
    emailForm.insertBefore(formError, submitFormButton);
  }
}

/**
 * Goes through the elements and encodes common HTML enities.
 * By using these codes, ensures that the user's inputs are seen as data, not code.
 * This is a measure against a malicious users trying to changing site data.
 * @param {Array<HTMLElement>} formElements - email form input elements
 */
function disableInjection(formElements) {
  for (let i = 0; i < formElements.length - 1; i++) {
    let elementValue = formElements[i].value;
    elementValue = elementValue.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    elementValue = elementValue.replace(/&/g, '&amp;');
    elementValue = elementValue.replace(/"/g, '&quot;');
    elementValue = elementValue.replace(/'/g, '&#x27;');
  }
}

/**
 * Resets all the input backgrounds and gets rid of previous error text.
 * @param {Array<HTMLElement>} formElements - email form input elements
 */
function resetMarks(formElements) {
  for (let i = 0; i < formElements.length - 1; i++) {
    const element = formElements[i];
    element.style.background = '#1b18181a';
  }
  const formError = document.getElementById('form-input-error');
  if (formError) {
    emailForm.removeChild(formError);
  }
}

/**
 * Limits the input of a textbox to a specified regex.
 * @param {KeyboardEvent} e - The keypress event.
 */
function limitCharacterInput(e) {
  const regex = RegExp('[a-zA-Z .,\'-]');

  if (!regex.test(e.key) && e.key != 'backspace' && e.key.length == 1) {
    e.preventDefault();
  }
}
