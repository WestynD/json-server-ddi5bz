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
  const response = await axios.get(
    'https://json-server-1ugqwq--3000.local.webcontainer.io/api/v1/courses'
  )
  return response.data
}

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
    }
  } else {
    let re = /^\d\d\d\d\d\d\d\d$/gm
    if (re.test(uvuId)) {
      console.log('ajax call')
      requestLogs()
    } else {
      warningMsg.removeClass('hidden')
      warningMsg.text('Your id should consist of 8 digits')
    }
  }
})

function addLog(container, log) {
  // Helper function to add a json log to the list of logs on the page
  $('#logDiv').removeClass('hidden')
  let logElem = document.createElement('li')
  $(logElem).addClass('clickToHide')
  $(logElem).html(
    `<div><small>${log.date}</small></div><pre><p class="break-all w-1/1 inline-block whitespace-pre-line">${log.text}</p></pre><hr class="my-5 border-gray-500">`
  )
  container[0].appendChild(logElem)
}

async function requestLogs() {
  // Requests the log data from the server
  var requestUrl = `https://json-server-1ugqwq--3000.local.webcontainer.io/logs?courseId=${$(
    '#course'
  ).val()}&uvuId=${$('#uvuId').val()}`
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
        let logText = toggleHide.querySelector('p')
        let timestamp = toggleHide.querySelector('small')
        if ($(logText).hasClass('hidden')) {
          $(logText).removeClass('hidden')
          $(timestamp).removeClass('mt-2')
        } else {
          $(logText).addClass('hidden')
          $(timestamp).addClass('mt-3')
        }
      })
    })
    $('#uvuIdDisplay').html(
      `Student Logs for ${document.getElementById('uvuId').value}`
    )
    $('#submitButton')[0].disabled = false
  }
}

$('#logForm').on('submit', async (ev) => {
  // Submit handler. Creates object from the form data, submits to the db and then displays the data.
  ev.preventDefault()
  ev.stopPropagation()
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
    .post('https://json-server-1ugqwq--3000.local.webcontainer.io/logs', newLog)
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

// DONE: Wire up the app's behavior here.
