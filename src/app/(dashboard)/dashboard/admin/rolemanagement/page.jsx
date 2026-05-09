'use client'
import PromoteUserForm from '@/components/forms/PromoteUserForm'
import CreateUserForm from '@/components/forms/CreateUserForm'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { RiUserSharedLine, RiUserAddLine, RiArchiveLine, RiShieldUserLine } from 'react-icons/ri'

const RolemanagementPage = () => {
  const [staffs, setStaffs] = useState([])
  const [isPromoteBox, setIsPromoteBox] = useState(false)
  const [isCreateBox, setIsCreateBox] = useState(false)
  const [loadingId, setLoadingId] = useState(null)

  const fetchStaff = async () => {
    try {
      const response = await axios.get('/api/user', { withCredentials: true })
      setStaffs(response.data.payload || [])
    } catch (error) {
      console.log(error)
      setStaffs([])
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const removeStaff = async (id) => {
    if (!window.confirm("Are you sure you want to demote this user to standard 'user' role?")) return;
    setLoadingId(id)
    try {
      await axios.put('/api/user', { user_id: id, role: 'user' }, { withCredentials: true })
      toast.success("User demoted successfully")
      fetchStaff()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to demote user')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className='w-full max-w-7xl mx-auto flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2'>
            <RiShieldUserLine className='text-sky-500' />
            Role Management
          </h1>
          <p className='text-sm text-slate-500 mt-1'>Manage your team and their permissions</p>
        </div>
        <div className='flex items-center gap-3'>
          <button 
            onClick={() => setIsPromoteBox(true)}
            className='flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-colors active:scale-95 whitespace-nowrap border border-slate-200'
          >
            <RiUserSharedLine size={20} className='text-sky-500' />
            <span>Promote Existing</span>
          </button>
          <button 
            onClick={() => setIsCreateBox(true)}
            className='flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-200 active:scale-95 whitespace-nowrap'
          >
            <RiUserAddLine size={20} />
            <span>Create New</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden'>
        {staffs.filter(u => u.role !== 'user').length === 0 ? (
          <div className='w-full h-64 flex flex-col items-center justify-center text-center gap-3 p-6'>
            <div className='w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400'>
              <RiArchiveLine size={32} />
            </div>
            <div>
              <p className='text-slate-600 font-semibold'>No Admin/Staff Found</p>
              <p className='text-slate-400 text-sm mt-1'>Create or promote a user to give them dashboard access.</p>
            </div>
          </div>
        ) : (
          <div className='w-full overflow-x-auto'>
            <table className='w-full text-left border-collapse min-w-[600px]'>
              <thead>
                <tr className='bg-slate-50 border-b border-slate-100'>
                  <th className='py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider'>User</th>
                  <th className='py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider'>Role</th>
                  <th className='py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider'>Status</th>
                  <th className='py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {staffs.filter(u => u.role !== 'user').map((staff) => (
                  <tr key={staff.user_id} className='hover:bg-slate-50/50 transition-colors group'>
                    <td className='py-4 px-6'>
                      <div className='flex flex-col'>
                        <span className='font-semibold text-slate-800'>{staff.name}</span>
                        <span className='text-xs text-slate-400'>{staff.email}</span>
                      </div>
                    </td>
                    <td className='py-4 px-6'>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        staff.role === 'admin' ? 'bg-rose-50 text-rose-600' :
                        staff.role === 'manager' ? 'bg-sky-50 text-sky-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {staff.role}
                      </span>
                    </td>
                    <td className='py-4 px-6'>
                      <span className={`w-2 h-2 rounded-full inline-block mr-2 ${staff.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      <span className='text-sm text-slate-600'>{staff.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className='py-4 px-6 text-right'>
                      <button 
                        disabled={loadingId === staff.user_id}
                        onClick={() => removeStaff(staff.user_id)}
                        className='inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50 text-xs font-bold uppercase'
                        title="Demote User"
                      >
                        Demote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Promote Modal */}
      {isPromoteBox && (
        <div className='fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
            <PromoteUserForm 
              onSuccess={() => {
                setIsPromoteBox(false)
                fetchStaff()
              }} 
              onCancel={() => setIsPromoteBox(false)} 
            />
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateBox && (
        <div className='fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
            <CreateUserForm 
              onSuccess={() => {
                setIsCreateBox(false)
                fetchStaff()
              }} 
              onCancel={() => setIsCreateBox(false)} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default RolemanagementPage
