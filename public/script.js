const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition
const speech = new SpeechRecognition()
$(document).ready(selectCourses())

async function selectCourses() {
  // Get courses from db and create options for them
  let courseOptions = await requestCourses()
  console.log('Courses: ' + courseOptions)
  let dropdown = document.getElementById('course')
  for (let option of courseOptions) {
    let newOption = document.createElement('option')
    newOption.value = option.id
    newOption.textContent = option.display
    dropdown.appendChild(newOption)
  }
}

async function requestCourses() {
  // Request courses from DB
  const response = await axios.get('http://localhost:3000/api/v1/courses')
  return response.data
} //'https://json-server-1ugqwq--3000.local.webcontainer.io/api/v1/courses'

$('#course').on('change', (ev) => {
  // Shows the uvuId text entry if a course is selected and hides it if none is selected.
  let div = document.getElementById('idDiv')

  if (ev.target.value === '') {
    //Default value is selected
    div.classList.add('hidden')
  } else {
    div.classList.remove('hidden')
  }
})

$('#uvuId').on('input', (ev) => {
  // Checks id to make sure it doesn't exceed 8 chars, is only digits, and fires off an ajax call if 8 valid characters are sent back.
  let warningMsg = $('#idWarning')
  let uvuId = ev.target.value
  if (uvuId.length > 8) {
    warningMsg.removeClass('hidden')
    warningMsg.text('Your id should only be 8 digits long')
    ev.target.value = uvuId.slice(0, 8)
  } else if (uvuId.length < 8) {
    let re = /^\d*$/
    if (re.test(uvuId)) {
      //All is good. Continue
    } else {
      warningMsg.removeClass('hidden')
      warningMsg.text('Your id can only consist of digits')
      $('#submitButton')[0].disabled = true
      $('#dictateButton')[0].disabled = true
    }
  } else {
    let re = /^\d\d\d\d\d\d\d\d$/gm
    if (re.test(uvuId)) {
      console.log('ajax call')
      requestLogs()
    } else {
      warningMsg.removeClass('hidden')
      warningMsg.text('Your id should consist of 8 digits')
      $('#submitButton')[0].disabled = true
      $('#dictateButton')[0].disabled = true
    }
  }
})

function addLog(container, log) {
  // Helper function to add a json log to the list of logs on the page
  $('#logDiv').removeClass('hidden')
  let logElem = document.createElement('li')
  //$(logElem).addClass('clickToHide')
  $(logElem).html(
    `<div class="clickToHide"><div><small>${log.date}</small></div><div class="hideDiv"><pre><p class="break-all w-1/1 inline-block whitespace-pre-line">${log.text}</p></pre><p class="bg-[#275d38] text-sm readDiv z-10 p-2 mt-3 hover:bg-green-700
    active:bg-green-900 active:border-1 w-fit text-white" >Read It</p></div><hr class="my-5 border-gray-500"></div>`
  )
  container[0].appendChild(logElem)
}

async function requestLogs() {
  // Requests the log data from the server
  var requestUrl = `http://localhost:3000/logs?courseId=${$(
    '#course'
  ).val()}&uvuId=${$('#uvuId').val()}`
  //`https://json-server-1ugqwq--3000.local.webcontainer.io/logs?courseId=${$(
  const requestedLogs = await axios.get(requestUrl)
  let retrievedLogs = requestedLogs.data
  let logList = $('#logDiv > ul')
  if (retrievedLogs.length === 0) {
    logList.html(`<p>No data found for the entered ID</p>`)
  } else {
    logList.html('')
    console.log(retrievedLogs)
    for (let log of retrievedLogs) {
      addLog(logList, log)
    }
    $('.clickToHide').forEach((toggleHide) => {
      $(toggleHide).on('click', (ev) => {
        if (ev.target.classList.contains('readDiv')) {
          let logText = ev.target.previousSibling.firstChild
          speak(logText.innerText)
        } else {
          let logText = toggleHide.querySelector('.hideDiv')
          let timestamp = toggleHide.querySelector('small')
          if ($(logText).hasClass('hidden')) {
            $(logText).removeClass('hidden')
            $(timestamp).removeClass('mt-2')
          } else {
            $(logText).addClass('hidden')
            $(timestamp).addClass('mt-3')
          }
        }
      })
    })
    $('#uvuIdDisplay').html(
      `Student Logs for ${document.getElementById('uvuId').value}`
    )
    $('#submitButton')[0].disabled = false
    $('#dictateButton')[0].disabled = false
  }
}

$('#logForm').on('submit', async (ev) => {
  // Submit handler. Creates object from the form data, submits to the db and then displays the data.
  ev.preventDefault()
  ev.stopPropagation()
  $('#confirmSound').play()
  const self = this
  let submitDate = new Date().toLocaleString()
  submitDate = submitDate.replace(',', '')
  let newLog = {
    courseId: ev.target[0].value,
    uvuId: ev.target[1].value,
    date: submitDate,
    text: ev.target[2].value,
    id: createUUID(),
  }
  await axios
    .post('http://localhost:3000/logs', newLog)
    .then(function (response) {
      console.log(response), self.requestLogs()
    })
})

function createUUID() {
  // Create a unique ID for each new log
  return 'xxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function speak(text) {
  window.speechSynthesis.cancel()
  if ('speechSynthesis' in window) {
    // Speech Synthesis supported 🎉
    var msg = new SpeechSynthesisUtterance()
    msg.text = text
    window.speechSynthesis.speak(msg)
  } else {
    // Speech Synthesis Not Supported 😣
    alert("Sorry, your browser doesn't support text to speech!")
  }
}

$('.dictateButton').on('click', (ev) => {
  listen()
})

function listen() {
  speech.start()
}

speech.onresult = (event) => {
  let result = event.results[0][0].transcript
  result = result.charAt(0).toUpperCase() + result.slice(1)
  $('#logEntry').text(result)
  speech.stop()
}

// DONE: Wire up the app's behavior here.
