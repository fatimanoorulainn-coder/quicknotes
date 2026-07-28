'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ActivityCanvas from '@/app/components/ActivityCanvas'
export default function Dashboard() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState([])
  const [events, setEvents] = useState([])
  const supabase = createClient()
  const router = useRouter()
  function addToast(msg, type) {
    if (!type) type = 'success'
    const id = Date.now()
    setToasts(function(p) { return [...p, {id, message: msg, type}] })
    setTimeout(function() { setToasts(function(p) { return p.filter(function(t) { return t.id !== id }) }) }, 3000)
  }
  function addEvent(type) { setEvents(function(p) { return [...p, {type: type, time: Date.now()}] }) }
  useEffect(function() {
    fetchNotes()
    var ch = supabase.channel('realtime-notes')
      .on('postgres_changes', {event:'INSERT',schema:'public',table:'Note'}, function() { fetchNotes(); addToast('Note added!','success'); addEvent('add') })
      .on('postgres_changes', {event:'UPDATE',schema:'public',table:'Note'}, function() { fetchNotes(); addToast('Note updated!','info'); addEvent('update') })
      .on('postgres_changes', {event:'DELETE',schema:'public',table:'Note'}, function() { fetchNotes(); addToast('Note deleted!','delete'); addEvent('delete') })
      .subscribe()
    return function() { supabase.removeChannel(ch) }
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
      await fetch('/api/notes/'+editing.id, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,content})})
      setEditing(null)
    } else {
      await fetch('/api/notes', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,content})})
    }
    setTitle(''); setContent(''); setLoading(false)
  }
  async function handleDelete(id) { await fetch('/api/notes/'+id, {method:'DELETE'}) }
  function startEdit(note) { setEditing(note); setTitle(note.title); setContent(note.content) }
  async function handleSignOut() { await supabase.auth.signOut(); router.push('/login') }
  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='fixed top-4 right-4 z-50 space-y-2'>
        {toasts.map(function(t) { return <div key={t.id} className={'px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white '+(t.type==='success'?'bg-green-500':t.type==='delete'?'bg-red-500':'bg-blue-500')}>{t.message}</div> })}
      </div>
      <nav className='bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm'>
        <div><h1 className='text-xl font-bold text-gray-900'>My Notes</h1><p className='text-xs text-green-500 font-medium'>Live updates enabled</p></div>
        <button onClick={handleSignOut} className='bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg'>Sign Out</button>
      </nav>
      <div className='max-w-2xl mx-auto p-6'>
        <div className='bg-white rounded-2xl shadow p-4 mb-6'>
          <p className='text-sm font-semibold text-gray-700 mb-2'>Live Activity Chart</p>
          <div className='flex gap-3 text-xs text-gray-500 mb-2'>
            <span><span className='inline-block w-3 h-3 rounded bg-green-500 mr-1'></span>Added</span>
            <span><span className='inline-block w-3 h-3 rounded bg-blue-500 mr-1'></span>Updated</span>
            <span><span className='inline-block w-3 h-3 rounded bg-red-500 mr-1'></span>Deleted</span>
          </div>
          <ActivityCanvas events={events} />
        </div>
        <div className='bg-white rounded-2xl shadow p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>{editing ? 'Edit Note' : 'New Note'}</h2>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div><label className='block text-sm font-medium text-gray-700 mb-1'>Title</label>
              <input placeholder='Enter a title...' value={title} onChange={function(e){setTitle(e.target.value)}} className='w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm' required /></div>
            <div><label className='block text-sm font-medium text-gray-700 mb-1'>Content</label>
              <textarea placeholder='Write something...' value={content} onChange={function(e){setContent(e.target.value)}} className='w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm h-28 resize-none' required /></div>
            <div className='flex gap-3'>
              <button type='submit' disabled={loading} className='bg-black hover:bg-gray-800 text-white font-medium px-5 py-2.5 rounded-lg text-sm disabled:opacity-50'>{loading?'Saving...':editing?'Update Note':'Add Note'}</button>
              {editing ? <button type='button' onClick={function(){setEditing(null);setTitle('');setContent('')}} className='bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm'>Cancel</button> : null}
            </div>
          </form>
        </div>
        <div className='space-y-4'>
          {notes.length===0 ? <div className='text-center py-16 text-gray-400'><p className='text-4xl mb-3'>No notes yet</p></div> : null}
          {notes.map(function(note) { return (
            <div key={note.id} className='bg-white rounded-2xl shadow p-5 border border-gray-100'>
              <h3 className='font-semibold text-gray-900'>{note.title}</h3>
              <p className='text-gray-600 text-sm mt-2'>{note.content}</p>
              <div className='flex gap-3 mt-4'>
                <button onClick={function(){startEdit(note)}} className='bg-blue-50 text-blue-600 text-sm px-4 py-1.5 rounded-lg'>Edit</button>
                <button onClick={function(){handleDelete(note.id)}} className='bg-red-50 text-red-500 text-sm px-4 py-1.5 rounded-lg'>Delete</button>
              </div>
            </div>
          )})}
        </div>
      </div>
    </div>
  )
}