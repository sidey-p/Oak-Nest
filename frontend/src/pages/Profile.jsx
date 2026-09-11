import { useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/common/UI';

const TABS = ['Personal Info', 'Addresses', 'Change Password', 'My Design Requests'];

const Profile = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState({ first_name: '', last_name: '', phone: '' });
  const [profileMsg, setProfileMsg] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addrForm, setAddrForm] = useState(null);
  const [addrMsg, setAddrMsg] = useState(null);
  const [pwd, setPwd] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) setProfile({ first_name: user.first_name, last_name: user.last_name, phone: user.phone || '' });
  }, [user]);

  const loadAddresses = async () => {
    try {
      const { data } = await api.get('/addresses');
      setAddresses(data.addresses);
    } catch {}
  };

  const loadRequests = async () => {
    try {
      const { data } = await api.get('/custom-designs/mine');
      setRequests(data.requests);
    } catch {}
  };

  useEffect(() => {
    Promise.all([loadAddresses(), loadRequests()]).finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      await updateProfile(profile);
      setProfileMsg({ type: 'success', text: 'Profile updated ✓' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: errorMessage(err) });
    }
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    setAddrMsg(null);
    try {
      if (addrForm.id) {
        await api.put(`/addresses/${addrForm.id}`, addrForm);
      } else {
        await api.post('/addresses', addrForm);
      }
      setAddrForm(null);
      loadAddresses();
    } catch (err) {
      setAddrMsg({ type: 'error', text: errorMessage(err) });
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      loadAddresses();
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const setDefault = async (id) => {
    await api.put(`/addresses/${id}/default`);
    loadAddresses();
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (pwd.new_password !== pwd.confirm) return setPwdMsg({ type: 'error', text: 'Passwords do not match' });
    try {
      const { data } = await api.put('/auth/change-password', { current_password: pwd.current_password, new_password: pwd.new_password });
      setPwdMsg({ type: 'success', text: data.message });
      setPwd({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: errorMessage(err) });
    }
  };

  if (loading) return <div className="min-h-[50vh] grid place-items-center"><Spinner /></div>;

  const input = 'mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none transition-all focus:border-accent-500 focus:shadow-glow';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="reveal font-serif text-3xl font-bold text-brand-900">My Profile</h1>
      <p className="mt-1 text-sm text-brand-500">{user?.email}</p>

      <div className="reveal mt-8 flex gap-1 overflow-x-auto rounded-full bg-brand-100 p-1">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`flex-1 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold sm:text-sm transition-all duration-300 ${tab === i ? 'bg-white shadow-soft text-brand-900 scale-[1.02]' : 'text-brand-500 hover:text-brand-800'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 0 && (
          <form onSubmit={saveProfile} className="max-w-md space-y-5 reveal rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-semibold">First name</label><input required value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} className={input} /></div>
              <div><label className="text-sm font-semibold">Last name</label><input required value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} className={input} /></div>
            </div>
            <div><label className="text-sm font-semibold">Phone</label><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={input} /></div>
            <div><label className="text-sm font-semibold">Email</label><input disabled value={user?.email || ''} className={`${input} bg-brand-50 text-brand-400`} /></div>
            {profileMsg && <Alert type={profileMsg.type}>{profileMsg.text}</Alert>}
            <button className="btn-shine rounded-full bg-brand-900 px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md">Save Changes</button>
          </form>
        )}

        {tab === 1 && (
          <div className="space-y-4">
            {addrMsg && <Alert type={addrMsg.type}>{addrMsg.text}</Alert>}
            {addresses.map((a) => (
              <div key={a.id} className="card-lift flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-white p-5 shadow-soft">
                <div className="text-sm">
                  <p className="font-semibold">{a.full_name} {a.is_default && <span className="ml-2 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-700">DEFAULT</span>}</p>
                  <p className="text-brand-600">{a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ''}, {a.city}, {a.state} — {a.postal_code}</p>
                  <p className="text-brand-500">{a.phone} · {a.country}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  {!a.is_default && <button onClick={() => setDefault(a.id)} className="rounded-full border border-brand-300 px-3 py-1.5 font-semibold transition hover:border-accent-500 hover:bg-brand-50">Set Default</button>}
                  <button onClick={() => setAddrForm(a)} className="rounded-full border border-brand-300 px-3 py-1.5 font-semibold transition hover:border-accent-500 hover:bg-brand-50">Edit</button>
                  <button onClick={() => deleteAddress(a.id)} className="rounded-full border border-red-200 px-3 py-1.5 font-semibold text-red-600 transition hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}

            {addrForm ? (
              <form onSubmit={saveAddress} className="grid gap-4 reveal rounded-2xl border border-brand-200 bg-white p-6 shadow-soft sm:grid-cols-2">
                <input required placeholder="Full name" value={addrForm.full_name} onChange={(e) => setAddrForm({ ...addrForm, full_name: e.target.value })} className={input} />
                <input required placeholder="Phone" value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} className={input} />
                <input required placeholder="Address line 1" value={addrForm.address_line1} onChange={(e) => setAddrForm({ ...addrForm, address_line1: e.target.value })} className={`${input} sm:col-span-2`} />
                <input placeholder="Address line 2" value={addrForm.address_line2 || ''} onChange={(e) => setAddrForm({ ...addrForm, address_line2: e.target.value })} className={`${input} sm:col-span-2`} />
                <input required placeholder="City" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} className={input} />
                <input required placeholder="State" value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} className={input} />
                <input required placeholder="PIN code" value={addrForm.postal_code} onChange={(e) => setAddrForm({ ...addrForm, postal_code: e.target.value })} className={input} />
                <input placeholder="Country" value={addrForm.country} onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })} className={input} />
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input type="checkbox" checked={addrForm.is_default || false} onChange={(e) => setAddrForm({ ...addrForm, is_default: e.target.checked })} /> Set as default
                </label>
                <div className="flex gap-3 sm:col-span-2">
                  <button className="btn-shine rounded-full bg-brand-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800">Save Address</button>
                  <button type="button" onClick={() => setAddrForm(null)} className="rounded-full border border-brand-300 px-6 py-2.5 text-sm transition hover:bg-brand-50">Cancel</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setAddrForm({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'India', is_default: false })}
                className="w-full rounded-2xl border-2 border-dashed border-brand-300 py-4 text-sm font-semibold text-brand-600 hover:border-accent-500">
                + Add New Address
              </button>
            )}
          </div>
        )}

        {tab === 2 && (
          <form onSubmit={changePassword} className="max-w-md space-y-5 reveal rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
            <div><label className="text-sm font-semibold">Current password</label><input type="password" required value={pwd.current_password} onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })} className={input} /></div>
            <div><label className="text-sm font-semibold">New password</label><input type="password" required minLength="6" value={pwd.new_password} onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })} className={input} /></div>
            <div><label className="text-sm font-semibold">Confirm new password</label><input type="password" required value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} className={input} /></div>
            {pwdMsg && <Alert type={pwdMsg.type}>{pwdMsg.text}</Alert>}
            <button className="btn-shine rounded-full bg-brand-900 px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md">Change Password</button>
          </form>
        )}

        {tab === 3 && (
          <div className="space-y-4">
            {requests.length === 0 && <p className="rounded-2xl border border-dashed border-brand-300 bg-white p-8 text-center text-sm text-brand-500">No custom design requests yet.</p>}
            {requests.map((r) => (
              <div key={r.id} className="card-lift rounded-2xl border border-brand-200 bg-white p-5 text-sm shadow-soft">
                <div className="flex justify-between"><span className="font-semibold capitalize">{r.furniture_type} for {r.room_type?.replace(/_/g, ' ')}</span><span className="text-xs rounded-full bg-brand-100 px-2 py-0.5 font-bold uppercase">{r.status.replace(/_/g, ' ')}</span></div>
                <p className="mt-1 text-xs text-brand-500">{r.dimensions} · {r.material} · Budget ₹{Number(r.budget || 0).toLocaleString('en-IN')}</p>
                {r.admin_notes && <p className="mt-2 rounded-lg bg-brand-50 p-3 text-xs text-brand-700"><strong>Our notes:</strong> {r.admin_notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
