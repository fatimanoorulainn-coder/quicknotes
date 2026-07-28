const BASE = 'https://quicknotes-opal.vercel.app'

function showTab(tab) {
  document.getElementById('view-section').style.display = tab === 'view' ? 'block' : 'none'
  document.getElementById('add-section').style.display = tab === 'add' ? 'block' : 'none'
  document.getElementById('tab-view').className = 'tab' + (tab === 'view' ? ' active' : '')
  document.getElementById('tab-add').className = 'tab' + (tab === 'add' ? ' active' : '')
}

async function loadNotes() {
  const list = document.getElementById('notes-list')
  try {
    const res = await fetch(BASE + '/api/notes', { credentials: 'include' })
    if (res.status === 401) {
      list.innerHTML = '<p class="login-msg">Please sign in at <a href="' + BASE + '/login" target="_blank">quicknotes-opal.vercel.app</a> first</p>'
      return
    }
    const notes = await res.json()
    if (notes.length === 0) {
      list.innerHTML = '<p class="login-msg">No notes yet. Add one!</p>'
      return
    }
    list.innerHTML = notes.map(function(n) {
      return '<div class="note"><div class="note-title">' + n.title + '</div><div class="note-content">' + n.content + '</div></div>'
    }).join('')
  } catch (e) {
    list.innerHTML = '<p class="error">Could not load notes. Are you signed in?</p>'
  }
}

async function addNote() {
  const title = document.getElementById('title').value.trim()
  const content = document.getElementById('content').value.trim()
  const status = document.getElementById('status')
  if (!title || !content) {
    status.className = 'error'
    status.textContent = 'Please fill in both fields'
    return
  }
  try {
    const res = await fetch(BASE + '/api/notes', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    })
    if (res.status === 401) {
      status.className = 'error'
      status.textContent = 'Please sign in first'
      return
    }
    status.className = 'status'
    status.textContent = 'Note added!'
    document.getElementById('title').value = ''
    document.getElementById('content').value = ''
    setTimeout(function() { status.textContent = '' }, 2000)
  } catch (e) {
    status.className = 'error'
    status.textContent = 'Failed to add note'
  }
}

loadNotes()
