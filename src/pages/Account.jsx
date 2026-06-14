import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useOrdersStore, usePrescriptionsStore, usePreferencesStore } from '../store/index.js';
import { formatCurrency, getInitials } from '../utils/helpers.js';
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Gift,
  Heart,
  MapPin,
  PackageCheck,
  Power,
  ShoppingBag,
  Star,
  Truck,
  UserRound,
  WalletCards,
} from 'lucide-react';

const Account = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { orders } = useOrdersStore();
  const { prescriptions } = usePrescriptionsStore();
  const { savedAddresses } = usePreferencesStore();
  const [activeTab, setActiveTab] = useState('orders');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [firstName = '', ...restName] = (user.name || 'MediCart User').split(' ');
  const lastName = restName.join(' ');
  const avatarImage = user?.image || user?.avatar;
  const getOrderTotal = (order) => {
    const subtotal = order.subtotal ?? (order.items || []).reduce((sum, item) => {
      const unitPrice = Number(item.price ?? item.b2bPrice ?? item.retailPrice ?? 0);
      return sum + unitPrice * Number(item.quantity || 1);
    }, 0);

    return order.totalAmount ?? Math.max(subtotal - (order.discount || 0), 0) + (order.delivery || 0) + (order.gst || 0);
  };
  const formatOrderDate = (value) => {
    if (!value) return 'Date not available';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  const totalOrderValue = orders.reduce((sum, order) => sum + getOrderTotal(order), 0);

  const menuGroups = [
    {
      title: 'My Orders',
      icon: PackageCheck,
      items: [{ id: 'orders', label: 'Orders', count: orders.length }],
      standalone: true,
    },
    {
      title: 'Account Settings',
      icon: UserRound,
      items: [
        { id: 'profile', label: 'Profile Information' },
        { id: 'addresses', label: 'Manage Addresses', count: savedAddresses.length },
        { id: 'prescriptions', label: 'Prescription Information', count: prescriptions.length },
      ],
    },
    {
      title: 'Payments',
      icon: WalletCards,
      items: [
        { id: 'gift-cards', label: 'Gift Cards', meta: '₹0' },
        { id: 'upi', label: 'Saved UPI' },
        { id: 'cards', label: 'Saved Cards' },
      ],
    },
    {
      title: 'My Stuff',
      icon: CreditCard,
      items: [
        { id: 'coupons', label: 'My Coupons' },
        { id: 'reviews', label: 'My Reviews & Ratings' },
        { id: 'notifications', label: 'All Notifications' },
        { id: 'wishlist', label: 'My Wishlist' },
      ],
    },
  ];

  const renderContent = () => {
    if (activeTab === 'orders') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">Order history</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">My Orders</h2>
              <p className="mt-2 text-sm text-slate-500">Track recent purchases, totals, and delivery status from one place.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold text-slate-500">Orders</p>
                <p className="mt-1 text-lg font-extrabold text-slate-950">{orders.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold text-slate-500">Items</p>
                <p className="mt-1 text-lg font-extrabold text-slate-950">{orders.reduce((sum, order) => sum + (order.items?.length || 0), 0)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 max-sm:col-span-2">
                <p className="text-xs font-semibold text-slate-500">Total value</p>
                <p className="mt-1 text-lg font-extrabold text-slate-950">{formatCurrency(totalOrderValue)}</p>
              </div>
            </div>
          </div>
          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map(order => {
                const firstItem = order.items?.[0];
                const orderHref = firstItem ? `/order-details/${order.id}/${firstItem.id}` : '/track-order';
                const itemCount = order.items?.length || 0;
                const previewItems = (order.items || []).slice(0, 2).map(item => item.name).filter(Boolean).join(', ');
                const isB2BOrder = order.accountType === 'B2B';

                return (
                  <Link key={order.id} to={orderHref} className="group block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
                            <PackageCheck size={20} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-base font-extrabold text-slate-950">{order.orderNumber || `Order ${order.id}`}</p>
                            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                              <CalendarDays size={14} />
                              {formatOrderDate(order.createdAt)}
                            </p>
                          </div>
                          {isB2BOrder && (
                            <span className="rounded bg-slate-950 px-2.5 py-1 text-xs font-bold text-white">B2B</span>
                          )}
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded border border-slate-100 bg-slate-50 px-3 py-2">
                            <p className="text-xs font-semibold text-slate-500">Products</p>
                            <p className="mt-1 text-sm font-bold text-slate-950">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="rounded border border-slate-100 bg-slate-50 px-3 py-2">
                            <p className="text-xs font-semibold text-slate-500">Amount</p>
                            <p className="mt-1 text-sm font-bold text-slate-950">{formatCurrency(getOrderTotal(order))}</p>
                          </div>
                          <div className="rounded border border-slate-100 bg-slate-50 px-3 py-2">
                            <p className="text-xs font-semibold text-slate-500">Payment</p>
                            <p className="mt-1 text-sm font-bold text-slate-950">{order.paymentMethod || 'Online'}</p>
                          </div>
                        </div>
                        {previewItems && (
                          <p className="mt-3 truncate text-sm text-slate-600">{previewItems}{itemCount > 2 ? ` +${itemCount - 2} more` : ''}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 lg:block lg:border-t-0 lg:pt-0 lg:text-right">
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                          <Truck size={14} />
                          {order.status}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 transition group-hover:text-teal-800 lg:mt-4">
                          View details
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center">
              <ShoppingBag className="mb-4 text-teal-700" size={44} />
              <p className="font-bold text-slate-950">No orders yet</p>
              <p className="mt-2 max-w-sm text-sm text-slate-500">Your medicine and wellness purchases will appear here after checkout.</p>
              <Link to="/products" className="btn-primary mt-5 inline-flex h-11 items-center">Start shopping</Link>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'addresses') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">Address book</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Manage Addresses</h2>
              <p className="mt-2 text-sm text-slate-500">
                {user?.isB2B ? 'Your registered business address is saved here for B2B checkout.' : 'Saved delivery addresses are available during checkout.'}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
              <MapPin size={16} />
              {savedAddresses.length} saved
            </span>
          </div>
          {savedAddresses.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {savedAddresses.map(address => {
                const isBusinessAddress = address.source === 'business-profile';

                return (
                  <div key={address.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className={`grid h-11 w-11 place-items-center rounded-lg ${isBusinessAddress ? 'bg-slate-950 text-white' : 'bg-teal-50 text-teal-700'}`}>
                          {isBusinessAddress ? <Building2 size={21} /> : <MapPin size={21} />}
                        </span>
                        <div>
                          <p className="font-extrabold text-slate-950">{address.fullName || 'Saved address'}</p>
                          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{address.label || (isBusinessAddress ? 'Registered Business' : 'Delivery Address')}</p>
                        </div>
                      </div>
                      {isBusinessAddress && (
                        <span className="rounded bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">B2B</span>
                      )}
                    </div>
                    <div className="mt-5 space-y-3 text-sm text-slate-700">
                      <p className="font-semibold text-slate-950">{address.houseNumber}</p>
                      <p className="leading-6">{[address.area, address.city, address.state].filter(Boolean).join(', ')} {address.pincode}</p>
                      {address.landmark && <p className="text-slate-500">{address.landmark}</p>}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-sm">
                      <span className="font-bold text-slate-950">{address.mobile || 'No mobile added'}</span>
                      {isBusinessAddress && (
                        <Link to={`/b2b/edit/${user.businessProfile?.id}`} className="font-bold text-teal-700 hover:text-teal-800">Edit business details</Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center">
              <MapPin className="mb-4 text-teal-700" size={44} />
              <p className="font-bold text-slate-950">No saved addresses yet</p>
              <p className="mt-2 max-w-sm text-sm text-slate-500">Add an address during checkout or register your business for B2B delivery details.</p>
              <Link to={user?.isB2B ? '/b2b' : '/checkout'} className="btn-primary mt-5 inline-flex h-11 items-center">
                {user?.isB2B ? 'View B2B details' : 'Add during checkout'}
              </Link>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'prescriptions') {
      return (
        <div>
          <h2 className="mb-6 text-xl font-bold text-slate-950">Prescription Information</h2>
          {prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map(prescription => (
                <div key={prescription.id} className="border border-slate-200 bg-white p-4">
                  <p className="font-semibold text-slate-950">{prescription.fileName}</p>
                  <p className="mt-1 text-sm text-slate-500">{prescription.uploadedAt}</p>
                  <p className="mt-2 text-sm font-semibold text-blue-600">{prescription.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No prescriptions uploaded yet.</p>
          )}
        </div>
      );
    }

    return (
      <div>
        <section>
          <div className="mb-7 flex items-center gap-6">
            <h2 className="text-xl font-bold text-slate-950">Personal Information</h2>
            <button className="text-sm font-semibold text-blue-600">Edit</button>
          </div>
          <div className="grid max-w-xl gap-3 sm:grid-cols-2">
            <input value={firstName} readOnly className="h-12 border border-slate-300 bg-slate-50 px-4 text-sm text-slate-500 outline-none" />
            <input value={lastName || ' '} readOnly className="h-12 border border-slate-300 bg-slate-50 px-4 text-sm text-slate-500 outline-none" />
          </div>
          <div className="mt-7">
            <p className="mb-4 text-sm font-semibold text-slate-950">Your Gender</p>
            <div className="flex gap-8 text-slate-500">
              <label className="inline-flex items-center gap-3">
                <input type="radio" name="gender" className="h-4 w-4 accent-blue-600" />
                Male
              </label>
              <label className="inline-flex items-center gap-3">
                <input type="radio" name="gender" className="h-4 w-4 accent-blue-600" />
                Female
              </label>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-7 flex items-center gap-6">
            <h2 className="text-xl font-bold text-slate-950">Email Address</h2>
            <button className="text-sm font-semibold text-blue-600">Edit</button>
          </div>
          <input value={user.email || ''} readOnly className="h-12 w-full max-w-xs border border-slate-300 bg-slate-50 px-4 text-sm text-slate-500 outline-none" />
        </section>

        <section className="mt-14">
          <div className="mb-7 flex items-center gap-6">
            <h2 className="text-xl font-bold text-slate-950">Mobile Number</h2>
            <button className="text-sm font-semibold text-blue-600">Edit</button>
          </div>
          <input value={user.mobile ? `+91${user.mobile}` : ''} readOnly className="h-12 w-full max-w-xs border border-slate-300 bg-slate-50 px-4 text-sm text-slate-500 outline-none" />
        </section>

        <section className="mt-14 max-w-4xl">
          <h2 className="mb-7 text-xl font-bold text-slate-950">FAQs</h2>
          {[
            ['What happens when I update my email address (or mobile number)?', 'Your login email id (or mobile number) changes, likewise. You will receive all your account related communication on your updated email address (or mobile number).'],
            ['When will my MediCart account be updated with the new email address (or mobile number)?', 'It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes.'],
            ['What happens to my existing account when I update my email address (or mobile number)?', 'Updating your email address or mobile number does not invalidate your account. Your order history, saved information and personal details remain available.'],
            ['Does my seller account get affected when I update my email address?', 'MediCart uses a single account policy. Any changes will reflect in linked services as well.'],
          ].map(([question, answer]) => (
            <div key={question} className="mb-6">
              <h3 className="text-sm font-bold text-slate-950">{question}</h3>
              <p className="mt-4 text-sm leading-6 text-slate-800">{answer}</p>
            </div>
          ))}
          <button className="mt-5 block text-sm font-bold text-blue-600">Deactivate Account</button>
          <button className="mt-7 block text-sm font-bold text-pink-600">Delete Account</button>
        </section>

        <div className="relative -mx-8 mt-10 h-28 overflow-hidden bg-yellow-300">
          <div className="absolute bottom-0 left-0 h-10 w-full bg-yellow-400" />
          <div className="absolute bottom-0 left-24 h-8 w-[60%] rounded-t-[50%] bg-orange-300/60" />
          <div className="absolute right-28 top-5 h-0 w-0 rotate-45 border-b-[30px] border-l-[48px] border-t-[30px] border-b-transparent border-l-yellow-500 border-t-transparent" />
          <span className="absolute bottom-8 left-10 h-8 w-2 rounded-full bg-green-500" />
          <span className="absolute bottom-12 left-12 h-4 w-4 rounded-full bg-red-500" />
          <span className="absolute bottom-8 right-7 h-8 w-2 rounded-full bg-green-500" />
          <span className="absolute bottom-12 right-5 h-4 w-4 rounded-full bg-red-500" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 py-5">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 lg:grid-cols-[310px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
            {avatarImage ? (
              <img src={avatarImage} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-full bg-yellow-300 text-sm font-bold text-blue-600">
                {getInitials(user.name)}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-xs text-slate-900">Hello,</p>
              <p className="truncate font-bold text-slate-950">{user.name}</p>
            </div>
            </div>
            {user?.isB2B && (
              <div className="mt-4 rounded-lg bg-slate-950 px-4 py-3 text-white">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-200">B2B account</p>
                <p className="mt-1 truncate text-sm font-semibold">{user.businessProfile?.businessName || 'Business storefront active'}</p>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {menuGroups.map(group => {
              const GroupIcon = group.icon;
              if (group.standalone) {
                return (
                  <button
                    key={group.title}
                    onClick={() => setActiveTab('orders')}
                    className={`flex w-full items-center gap-4 border-b border-slate-100 px-5 py-5 text-left text-sm font-bold uppercase transition ${
                      activeTab === 'orders' ? 'bg-teal-50 text-teal-800' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <GroupIcon size={22} className={activeTab === 'orders' ? 'text-teal-700' : 'text-slate-500'} />
                    <span className="flex-1">{group.title}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-700">{orders.length}</span>
                    <ChevronRight size={21} />
                  </button>
                );
              }

              return (
                <div key={group.title} className="border-b border-slate-100 py-4">
                  <div className="mb-3 flex items-center gap-4 px-5 text-sm font-bold uppercase text-slate-500">
                    <GroupIcon size={22} className="text-slate-500" />
                    <span>{group.title}</span>
                  </div>
                  <div className="grid">
                    {group.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center justify-between px-[62px] py-3 text-left text-sm transition ${
                          activeTab === item.id ? 'bg-teal-50 font-bold text-teal-800' : 'text-slate-950 hover:bg-slate-50'
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.meta && <span className="text-sm font-bold text-green-600">{item.meta}</span>}
                        {item.count > 0 && !item.meta && <span className="text-xs font-bold text-slate-500">{item.count}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            <button onClick={handleLogout} className="flex w-full items-center gap-4 px-5 py-5 text-left text-sm font-bold uppercase text-slate-500 hover:bg-slate-50">
              <Power size={23} className="text-slate-500" />
              Logout
            </button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs shadow-sm">
            <p className="mb-3 font-bold text-slate-950">Frequently Visited:</p>
            <div className="flex gap-4 text-slate-500">
              <Link to="/track-order" className="hover:text-teal-700">Track Order</Link>
              <Link to="/faq" className="hover:text-teal-700">Help Center</Link>
            </div>
          </div>
        </aside>

        <main className="min-h-[760px] rounded-lg border border-slate-200 bg-white px-5 py-6 shadow-sm md:px-8">
          {['gift-cards', 'upi', 'cards', 'coupons', 'reviews', 'notifications', 'wishlist'].includes(activeTab) ? (
            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-950">
                {menuGroups.flatMap(group => group.items).find(item => item.id === activeTab)?.label}
              </h2>
              <div className="flex min-h-72 flex-col items-center justify-center text-center">
                {activeTab === 'wishlist' ? <Heart className="mb-4 text-blue-600" size={44} /> : activeTab === 'reviews' ? <Star className="mb-4 text-blue-600" size={44} /> : activeTab === 'notifications' ? <Bell className="mb-4 text-blue-600" size={44} /> : <Gift className="mb-4 text-blue-600" size={44} />}
                <p className="font-semibold text-slate-950">Nothing to show here yet.</p>
                <p className="mt-2 text-sm text-slate-500">Your account activity will appear here.</p>
              </div>
            </div>
          ) : renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Account;
