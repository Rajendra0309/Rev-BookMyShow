import { useState, useEffect } from 'react';
import { getUser } from '../services/authService';
import {
    getNotifications,
    markAsRead,
    deleteNotification,
    getRevenueReport,
    getOccupancyReport,
    getBookingReport
} from '../services/reportService';

/* ─── Tiny helpers ─────────────────────────────── */
const fmtCurrency = (n) =>
    '₹' + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/* ─── Sub-components ───────────────────────────── */

function SectionHeader({ title, icon }) {
    return (
        <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>{icon}</span>
            <h2 style={styles.sectionTitle}>{title}</h2>
        </div>
    );
}

function StatusBadge({ label, color }) {
    return (
        <span style={{ ...styles.badge, background: color }}>{label}</span>
    );
}

function EmptyState({ message }) {
    return (
        <div style={styles.emptyState}>
            <span style={{ fontSize: '2rem' }}>📭</span>
            <p style={{ marginTop: '0.5rem', color: '#888' }}>{message}</p>
        </div>
    );
}

/* ─── Notification Card ────────────────────────── */
function NotificationCard({ notif, onMarkRead, onDelete }) {
    const isUnread = notif.status === 'Unread';
    return (
        <div style={{ ...styles.notifCard, ...(isUnread ? styles.notifUnread : {}) }}>
            <div style={styles.notifBody}>
                <span style={styles.notifMsg}>{notif.message}</span>
                <span style={styles.notifTime}>{fmtDate(notif.createdAt)}</span>
            </div>
            <div style={styles.notifActions}>
                {isUnread && (
                    <button style={{ ...styles.btn, ...styles.btnPrimary }}
                        onClick={() => onMarkRead(notif._id)}>
                        Mark Read
                    </button>
                )}
                <button style={{ ...styles.btn, ...styles.btnDanger }}
                    onClick={() => onDelete(notif._id)}>
                    ✕
                </button>
            </div>
        </div>
    );
}

/* ─── Stat Card ─────────────────────────────────── */
function StatCard({ label, value, sub, color }) {
    return (
        <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
            <p style={styles.statLabel}>{label}</p>
            <p style={{ ...styles.statValue, color }}>{value}</p>
            {sub && <p style={styles.statSub}>{sub}</p>}
        </div>
    );
}

