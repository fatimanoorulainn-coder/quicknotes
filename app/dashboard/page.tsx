'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState([])
  const supabase = createClient()
  const router = useRouter()

  function addToast(message, type) {
    if (!type) type = 'success'
    const id = Date.now()
    setToasts(function(prev) { return [...prev, { id, message, type }] })
    setTimeout(function() { setToasts(function(prev) { return prev.filter(function(t) { return t.id !== id }) }) }, 3000)
  }

  useEffect(function() {
    fetchNotes()
    var channel = supabase
      .channel('realtime-notes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Note' }, function() { fetchNotes(); addToast('Note added!', 'success') })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Note' }, function() { fetchNotes(); addToast('Note updated!', 'info') })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'Note' }, function() { fetchNotes(); addToast('Note deleted!', 'delete') })
      .subscribe()
    return function() { supabase.removeChannel(channel) }
  }, [])

  async function fetchNotes() {
    const res = await fetch('/api/notes')
    const data = await res.json()
    setNotes(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    if (editing) {
      await fetch('/api/notes/' + editing.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content }) })
      setEditing(null)
    } else {
      await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content }) })
    }
    setTitle('')
    setContent('')
    setLoading(false)
  }

  async function handleDelete(id) {
    await fetch('/api/notes/' + id, { method: 'DELETE' })
  }

  function startEdit(note) {
    setEditing(note)
    setTitle(note.title)
    setContent(note.content)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='fixed top-4 right-4 z-50 space-y-2'>
        {toasts.map(function(toast) { return (
          <div key={toast.id} className={'px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ' + (toast.type === 'success' ? 'bg-green-500' : toast.type === 'delete' ? 'bg-red-500' : 'bg-blue-500')}>
            {toast.message}
          </div>
        )})}
      </div>
      <nav className='bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm'>
        <div>
          <h1 className='text-xl font-bold text-gray-900'>My Notes</h1>
          <p className='text-xs text-green-500 font-medium'>Live updates enabled</p>
        </div>
        <button onClick={handleSignOut} className='bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition'>Sign Out</button>
      </nav>
      <div className='max-w-2xl mx-auto p-6'>
        <div className='bg-white rounded-2xl shadow p-6 mb-8'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>{editing ? 'Edit Note' : 'New Note'}</h2>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Title</label>
              <input placeholder='Enter a title...' value={title} onChange={function(e) { setTitle(e.target.value) }} className='w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black text-sm' required />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Content</label>
              <textarea placeholder='Write something...' value={content} onChange={function(e) { setContent(e.target.value) }} className='w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black text-sm h-28 resize-none' required />
            </div>
            <div className='flex gap-3'>
              <button type='submit' disabled={loading} className='bg-black hover:bg-gray-800 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50'>{loading ? 'Saving...' : editing ? 'Update Note' : 'Add Note'}</button>
            </div>
          </form>
        </div>
        <div className='space-y-4'>
          {notes.length === 0 ? <div className='text-center py-16 text-gray-400'><p className='text-4xl mb-3'>No notes yet</p></div> : null}
          {notes.map(function(note) { return (
            <div key={note.id} className='bg-white rounded-2xl shadow p-5 border border-gray-100'>
              <h3 className='font-semibold text-gray-900 text-base'>{note.title}</h3>
              <p className='text-gray-600 text-sm mt-2 leading-relaxed'>{note.content}</p>
              <div className='flex gap-3 mt-4'>
                <button onClick={function() { startEdit(note) }} className='bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium text-sm px-4 py-1.5 rounded-lg transition'>Edit</button>
                <button onClick={function() { handleDelete(note.id) }} className='bg-red-50 hover:bg-red-100 text-red-500 font-medium text-sm px-4 py-1.5 rounded-lg transition'>Delete</button>
              </div>
            </div>
          )})  }
        </div>
      </div>
    </div>
  )
}