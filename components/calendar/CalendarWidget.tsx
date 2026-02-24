"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Phone, FileText, CheckCircle2, XCircle, Trash2 } from "lucide-react";

export default function CalendarWidget() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Form states
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [formParams, setFormParams] = useState({
        customer_name: "",
        phone: "",
        notes: ""
    });
    const [cancelId, setCancelId] = useState("");

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchData = async (date: Date) => {
        setLoading(true);
        try {
            const dateStr = date.toISOString().split('T')[0];

            // Fetch availability
            const availRes = await fetch(`/api/calendar/availability?date=${dateStr}&durationMin=30`);
            const availData = await availRes.json();
            if (availRes.ok) setAvailableSlots(availData.free_slots || []);

            // Fetch appointments for the day
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const apptRes = await fetch(`/api/calendar/appointments?from=${startOfDay.toISOString()}&to=${endOfDay.toISOString()}`);
            const apptData = await apptRes.json();
            if (apptRes.ok) setAppointments(apptData.appointments || []);
        } catch (error) {
            console.error("Error fetching calendar data:", error);
            showToast("Failed to fetch calendar data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(selectedDate);

        // Polling every 10 seconds to keep UI synced with Assistants
        const interval = setInterval(() => {
            fetchData(selectedDate);
        }, 10000);

        return () => clearInterval(interval);
    }, [selectedDate]);

    // Calendar generation logic
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendarGrid = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];
        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

        // Empty cells for alignment
        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const isToday = new Date().toDateString() === date.toDateString();
            const isSelected = selectedDate.toDateString() === date.toDateString();
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

            days.push(
                <button
                    key={i}
                    disabled={isPast}
                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium transition-all
                        ${isSelected ? 'bg-purple-600 text-white' : ''}
                        ${!isSelected && isToday ? 'border border-purple-500 text-purple-400' : ''}
                        ${!isSelected && !isToday && !isPast ? 'hover:bg-white/10 text-zinc-300' : ''}
                        ${isPast ? 'text-zinc-700 cursor-not-allowed' : ''}
                    `}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-white">{monthNames[month]} {year}</span>
                    <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                        <div key={d} className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 justify-items-center">
                    {days}
                </div>
            </div>
        );
    };

    const handleCreateAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot || !formParams.customer_name) return;

        try {
            const res = await fetch('/api/calendar/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: formParams.customer_name,
                    phone: formParams.phone,
                    start_time: selectedSlot.start_time,
                    duration_min: 30,
                    notes: formParams.notes
                })
            });

            const data = await res.json();
            if (res.ok) {
                showToast("Randevu başarıyla oluşturuldu", "success");
                setFormParams({ customer_name: "", phone: "", notes: "" });
                setSelectedSlot(null);
                fetchData(selectedDate);
            } else {
                showToast(data.error || "Randevu oluşturulamadı", "error");
            }
        } catch (error) {
            showToast("Bir hata oluştu", "error");
        }
    };

    const handleCancelAppointment = async (id: string = cancelId) => {
        if (!id) return;
        try {
            const res = await fetch('/api/calendar/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointment_id: id })
            });

            const data = await res.json();
            if (res.ok) {
                showToast("Randevu iptal edildi", "success");
                setCancelId("");
                fetchData(selectedDate);
            } else {
                showToast(data.error || "Randevu iptal edilemedi", "error");
            }
        } catch (error) {
            showToast("Bir hata oluştu", "error");
        }
    };

    const formatTime = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="w-full bg-zinc-900/50 border border-white/10 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden">
            {toast && (
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 z-50 animate-in slide-in-from-top-4 fade-in ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {toast.message}
                </div>
            )}

            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                    <CalendarIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Asistan Takvim Modülü</h3>
                    <p className="text-sm text-zinc-400">Canlı olarak asistanların okuyup yazabileceği paylaşımlı takvim</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* CALENDAR VIEW */}
                <div className="lg:col-span-4 bg-black/40 rounded-3xl p-6 border border-white/5 h-fit">
                    {renderCalendarGrid()}
                </div>

                {/* DAY DETAILS */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-black/40 rounded-3xl border border-white/5 p-6 flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-bold text-lg text-white">
                                {selectedDate.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h4>
                            {loading && <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* AVAILABLE SLOTS */}
                            <div>
                                <h5 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <Clock className="w-4 h-4" /> Boş Saatler
                                </h5>
                                <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {availableSlots.length === 0 && !loading && (
                                        <p className="col-span-3 text-sm text-zinc-500 italic">Boş saat bulunamadı.</p>
                                    )}
                                    {availableSlots.map((slot, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`p-2 rounded-xl text-sm font-medium transition-all ${selectedSlot === slot ? 'bg-purple-600 text-white' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
                                        >
                                            {formatTime(slot.start_time)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* APPOINTMENTS */}
                            <div>
                                <h5 className="text-sm font-semibold text-emerald-400/80 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <CheckCircle2 className="w-4 h-4" /> Mevcut Randevular
                                </h5>
                                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {appointments.length === 0 && !loading && (
                                        <p className="text-sm text-zinc-500 italic">Planlanmış randevu yok.</p>
                                    )}
                                    {appointments.map((appt) => (
                                        <div key={appt.id} className={`p-4 rounded-xl border relative group ${appt.status === 'cancelled' ? 'bg-red-500/5 border-red-500/20 opacity-60' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-sm font-bold ${appt.status === 'cancelled' ? 'text-red-400 line-through' : 'text-emerald-400'}`}>
                                                    {formatTime(appt.startTime)} - {formatTime(appt.endTime)}
                                                </span>
                                                {appt.status !== 'cancelled' && (
                                                    <button onClick={() => handleCancelAppointment(appt.id)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="text-white font-medium text-sm">{appt.customerName}</div>
                                            {appt.phone && <div className="text-xs text-zinc-400 mt-1">{appt.phone}</div>}
                                            <div className="text-[10px] text-zinc-500 font-mono mt-2 truncate">ID: {appt.id}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MANUAL TEST FORMS */}
                    <div className="bg-purple-900/10 rounded-3xl border border-purple-500/20 p-6">
                        <h4 className="font-bold text-sm text-purple-300 mb-4 uppercase tracking-widest flex items-center gap-2">
                            <User className="w-4 h-4" /> Manuel Test Paneli
                        </h4>

                        {selectedSlot ? (
                            <form onSubmit={handleCreateAppointment} className="space-y-4">
                                <div className="bg-purple-500/20 text-purple-200 p-3 rounded-xl border border-purple-500/30 text-sm font-medium flex justify-between items-center">
                                    <span>Seçilen Saat: {formatTime(selectedSlot.start_time)}</span>
                                    <button type="button" onClick={() => setSelectedSlot(null)} className="text-white/50 hover:text-white"><XCircle className="w-4 h-4" /></button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input required placeholder="Ad Soyad" value={formParams.customer_name} onChange={e => setFormParams({ ...formParams, customer_name: e.target.value })} className="bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500" />
                                    <input placeholder="Telefon" value={formParams.phone} onChange={e => setFormParams({ ...formParams, phone: e.target.value })} className="bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500" />
                                </div>
                                <textarea placeholder="Notlar (opsiyonel)" value={formParams.notes} onChange={e => setFormParams({ ...formParams, notes: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 h-20 resize-none"></textarea>
                                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-purple-600/20">
                                    Randevu Oluştur
                                </button>
                            </form>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center bg-black/20 rounded-xl border border-dashed border-white/10">
                                <span className="text-sm text-zinc-500">Randevu oluşturmak için yukarıdan bir boş saat seçin.</span>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-purple-500/10">
                            <div className="flex gap-2">
                                <input placeholder="İptal edilecek Randevu ID'si" value={cancelId} onChange={e => setCancelId(e.target.value)} className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" />
                                <button onClick={() => handleCancelAppointment()} disabled={!cancelId} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors">
                                    İptal Et
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