/* ─── Main Reports Page ─────────────────────────── */
export default function Reports() {
    const user = getUser();
    const isAdmin = user?.role === 'Admin';

    // Active tab: 'notifications' | 'revenue' | 'occupancy' | 'bookings'
    const [activeTab, setActiveTab] = useState('notifications');

    // Notifications state
    const [notifications, setNotifications] = useState([]);
    const [notifsLoading, setNotifsLoading] = useState(false);

    // Revenue state
    const [revData, setRevData] = useState(null);
    const [revLoading, setRevLoading] = useState(false);
    const [revFilter, setRevFilter] = useState({ startDate: '', endDate: '' });

    // Occupancy state
    const [occData, setOccData] = useState([]);
    const [occLoading, setOccLoading] = useState(false);

    // Booking report state
    const [bkData, setBkData] = useState(null);
    const [bkLoading, setBkLoading] = useState(false);
    const [bkFilter, setBkFilter] = useState({ startDate: '', endDate: '' });

    // Error banner
    const [error, setError] = useState('');

    /* -- Loaders -- */
    const loadNotifications = async () => {
        if (!user?.id) return;
        setNotifsLoading(true);
        try {
            const res = await getNotifications(user.id);
            setNotifications(res.data.data);
        } catch {
            setError('Failed to load notifications.');
        } finally {
            setNotifsLoading(false);
        }
    };

    const loadRevenue = async () => {
        setRevLoading(true);
        setError('');
        try {
            const res = await getRevenueReport(revFilter);
            setRevData(res.data.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load revenue report.');
        } finally {
            setRevLoading(false);
        }
    };

    const loadOccupancy = async () => {
        setOccLoading(true);
        setError('');
        try {
            const res = await getOccupancyReport();
            setOccData(res.data.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load occupancy report.');
        } finally {
            setOccLoading(false);
        }
    };

    const loadBookingReport = async () => {
        setBkLoading(true);
        setError('');
        try {
            const res = await getBookingReport(bkFilter);
            setBkData(res.data.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load booking report.');
        } finally {
            setBkLoading(false);
        }
    };

    /* -- On tab change, auto-load -- */
    useEffect(() => {
        setError('');
        if (activeTab === 'notifications') loadNotifications();
        if (activeTab === 'revenue') loadRevenue();
        if (activeTab === 'occupancy') loadOccupancy();
        if (activeTab === 'bookings') loadBookingReport();
    }, [activeTab]); // eslint-disable-line

    /* -- Notification actions -- */
    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, status: 'Read' } : n)
            );
        } catch { setError('Could not update notification.'); }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch { setError('Could not delete notification.'); }
    };

    /* -- Tab list -- */
    const tabs = [
        { key: 'notifications', label: '🔔 Notifications', forAll: true },
        { key: 'revenue', label: '💰 Revenue', forAll: false },
        { key: 'occupancy', label: '🏟️ Occupancy', forAll: false },
        { key: 'bookings', label: '📋 Bookings', forAll: false }
    ].filter(t => t.forAll || isAdmin);

    return (
        <div style={styles.page}>
            {/* Page Header */}
            <div style={styles.pageHeader}>
                <h1 style={styles.pageTitle}>{isAdmin ? '📊 Reports & Notifications' : '🔔 Notifications'}</h1>
                <p style={styles.pageSubtitle}>
                    {isAdmin ? 'Admin Dashboard — Revenue, Occupancy & Booking Analytics' : 'Your Notification Centre'}
                </p>
            </div>

            {/* Error banner */}
            {error && (
                <div style={styles.errorBanner}>
                    ⚠️ {error}
                    <button style={styles.closeBtn} onClick={() => setError('')}>✕</button>
                </div>
            )}

            {/* Tab Bar */}
            <div style={styles.tabBar}>
                {tabs.map(t => (
                    <button key={t.key}
                        style={{ ...styles.tabBtn, ...(activeTab === t.key ? styles.tabActive : {}) }}
                        onClick={() => setActiveTab(t.key)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ─── NOTIFICATIONS TAB ───────────────────────────── */}
            {activeTab === 'notifications' && (
                <div style={styles.section}>
                    <SectionHeader title="My Notifications" icon="🔔" />
                    {notifsLoading ? (
                        <p style={styles.loadingText}>Loading…</p>
                    ) : notifications.length === 0 ? (
                        <EmptyState message="No notifications yet." />
                    ) : (
                        <div>
                            {notifications.map(n => (
                                <NotificationCard key={n._id} notif={n}
                                    onMarkRead={handleMarkRead}
                                    onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ─── REVENUE REPORT TAB ──────────────────────────── */}
            {activeTab === 'revenue' && isAdmin && (
                <div style={styles.section}>
                    <SectionHeader title="Revenue Report" icon="💰" />

                    {/* Filters */}
                    <div style={styles.filterRow}>
                        <label style={styles.filterLabel}>From:</label>
                        <input type="date" style={styles.filterInput}
                            value={revFilter.startDate}
                            onChange={e => setRevFilter(p => ({ ...p, startDate: e.target.value }))} />
                        <label style={styles.filterLabel}>To:</label>
                        <input type="date" style={styles.filterInput}
                            value={revFilter.endDate}
                            onChange={e => setRevFilter(p => ({ ...p, endDate: e.target.value }))} />
                        <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={loadRevenue}>
                            Apply Filter
                        </button>
                    </div>

                    {revLoading ? (
                        <p style={styles.loadingText}>Loading…</p>
                    ) : !revData ? (
                        <EmptyState message="No revenue data found." />
                    ) : (
                        <>
                            {/* Stat Cards */}
                            <div style={styles.statsRow}>
                                <StatCard label="Total Revenue" value={fmtCurrency(revData.totalRevenue)}
                                    color="#22c55e" />
                                <StatCard label="Movies Earning" value={revData.revenueByMovie.length}
                                    color="#3b82f6" />
                                <StatCard label="Days with Bookings" value={revData.revenueByDate.length}
                                    color="#a855f7" />
                            </div>

                            {/* Revenue by Movie */}
                            {revData.revenueByMovie.length > 0 && (
                                <>
                                    <h3 style={styles.tableHeading}>Revenue by Movie</h3>
                                    <div style={styles.tableWrapper}>
                                        <table style={styles.table}>
                                            <thead>
                                                <tr style={styles.thead}>
                                                    <th style={styles.th}>Movie</th>
                                                    <th style={styles.th}>Bookings</th>
                                                    <th style={styles.th}>Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {revData.revenueByMovie.map((r, i) => (
                                                    <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                                                        <td style={styles.td}>{r.movieTitle}</td>
                                                        <td style={styles.td}>{r.bookingCount}</td>
                                                        <td style={{ ...styles.td, color: '#22c55e', fontWeight: 700 }}>
                                                            {fmtCurrency(r.revenue)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {/* Revenue by Date */}
                            {revData.revenueByDate.length > 0 && (
                                <>
                                    <h3 style={styles.tableHeading}>Daily Revenue</h3>
                                    <div style={styles.tableWrapper}>
                                        <table style={styles.table}>
                                            <thead>
                                                <tr style={styles.thead}>
                                                    <th style={styles.th}>Date</th>
                                                    <th style={styles.th}>Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {revData.revenueByDate.map((r, i) => (
                                                    <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                                                        <td style={styles.td}>{r.date}</td>
                                                        <td style={{ ...styles.td, color: '#22c55e', fontWeight: 700 }}>
                                                            {fmtCurrency(r.revenue)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ─── OCCUPANCY REPORT TAB ────────────────────────── */}
            {activeTab === 'occupancy' && isAdmin && (
                <div style={styles.section}>
                    <SectionHeader title="Theatre Occupancy Report" icon="🏟️" />
                    <div style={styles.filterRow}>
                        <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={loadOccupancy}>
                            🔄 Refresh
                        </button>
                    </div>

                    {occLoading ? (
                        <p style={styles.loadingText}>Loading…</p>
                    ) : occData.length === 0 ? (
                        <EmptyState message="No occupancy data found." />
                    ) : (
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.thead}>
                                        <th style={styles.th}>Movie</th>
                                        <th style={styles.th}>Theatre</th>
                                        <th style={styles.th}>Screen</th>
                                        <th style={styles.th}>City</th>
                                        <th style={styles.th}>Show Date</th>
                                        <th style={styles.th}>Time</th>
                                        <th style={styles.th}>Seats Booked</th>
                                        <th style={styles.th}>Total Seats</th>
                                        <th style={styles.th}>Occupancy %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {occData.map((r, i) => {
                                        const pct = r.occupancyPercentage;
                                        const barColor = pct >= 75 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';
                                        return (
                                            <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                                                <td style={styles.td}>{r.movieTitle}</td>
                                                <td style={styles.td}>{r.theatreName}</td>
                                                <td style={styles.td}>{r.screenName}</td>
                                                <td style={styles.td}>{r.city}</td>
                                                <td style={styles.td}>{fmtDate(r.showDate)}</td>
                                                <td style={styles.td}>{r.showTime}</td>
                                                <td style={styles.td}>{r.seatsBooked}</td>
                                                <td style={styles.td}>{r.totalSeats}</td>
                                                <td style={styles.td}>
                                                    <div style={{ ...styles.occBar, background: '#e5e7eb' }}>
                                                        <div style={{
                                                            width: `${pct}%`, height: '100%',
                                                            background: barColor, borderRadius: '4px',
                                                            transition: 'width 0.4s'
                                                        }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', color: barColor, fontWeight: 700 }}>
                                                        {pct}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ─── BOOKING & CANCELLATION REPORT TAB ───────────── */}
            {activeTab === 'bookings' && isAdmin && (
                <div style={styles.section}>
                    <SectionHeader title="Booking &amp; Cancellation Report" icon="📋" />

                    {/* Filters */}
                    <div style={styles.filterRow}>
                        <label style={styles.filterLabel}>From:</label>
                        <input type="date" style={styles.filterInput}
                            value={bkFilter.startDate}
                            onChange={e => setBkFilter(p => ({ ...p, startDate: e.target.value }))} />
                        <label style={styles.filterLabel}>To:</label>
                        <input type="date" style={styles.filterInput}
                            value={bkFilter.endDate}
                            onChange={e => setBkFilter(p => ({ ...p, endDate: e.target.value }))} />
                        <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={loadBookingReport}>
                            Apply Filter
                        </button>
                    </div>

                    {bkLoading ? (
                        <p style={styles.loadingText}>Loading…</p>
                    ) : !bkData ? (
                        <EmptyState message="No booking data found." />
                    ) : (
                        <>
                            {/* Stat Cards */}
                            <div style={styles.statsRow}>
                                <StatCard label="Total Bookings" value={bkData.totalBookings}
                                    color="#3b82f6" />
                                <StatCard label="Confirmed" value={bkData.confirmed}
                                    color="#22c55e" />
                                <StatCard label="Cancelled" value={bkData.cancelled}
                                    color="#ef4444" />
                                <StatCard label="Cancellation Rate"
                                    value={`${bkData.cancellationRate}%`}
                                    color={bkData.cancellationRate > 20 ? '#ef4444' : '#f59e0b'}
                                    sub="of total bookings" />
                            </div>

                            {/* Daily Breakdown */}
                            {bkData.dailyBreakdown.length > 0 && (
                                <>
                                    <h3 style={styles.tableHeading}>Daily Breakdown</h3>
                                    <div style={styles.tableWrapper}>
                                        <table style={styles.table}>
                                            <thead>
                                                <tr style={styles.thead}>
                                                    <th style={styles.th}>Date</th>
                                                    <th style={styles.th}>Confirmed</th>
                                                    <th style={styles.th}>Cancelled</th>
                                                    <th style={styles.th}>Total</th>
                                                    <th style={styles.th}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bkData.dailyBreakdown.map((r, i) => {
                                                    const total = r.confirmed + r.cancelled;
                                                    const cancelRate = total > 0
                                                        ? ((r.cancelled / total) * 100).toFixed(0)
                                                        : 0;
                                                    return (
                                                        <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                                                            <td style={styles.td}>{r.date}</td>
                                                            <td style={{ ...styles.td, color: '#22c55e' }}>{r.confirmed}</td>
                                                            <td style={{ ...styles.td, color: '#ef4444' }}>{r.cancelled}</td>
                                                            <td style={styles.td}>{total}</td>
                                                            <td style={styles.td}>
                                                                <StatusBadge
                                                                    label={cancelRate > 30 ? 'High Cancellations' : 'Normal'}
                                                                    color={cancelRate > 30 ? '#ef4444' : '#22c55e'} />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Inline Styles (matches the project's minimal Bootstrap-inspired look) ─ */
const styles = {
    page: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        fontFamily: "'Segoe UI', sans-serif",
        color: '#1e293b'
    },
    pageHeader: {
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e2e8f0'
    },
    pageTitle: {
        fontSize: '1.8rem',
        fontWeight: 700,
        margin: 0,
        color: '#0f172a'
    },
    pageSubtitle: {
        margin: '0.3rem 0 0',
        color: '#64748b',
        fontSize: '0.95rem'
    },
    errorBanner: {
        background: '#fef2f2',
        border: '1px solid #fca5a5',
        color: '#b91c1c',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#b91c1c',
        fontSize: '1rem'
    },
    tabBar: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
    },
    tabBtn: {
        padding: '0.5rem 1.2rem',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        background: '#f8fafc',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.9rem',
        color: '#475569',
        transition: 'all 0.2s'
    },
    tabActive: {
        background: '#1d4ed8',
        color: '#fff',
        borderColor: '#1d4ed8'
    },
    section: {
        background: '#fff',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)'
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginBottom: '1.2rem'
    },
    sectionIcon: { fontSize: '1.4rem' },
    sectionTitle: { margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' },
    filterRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
        marginBottom: '1.2rem',
        padding: '0.75rem',
        background: '#f8fafc',
        borderRadius: '8px'
    },
    filterLabel: { fontWeight: 600, fontSize: '0.85rem', color: '#475569' },
    filterInput: {
        padding: '0.4rem 0.6rem',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        fontSize: '0.88rem',
        outline: 'none'
    },
    btn: {
        padding: '0.4rem 0.9rem',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.85rem',
        transition: 'opacity 0.2s'
    },
    btnPrimary: { background: '#1d4ed8', color: '#fff' },
    btnDanger: { background: '#ef4444', color: '#fff' },
    statsRow: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
    },
    statCard: {
        flex: '1 1 160px',
        background: '#f8fafc',
        borderRadius: '10px',
        padding: '1rem',
        minWidth: '140px'
    },
    statLabel: { margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' },
    statValue: { margin: '0.4rem 0 0', fontSize: '1.6rem', fontWeight: 800 },
    statSub: { margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#94a3b8' },
    tableHeading: { fontSize: '1rem', fontWeight: 700, color: '#374151', marginBottom: '0.6rem' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
    thead: { background: '#1d4ed8', color: '#fff' },
    th: { padding: '0.65rem 0.9rem', textAlign: 'left', whiteSpace: 'nowrap' },
    td: { padding: '0.6rem 0.9rem', borderBottom: '1px solid #f1f5f9' },
    trEven: { background: '#fff' },
    trOdd: { background: '#f8fafc' },
    loadingText: { color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '1.5rem' },
    emptyState: { textAlign: 'center', padding: '2rem' },
    occBar: { width: '80px', height: '10px', borderRadius: '4px', display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' },
    notifCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        marginBottom: '0.6rem',
        background: '#f8fafc',
        border: '1px solid #e2e8f0'
    },
    notifUnread: {
        background: '#eff6ff',
        border: '1px solid #bfdbfe'
    },
    notifBody: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
    notifMsg: { fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' },
    notifTime: { fontSize: '0.78rem', color: '#94a3b8' },
    notifActions: { display: 'flex', gap: '0.4rem' },
    badge: {
        display: 'inline-block',
        padding: '0.2rem 0.55rem',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '0.72rem',
        fontWeight: 700
    }
};
