'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    getCountries,
    getAreas,
    createArea,
    searchBuildings,
    createOrGetBuilding,
    createOrGetUnit,
    finalizeRegistration,
} from './actions';

export default function RegisterMultiStepPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data State
    const [role, setRole] = useState('resident');
    const [photoUrl, setPhotoUrl] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneCode, setPhoneCode] = useState('+254'); // Default Kenya
    const [phoneNumber, setPhoneNumber] = useState('');

    // Step 2 & 3 State (Location)
    const [countries, setCountries] = useState<{ name: string }[]>([]);
    const [selectedCountry, setSelectedCountry] = useState('Kenya');

    const [areaQuery, setAreaQuery] = useState('');
    const [areas, setAreas] = useState<{ id: string, name: string }[]>([]);
    const [selectedArea, setSelectedArea] = useState('');

    // Step 4 State (Building)
    const [buildingQuery, setBuildingQuery] = useState('');
    const [buildings, setBuildings] = useState<any[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<any | null>(null);

    // Step 5 State (Unit)
    const [unitLabel, setUnitLabel] = useState('');

    // Fetch countries instantly
    useEffect(() => {
        getCountries().then(setCountries);
    }, []);

    // Fetch Areas explicitly when country changes
    useEffect(() => {
        if (selectedCountry) {
            getAreas(selectedCountry).then(setAreas);
        } else {
            setAreas([]);
        }
    }, [selectedCountry]);

    // Fetch Buildings explicitly when area query changes over an area
    useEffect(() => {
        if (selectedCountry && selectedArea && buildingQuery.length > 1) {
            const timeoutId = setTimeout(() => {
                searchBuildings(selectedCountry, selectedArea, buildingQuery).then(setBuildings);
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [buildingQuery, selectedCountry, selectedArea]);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Upload failed');
            }
            const { url } = await res.json();
            setPhotoUrl(url);
        } catch (err) {
            console.error("Failed to upload photo", err);
            setError("Image upload failed. Please try again.");
        }
        setLoading(false);
    };

    const nextStep = () => {
        setError(null);
        if (step === 1) {
            if (!photoUrl) return setError("Profile photo is required");
            if (!firstName || !lastName || !email || !password || !phoneNumber) return setError("Please fill all required fields.");
        }
        if (step === 2 && !selectedCountry) return setError("Select a country");
        if (step === 3 && !selectedArea) return setError("Select or create an area");
        if (step === 4 && !selectedBuilding) return setError("Select or create a building");

        setStep(s => s + 1);
    };

    const tryCreateArea = async () => {
        if (!areaQuery.trim()) return;
        setLoading(true);
        try {
            const newArea = await createArea(selectedCountry, areaQuery);
            setAreas([...areas, newArea]);
            setSelectedArea(newArea.name);
            setAreaQuery('');
            nextStep();
        } catch (err) {
            setError("Failed to create area");
        }
        setLoading(false);
    };

    const tryCreateBuilding = async () => {
        if (!buildingQuery.trim()) return;
        setLoading(true);
        try {
            const newBuilding = await createOrGetBuilding(buildingQuery, selectedCountry, selectedArea);
            setSelectedBuilding(newBuilding);
            setStep(5);
        } catch (err) {
            setError("Failed to generate intelligent building record.");
        }
        setLoading(false);
    };

    const finalize = async () => {
        if (!unitLabel.trim()) return setError("Unit label cannot be empty");
        setLoading(true);
        try {
            // First structurally mount the Unit explicitly formatting to rules
            const unit = await createOrGetUnit(selectedBuilding.id, unitLabel);

            // Synthesize the FormData to match server action signatures seamlessly
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('phone_number', `${phoneCode} ${phoneNumber}`);
            formData.append('profile_photo', photoUrl);
            formData.append('role', role);
            formData.append('building_id', selectedBuilding.id);
            formData.append('unit_id', unit.id);

            const result = await finalizeRegistration(formData);
            if (result && result.error) {
                setError(result.error);
                setLoading(false);
            }
            // If successful, the action will gracefully redirect
        } catch (err) {
            setError("Critical registration failure.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="w-16 h-16 bg-green-900 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm">
                    <span className="text-3xl text-white font-bold">H</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    {step === 1 && "Create your Profile"}
                    {step === 2 && "Select your Country"}
                    {step === 3 && "Where in the world?"}
                    {step === 4 && "Find Your Building"}
                    {step === 5 && "Nearly Home"}
                </h2>
                <div className="flex justify-center gap-2 mt-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`h-2 w-12 rounded-full transition-colors duration-500 ${step >= i ? 'bg-green-700' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/40 sm:rounded-3xl sm:px-10 border border-slate-100">
                    {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">{error}</div>}

                    {/* STEP 1: Personal Profile */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                            <div className="flex flex-col items-center gap-3">
                                <label className="relative cursor-pointer w-24 h-24 rounded-full border-2 border-dashed border-slate-300 hover:border-green-600 flex items-center justify-center bg-slate-50 overflow-hidden group transition-all">
                                    {photoUrl ? (
                                        <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl text-slate-400 group-hover:text-green-600 transition-colors">📷</span>
                                    )}
                                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} disabled={loading} />
                                </label>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Required Photo</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-colors" />
                                <input placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-colors" />
                            </div>

                            <div className="flex gap-2">
                                <select value={phoneCode} onChange={e => setPhoneCode(e.target.value)} className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-center focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 font-medium text-sm">
                                    <option value="+254">🇰🇪 +254</option>
                                    <option value="+234">🇳🇬 +234</option>
                                    <option value="+27">🇿🇦 +27</option>
                                    <option value="+255">🇹🇿 +255</option>
                                    <option value="+256">🇺🇬 +256</option>
                                    <option value="+233">🇬🇭 +233</option>
                                    <option value="+250">🇷🇼 +250</option>
                                    <option value="+251">🇪🇹 +251</option>
                                    <option value="+971">🇦🇪 +971</option>
                                    <option value="+44">🇬🇧 +44</option>
                                    <option value="+1">🇺🇸 +1</option>
                                </select>
                                <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600" />
                            </div>

                            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600" />
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600" />

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <label className="border border-slate-200 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 has-[:checked]:border-green-600 has-[:checked]:bg-green-50 transition-colors">
                                    <input type="radio" name="role" value="resident" checked={role === 'resident'} onChange={() => setRole('resident')} className="hidden" />
                                    <span className={`text-sm font-semibold ${role === 'resident' ? 'text-green-800' : 'text-slate-600'}`}>Resident</span>
                                </label>
                                <label className="border border-slate-200 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 has-[:checked]:border-green-600 has-[:checked]:bg-green-50 transition-colors">
                                    <input type="radio" name="role" value="manager" checked={role === 'manager'} onChange={() => setRole('manager')} className="hidden" />
                                    <span className={`text-sm font-semibold ${role === 'manager' ? 'text-green-800' : 'text-slate-600'}`}>Manager</span>
                                </label>
                            </div>

                            <button onClick={nextStep} disabled={loading} className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-green-800 hover:bg-green-900 transition-colors disabled:opacity-50">Continue</button>
                            <div className="text-center text-sm text-slate-500 mt-4">Already registered? <Link href="/login" className="text-green-700 font-medium">Sign in</Link></div>
                        </div>
                    )}

                    {/* STEP 2: Country Selection */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <p className="text-slate-500 text-sm mb-4">Choose the country where your building resides.</p>
                            <select
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                            >
                                <option value="" disabled>Select Country</option>
                                {countries.map(c => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setStep(1)} className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Back</button>
                                <button onClick={nextStep} className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-green-800 hover:bg-green-900 transition-colors">Next</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Area Type-Ahead */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <p className="text-slate-500 text-sm mb-4">Search for your area, city, or district in {selectedCountry}.</p>
                            <input
                                type="text"
                                placeholder="Start typing..."
                                value={areaQuery}
                                onChange={(e) => {
                                    setAreaQuery(e.target.value);
                                    setSelectedArea(''); // clear selection if typing
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                            />

                            {areas.filter(a => a.name.toLowerCase().includes(areaQuery.toLowerCase())).length > 0 ? (
                                <ul className="mt-2 divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                    {areas.filter(a => a.name.toLowerCase().includes(areaQuery.toLowerCase())).map(a => (
                                        <li key={a.id}
                                            onClick={() => { setSelectedArea(a.name); setAreaQuery(a.name); nextStep(); }}
                                            className="px-4 py-3 hover:bg-green-50 cursor-pointer font-medium text-slate-800 transition-colors"
                                        >
                                            📍 {a.name}
                                        </li>
                                    ))}
                                </ul>
                            ) : areaQuery.length > 2 && (
                                <div className="mt-4 p-4 rounded-xl border border-dashed border-green-300 bg-green-50 text-center">
                                    <p className="text-green-800 font-medium mb-3">"{areaQuery}" doesn't exist yet.</p>
                                    <button onClick={tryCreateArea} disabled={loading} className="py-2 px-4 bg-green-700 text-white rounded-lg font-semibold text-sm hover:bg-green-800 transition-colors">
                                        + Create this area
                                    </button>
                                </div>
                            )}

                            <div className="pt-4">
                                <button onClick={() => setStep(2)} className="w-full flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Back</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Building Intelligent Search & Gen */}
                    {step === 4 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <p className="text-slate-500 text-sm mb-4">You are in {selectedArea}, {selectedCountry}. Locate your building.</p>
                            <input
                                type="text"
                                placeholder="Search building name..."
                                value={buildingQuery}
                                onChange={(e) => setBuildingQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                            />

                            {buildings.length > 0 && (
                                <ul className="mt-2 divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                    {buildings.map(b => (
                                        <li key={b.id}
                                            onClick={() => { setSelectedBuilding(b); setStep(5); }}
                                            className="px-4 py-3 hover:bg-green-50 cursor-pointer flex justify-between items-center transition-colors"
                                        >
                                            <span className="font-medium text-slate-800">🏢 {b.name}</span>
                                            <span className="text-xs bg-slate-200 px-2 py-1 rounded-md text-slate-600 font-mono">#{b.building_code}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {buildingQuery.length > 2 && !buildings.find(b => b.name.toLowerCase() === buildingQuery.toLowerCase()) && (
                                <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
                                    <p className="text-slate-600 font-medium mb-3">Add "{buildingQuery}" to Hablock</p>
                                    <p className="text-xs text-slate-500 mb-4 px-4">Registering this building will instantly generate a unique building code for your community.</p>
                                    <button onClick={tryCreateBuilding} disabled={loading} className="py-2 px-6 bg-slate-800 text-white rounded-lg font-semibold text-sm hover:bg-slate-900 transition-colors">
                                        Register New Building
                                    </button>
                                </div>
                            )}

                            <div className="pt-4">
                                <button onClick={() => setStep(3)} className="w-full flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Back</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: Manual Unit Entry */}
                    {step === 5 && selectedBuilding && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
                                <h3 className="font-bold text-green-900">🏢 {selectedBuilding.name}</h3>
                                <p className="text-green-700 text-sm">{selectedBuilding.area}, {selectedBuilding.country}</p>
                            </div>

                            <p className="text-slate-500 text-sm mb-2">Enter your specific unit, apartment, or house number. We'll verify it and link it natively.</p>
                            <input
                                type="text"
                                placeholder="eg. 4B, 101, Penthouse"
                                value={unitLabel}
                                onChange={(e) => setUnitLabel(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-2xl font-black text-center text-slate-800 tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-green-500/20"
                            />

                            <div className="pt-6">
                                <button onClick={finalize} disabled={loading} className="w-full flex justify-center py-4 px-4 rounded-xl shadow-sm text-lg font-bold text-white bg-green-800 hover:bg-green-900 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 hover:shadow-lg">
                                    {loading ? 'Finalizing Setup...' : 'Enter the Community'}
                                </button>
                            </div>

                            <div className="pt-2">
                                <button onClick={() => setStep(4)} className="w-full flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 bg-transparent hover:bg-slate-50 transition-colors disabled:opacity-50">Wait, change building</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
