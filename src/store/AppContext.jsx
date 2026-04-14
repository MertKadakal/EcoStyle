import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import sweetalert from 'sweetalert2';

const AppContext = createContext(null);

function calcFee(startTime, stopTime) {
  const end = stopTime || Date.now();
  const elapsed = Math.floor((end - startTime) / 1000);
  if (elapsed <= 0) return 0;
  const units = Math.ceil(elapsed / (30 * 60));
  return units * 15;
}

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [locations, setLocations] = useState([]);
  const [bags, setBags] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [view, setView] = useState('login');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedBag, setSelectedBag] = useState(null);
  const [activeRentalId, setActiveRentalId] = useState(null);
  const [canStartRental, setCanStartRental] = useState(false);
  const [tick, setTick] = useState(0);

  // Firestore'dan gerçek zamanlı veri okuma
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), snapshot => {
      const dbUsers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setUsers(dbUsers);

      // Seed if empty
      if (dbUsers.length === 0) {
        INITIAL_USERS.forEach(u => setDoc(doc(db, 'users', u.id), u));
      }
    });

    const unsubLocs = onSnapshot(collection(db, 'locations'), snapshot => {
      const dbLocs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setLocations(dbLocs);

      if (dbLocs.length === 0) {
        INITIAL_LOCATIONS.forEach(l => setDoc(doc(db, 'locations', l.id), l));
      }
    });

    const unsubBags = onSnapshot(collection(db, 'bags'), snapshot => {
      const dbBags = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setBags(dbBags);

      if (dbBags.length === 0) {
        INITIAL_BAGS.forEach(b => setDoc(doc(db, 'bags', b.id), b));
      }
    });

    const unsubRentals = onSnapshot(collection(db, 'rentals'), snapshot => {
      const dbRentals = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setRentals(dbRentals);
    });

    return () => {
      unsubUsers();
      unsubLocs();
      unsubBags();
      unsubRentals();
    };
  }, []);

  // Kullanıcı değiştiğinde currentUser state'ini senkron tut
  useEffect(() => {
    if (currentUser) {
      const updatedUser = users.find(u => u.id === currentUser.id);
      if (updatedUser) setCurrentUser(updatedUser);
    }
  }, [users, currentUser]);

  // Global sayaç
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Aktif kiralamaları zaman aşımına uğratma kontrolü (Client side simulasyon)
  // Normalde Cloud Functions ile yapılmalıdır.
  useEffect(() => {
    rentals.forEach(async r => {
      if (r.status === 'active') {
        const elapsed = (Date.now() - r.startTime) / 1000;
        if (elapsed > 2 * 3600) {
          await updateDoc(doc(db, 'rentals', r.id), { status: 'overdue' });
        }
      }
    });
  }, [tick, rentals]);

  const login = useCallback((email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return false;
    setCurrentUser(user);
    
    // Check for admin email specifically
    const isAdmin = email.toLowerCase().trim() === 'admin@beykoz.com';
    setView(isAdmin ? 'admin' : 'home');

    // Daha önce açık kiralama var mı kontrolü
    const myRental = rentals.find(r => r.userId === user.id && (r.status === 'active' || r.status === 'overdue' || r.status === 'pending_return'));
    if (myRental) setActiveRentalId(myRental.id);
    return true;
  }, [users, rentals]);

  const register = useCallback(async (name, email, password) => {
    // Kullanıcı kontrolü
    if (users.find((u) => u.email === email)) {
      return { success: false, error: 'Bu e-posta zaten kullanımda!' };
    }

    try {
      const newId = `user_${Date.now()}`;
      const newUser = { id: newId, name, email, password, balance: 0, rentalHistory: [], emailVerified: false };

      await setDoc(doc(db, 'users', newId), newUser);

      setCurrentUser(newUser);
      setView('home');
      return { success: true };
    } catch (error) {
      console.error("Kayıt hatası:", error);
      return { success: false, error: 'Bir hata oluştu.' };
    }
  }, [users]);

  const updateUserName = useCallback(async (newName) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.id), { name: newName });
      setCurrentUser(prev => ({ ...prev, name: newName }));
      return true;
    } catch (error) {
      console.error("İsim güncelleme hatası:", error);
      return false;
    }
  }, [currentUser]);

  const deleteUser = useCallback(async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      return true;
    } catch (error) {
      console.error("Kullanıcı silme hatası:", error);
      return false;
    }
  }, []);

  const addUser = useCallback(async (userData) => {
    try {
      const newId = `user_${Date.now()}`;
      const newUser = {
        id: newId,
        balance: 0,
        rentalHistory: [],
        emailVerified: true,
        ...userData
      };
      await setDoc(doc(db, 'users', newId), newUser);
      return true;
    } catch (error) {
      console.error("Kullanıcı ekleme hatası:", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    sweetalert.fire({
      title: 'Çıkış Yapılıyor',
      text: 'Hesabınızdan çıkık yapmak istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet',
      cancelButtonText: 'İptal',
      confirmButtonColor: 'var(--danger)'
    }).then((result) => {
      if (result.isConfirmed) {
        setCurrentUser(null);
        setView('login');
        setSelectedLocation(null);
        setSelectedBag(null);
        setActiveRentalId(null);
      }
    });
  }, []);

  const startRental = useCallback(async (bagId) => {
    if (currentUser.balance < 0) {
      sweetalert.fire('Hata', 'Bakiyeniz eksiye düşmüştür. Lütfen önce bakiye yükleyin.', 'error');
      return null;
    }

    const bag = bags.find(b => b.id === bagId);
    const location = locations.find(l => l.id === bag.locationId);
    const rentalId = `Rent-${String(Math.floor(Math.random() * 900) + 100)}`;

    const rentalDoc = {
      id: rentalId,
      userId: currentUser.id,
      userName: currentUser.name,
      bagId,
      bagName: bag.name,
      locationName: location.name,
      startTime: Date.now(),
      status: 'active',
      fee: 0,
    };

    await setDoc(doc(db, 'rentals', rentalId), rentalDoc);
    await updateDoc(doc(db, 'bags', bagId), { available: false });

    setActiveRentalId(rentalId);
    setView('active-rental');
    return rentalDoc;
  }, [bags, currentUser, locations]);

  const requestReturn = useCallback(async (rentalId) => {
    await updateDoc(doc(db, 'rentals', rentalId), {
      status: 'pending_return',
      returnRequestTime: Date.now()
    });
  }, []);

  const confirmReturn = useCallback(async (rentalId) => {
    const rental = rentals.find(r => r.id === rentalId);
    if (!rental) return;

    const endTime = rental.returnRequestTime || Date.now();
    const fee = calcFee(rental.startTime, endTime);

    // Kiralama durumunu güncelle
    await updateDoc(doc(db, 'rentals', rentalId), {
      status: 'completed',
      fee,
      endTime: Date.now()
    });

    // Çantayı tekrar müsait yap
    await updateDoc(doc(db, 'bags', rental.bagId), { available: true });

    // Kullanıcı işlemini tamamla
    const userToUpdate = users.find(u => u.id === rental.userId);
    if (userToUpdate) {
      const historyItem = { ...rental, fee, status: 'completed', endTime: Date.now() };
      await updateDoc(doc(db, 'users', rental.userId), {
        balance: userToUpdate.balance - fee,
        rentalHistory: [...(userToUpdate.rentalHistory || []), historyItem]
      });
    }

    if (rental.userId === currentUser?.id) {
      setActiveRentalId(null);
      setView('profile');
    }
  }, [rentals, currentUser, users]);

  const cancelRental = useCallback(async (rentalId) => {
    const rental = rentals.find(r => r.id === rentalId);
    if (!rental) return;

    // Durumu iptal edildi yap
    await updateDoc(doc(db, 'rentals', rentalId), { status: 'cancelled' });
    // Çantayı müsait yap
    await updateDoc(doc(db, 'bags', rental.bagId), { available: true });

    if (rental.userId === currentUser?.id) {
      setActiveRentalId(null);
      setView('profile');
    }
  }, [rentals, currentUser]);

  const addLocation = useCallback(async (name, address) => {
    const locId = `loc_${Date.now()}`;
    await setDoc(doc(db, 'locations', locId), {
      id: locId,
      name,
      address,
      availableBags: 0
    });
  }, []);

  const addBag = useCallback(async (bagData) => {
    const bagId = `bag_${Date.now()}`;
    // Provide some default fallbacks just in case
    const mergedData = {
      type: 'STANDART',
      size: 'Standart / 25x30 cm',
      shape: 'Klasik',
      capacity: '5 kg',
      features: ['DAYANIKLI'],
      ...bagData,
    }

    await setDoc(doc(db, 'bags', bagId), {
      id: bagId,
      ...mergedData,
      available: true
    });
  }, []);

  const addBalance = useCallback(async (amount) => {
    if (!currentUser) return;
    const userToUpdate = users.find(u => u.id === currentUser.id);
    if (!userToUpdate) return;
    const newBalance = userToUpdate.balance + amount;
    await updateDoc(doc(db, 'users', currentUser.id), { balance: newBalance });
  }, [currentUser, users]);

  const getActiveRental = useCallback(() => {
    return rentals.find(r => r.id === activeRentalId);
  }, [rentals, activeRentalId]);

  return (
    <AppContext.Provider value={{
      users, currentUser, locations, bags, rentals,
      view, setView,
      selectedLocation, setSelectedLocation,
      selectedBag, setSelectedBag,
      activeRentalId, setActiveRentalId,
      canStartRental, setCanStartRental,
      tick,
      login, register, logout, updateUserName, deleteUser, addUser,
      startRental, requestReturn, confirmReturn, cancelRental,
      addLocation, addBag, addBalance, getActiveRental, calcFee,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

const INITIAL_USERS = [
  { id: 'admin', name: 'Admin', email: 'admin@beykoz.com', password: 'admin123', balance: 1000, rentalHistory: [], emailVerified: true },
];

const INITIAL_LOCATIONS = [
  { id: 'loc1', name: 'Beykoz Kütüphanesi', address: 'Beykoz, İstanbul', availableBags: 2 },
  { id: 'loc2', name: 'Kadıköy Kütüphanesi', address: 'Kadıköy, İstanbul', availableBags: 1 },
  { id: 'loc3', name: 'Beşiktaş Kütüphanesi', address: 'Beşiktaş, İstanbul', availableBags: 1 },
  { id: 'loc4', name: 'Beşiktaş Kütüphanesi', address: 'Beşiktaş, İstanbul', availableBags: 1 },
  { id: 'loc5', name: 'Beşiktaş Kütüphanesi', address: 'Beşiktaş, İstanbul', availableBags: 1 },
  { id: 'loc6', name: 'Beşiktaş Kütüphanesi', address: 'Beşiktaş, İstanbul', availableBags: 1 },
];

const INITIAL_BAGS = [
  { id: 'bag1', name: 'Smart Bag #1', locationId: 'loc1', available: true, type: 'STANDART', size: 'Standart / 25x30 cm', shape: 'Klasik', capacity: '5 kg', features: ['DAYANIKLI', 'YIKANABİLİR'] },
  { id: 'bag2', name: 'Smart Bag #2', locationId: 'loc1', available: true, type: 'STANDART', size: 'Standart / 25x30 cm', shape: 'Klasik', capacity: '5 kg', features: ['DAYANIKLI'] },
  { id: 'bag3', name: 'Smart Bag #3', locationId: 'loc2', available: true, type: 'STANDART', size: 'Standart / 25x30 cm', shape: 'Klasik', capacity: '5 kg', features: ['DAYANIKLI', 'SU GEÇİRMEZ'] },
  { id: 'bag4', name: 'Smart Bag #4', locationId: 'loc3', available: true, type: 'STANDART', size: 'Standart / 25x30 cm', shape: 'Klasik', capacity: '5 kg', features: ['DAYANIKLI'] },
];
