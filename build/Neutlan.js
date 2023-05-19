NEUTLAN_URL = 'https://neutlan.com/api';
post = (endpoint, TOKEN = null, body = {}) => {
  var headers = {
    Accept: "application/json",
    "Content-Type": "application/json"
  }

  if (TOKEN != null) {
    headers['Authorization'] = 'Token ' + TOKEN;
  }

  return fetch(this.NEUTLAN_URL + endpoint, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body)
  })
}
let paragraph = "";
let sentencesArray = [];
var style = document.createElement('style');

// Set the style content to include the styles for the .span_neutlan class
style.textContent = `
.span_neutlan { 
  color: #0000ff00;
  font-size: xx-large;
  vertical-align: middle;
  line-height: initial;
}`;

// Add the style element to the document head
document.head.appendChild(style);
let styledTextElement = document.createElement('div');
styledTextElement.classList.add('neutlan_div');
let size = 'large';
let font = 'arial, sans-serif';
// Toke taken fromthe choreme storage you always loged in if you not delete chorome storage and logout
chrome.storage.local.get(['token', 'activated', 'color'], function (result) {
  let token = result.token;
  let checked = result.activated;
  let color = result.color;
  localStorage.setItem("token", token);
  localStorage.setItem("activated", checked)
  localStorage.setItem("color", color?color:"#00ff00")
});
// In your background page script

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (var key in changes) {
    if (key == 'activated') {
      localStorage.setItem("activated", changes[key].newValue);
      this.removeUnderline();
    }
    if (key == 'token') {
      chrome.storage.local.get("token", function (result) {
        if (result.token) {
          window.location.reload()
        }
      })

    }
    if (key == 'color') {
      chrome.storage.local.get("color", function (result) {
        if (result.color) {
          localStorage.setItem("color", result.color)
          changeColor()
        }
      })

    }
  }
});


// Define function to remove underline
function removeUnderline() {
  if (localStorage.getItem('activated') == "true") {
    chrome.storage.local.get("token", function (result) {
      if (result.token) {
        let token = result.token;
        const body = {
          content: paragraph,
        };
        post('/model/process', token, body)
          .then((response) => {
            if (response.ok) {
              return response.json().then((data) => {
                sentencesArray = data.file_content;
                styledTextElement.innerHTML = ""
                updateContainer();
              });

            } else {
              response.json().then((data) => {
              });
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    })
    this.updateContainer();
  } else {
    styledTextElement.innerHTML = ""
  }

}
function changeColor() {
  if (localStorage.getItem('activated') == "true") {
    this.updateContainer();
  } else {
    styledTextElement.innerHTML = ""
  }
}

updateContainer = () => {
  styledTextElement.innerHTML = ""
  const numberElement = document.createElement('div');
  let count = 0;
  numberElement.innerHTML = count;
  sentencesArray.map(async (index, number) => {
    const color = localStorage.getItem('color')
    if (index.biased) {
      count = 1 + count;
      numberElement.innerHTML = count;
      const spanElement = document.createElement('span');
      spanElement.classList.add('span_neutlan');
      spanElement.style.textDecoration = 'underline';
      spanElement.style.textDecorationThickness = '2px';
      spanElement.style.textDecorationColor = color;
      spanElement.style.fontSize = size;
      spanElement.style.lineHeight = size;
      spanElement.style.fontFamily = font;
      spanElement.innerHTML = index.content;
      styledTextElement.appendChild(spanElement);
    } else {
      // otherwise, apply default styles
      const spanElement = document.createElement('span');
      spanElement.classList.add('span_neutlan');
      spanElement.style.fontSize = size;
      spanElement.style.fontFamily = font;
      spanElement.style.lineHeight = size;
      spanElement.innerHTML = index.content;
      styledTextElement.appendChild(spanElement);
    }
    const format = `
      position: absolute;
      bottom: 4px;
      right: 5px;
      height: 30px;
      pointer-events: none;
      width: 30px;
      font-size: 15px;
      color: #fff;
      border-radius: 50%;
      display: flex;
      background-color: #313265;
      flex-wrap: nowrap;
      justify-content: space-around;
      align-items: center;
    `.trim();
    // Set the styles on the number element
    numberElement.style.cssText = format;
    styledTextElement.appendChild(numberElement);
  });


};

let prevParagraph = "";
let intervalId = null;

myEventListener = (event) => {
  chrome.storage.local.get("token", function (result) {
    if (result.token) {
      let token = result.token;
      paragraph = event.target.value;
      const textarea = event.target;
      const styles = window.getComputedStyle(textarea);
      styledTextElement.style.cssText = `
        position: absolute;
        inset: 0;
        pointer-events: none;
        height: ${styles.getPropertyValue('height')};
        box-sizing: ${styles.getPropertyValue('box-sizing')};
        width: ${styles.getPropertyValue('width')};
        font-size: ${styles.getPropertyValue('font-size')};
        line-height: ${styles.getPropertyValue('line-height')};
        font-family: ${styles.getPropertyValue('font-family')};
        padding-top: ${styles.getPropertyValue('padding-top')};
        padding-right: ${styles.getPropertyValue('padding-right')};
        padding-bottom: ${styles.getPropertyValue('padding-bottom')};
        padding-left: ${styles.getPropertyValue('padding-left')};
        margin-top: ${styles.getPropertyValue('margin-top')};
        margin-right: ${styles.getPropertyValue('margin-right')};
        margin-bottom: ${styles.getPropertyValue('margin-bottom')};
        margin-left: ${styles.getPropertyValue('margin-left')};
        z-index: 5;
        overflow: hidden;
        white-space: pre-wrap;
      `;
      size = window.getComputedStyle(textarea).getPropertyValue('font-size');
      font = window.getComputedStyle(textarea).getPropertyValue('font-family');
      parent = textarea.parentNode;
      parent.appendChild(styledTextElement);
      let isExecuted = false;

      let checked;
      if (localStorage.getItem("activated") == "true") {
        checked = true
      } else {
        checked = false
      }

      clearInterval(intervalId);
      intervalId = setInterval(() => {
        paragraph = event.target.value;
        if (paragraph !== prevParagraph && checked) {
          styledTextElement.innerHTML = "";
          const body = {
            content: paragraph,
          };
          chrome.storage.local.get("token", function (result) {
            if (result.token) {
              let token = result.token;
              post('/model/process', token, body)
                .then((response) => {
                  if (response.ok) {
                    return response.json().then((data) => {
                      sentencesArray = data.file_content;
                      styledTextElement.innerHTML = ""
                      updateContainer();
                      prevParagraph = paragraph;
                    });

                  } else {
                    response.json().then((data) => {
                    });
                  }
                })
                .catch((error) => {
                  console.error("Error:", error);
                });

            }
          }
          )

        }
      }, 2000);
    }
  });
};

window.addEventListener("keyup", myEventListener);


